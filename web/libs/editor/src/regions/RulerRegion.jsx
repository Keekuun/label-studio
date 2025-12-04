import Konva from "konva";
import { memo, useContext, useEffect, useMemo } from "react";
import { Group, Line, Text, Rect, Circle } from "react-konva";
import { destroy, detach, getRoot, isAlive, types } from "mobx-state-tree";
import { runInAction } from "mobx";

import Constants from "../core/Constants";
import NormalizationMixin from "../mixins/Normalization";
import RegionsMixin from "../mixins/Regions";
import Registry from "../core/Registry";
import { ImageModel } from "../tags/object/Image";
import { guidGenerator } from "../core/Helpers";
import { AreaMixin } from "../mixins/AreaMixin";
import { useRegionStyles } from "../hooks/useRegionColor";
import { KonvaRegionMixin } from "../mixins/KonvaRegion";
import { FF_DEV_3793, isFF } from "../utils/feature-flags";
import { RELATIVE_STAGE_HEIGHT, RELATIVE_STAGE_WIDTH } from "../components/ImageView/Image";
import { RegionWrapper } from "./RegionWrapper";
import { LabelOnPolygon } from "../components/ImageView/LabelOnRegion";
import { ImageViewContext } from "../components/ImageView/ImageViewContext";
import Utils from "../utils";
import { createDragBoundFunc } from "../utils/image";
import { AliveRegion } from "./AliveRegion.tsx";
import { EditableRegion } from "./EditableRegion";

/**
 * RulerRegion - 标尺区域，用于测量和显示线的长度及比例
 * 
 * 存储格式：
 * - x1, y1: 起点坐标（百分比）
 * - x2, y2: 终点坐标（百分比）
 * - length: 线的长度（像素）
 */
const RulerRegionAbsoluteCoordsDEV3793 = types
  .model({
    coordstype: types.optional(types.enumeration(["px", "perc"]), "perc"),
  })
  .volatile(() => ({
    relativeX1: 0,
    relativeY1: 0,
    relativeX2: 0,
    relativeY2: 0,
  }))
  .actions((self) => ({
    updateImageSize(wp, hp, sw, sh) {
      if (self.coordstype === "px") {
        const x1 = (sw * self.relativeX1) / RELATIVE_STAGE_WIDTH;
        const y1 = (sh * self.relativeY1) / RELATIVE_STAGE_HEIGHT;
        const x2 = (sw * self.relativeX2) / RELATIVE_STAGE_WIDTH;
        const y2 = (sh * self.relativeY2) / RELATIVE_STAGE_HEIGHT;

        self.x1 = x1;
        self.y1 = y1;
        self.x2 = x2;
        self.y2 = y2;
      }

      if (!self.annotation.sentUserGenerate && self.coordstype === "perc") {
        const x1 = (sw * self.x1) / RELATIVE_STAGE_WIDTH;
        const y1 = (sh * self.y1) / RELATIVE_STAGE_HEIGHT;
        const x2 = (sw * self.x2) / RELATIVE_STAGE_WIDTH;
        const y2 = (sh * self.y2) / RELATIVE_STAGE_HEIGHT;

        self.coordstype = "px";
        self.x1 = x1;
        self.y1 = y1;
        self.x2 = x2;
        self.y2 = y2;
      }
    },
  }));

// 计算两点之间的角度（度数，0-360）
const getAngleFromPoints = (x1, y1, x2, y2) => {
  const rad = Math.atan2(y2 - y1, x2 - x1);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
};

const Model = types
  .model({
    id: types.optional(types.identifier, guidGenerator),
    pid: types.optional(types.string, guidGenerator),
    type: "rulerregion",
    object: types.late(() => types.reference(ImageModel)),

    x1: types.number,
    y1: types.number,
    x2: types.number,
    y2: types.number,
    rotation: types.optional(types.number, 0),
    coordstype: types.optional(types.enumeration(["px", "perc"]), "perc"),
  })
  .volatile(() => ({
    hideable: true,
    _supportsTransform: true,
    useTransformer: true,
    preferTransformer: true,
    supportsRotate: true,
    supportsScale: true,
    isDrawing: false,
    startX: 0,
    startY: 0,
    editableFields: [
      { property: "x1", label: "X1" },
      { property: "y1", label: "Y1" },
      { property: "x2", label: "X2" },
      { property: "y2", label: "Y2" },
      { property: "rotation", label: "icon:angle" },
    ],
  }))
  .views((self) => ({
    get store() {
      return getRoot(self);
    },
    get x() {
      return Math.min(self.x1, self.x2);
    },
    get y() {
      return Math.min(self.y1, self.y2);
    },
    get bboxCoords() {
      if (!isAlive(self)) return {};

      const x1 = self.x1;
      const y1 = self.y1;
      const x2 = self.x2;
      const y2 = self.y2;

      return {
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        right: Math.max(x1, x2),
        bottom: Math.max(y1, y2),
      };
    },
    get canvasX() {
      const bbox = self.bboxCoords;
      return isFF(FF_DEV_3793) ? self.parent?.internalToCanvasX(bbox.left) ?? bbox.left : bbox.left;
    },
    get canvasY() {
      const bbox = self.bboxCoords;
      return isFF(FF_DEV_3793) ? self.parent?.internalToCanvasY(bbox.top) ?? bbox.top : bbox.top;
    },
    get canvasWidth() {
      const bbox = self.bboxCoords;
      const width = bbox.right - bbox.left;
      return isFF(FF_DEV_3793) ? self.parent?.internalToCanvasX(width) ?? width : width;
    },
    get canvasHeight() {
      const bbox = self.bboxCoords;
      const height = bbox.bottom - bbox.top;
      return isFF(FF_DEV_3793) ? self.parent?.internalToCanvasY(height) ?? height : height;
    },
    // 当前标尺在同类标尺中的索引，用于显示 Line-1/Line-2 等
    get lineIndex() {
      const rulers = self.parent?.regs?.filter((r) => r.type === "rulerregion") ?? [];
      return rulers.findIndex((r) => r.id === self.id);
    },
    // 所有标尺的整体比例字符串，例如 "1:2:3"
    get ratiosString() {
      const rulers = self.parent?.regs?.filter((r) => r.type === "rulerregion") ?? [];
      return calculateRatios(rulers) || "";
    },
    // 当前标尺在整体比例中的那一段，例如 "2"
    get selfRatio() {
      const ratios = self.ratiosString;
      if (!ratios) return "";
      const parts = ratios.split(":");
      const idx = self.lineIndex;
      if (idx < 0 || idx >= parts.length) return "";
      return parts[idx];
    },
    get length() {
      if (!isAlive(self) || !self.parent) return 0;

      const { naturalWidth, naturalHeight, stageWidth, stageHeight } = self.parent;
      if (!naturalWidth || !naturalHeight || !stageWidth || !stageHeight) return 0;

      // 根据坐标类型转换
      let px1, py1, px2, py2;

      if (self.coordstype === "perc") {
        // 百分比坐标转换为像素
        px1 = (self.x1 / 100) * naturalWidth;
        py1 = (self.y1 / 100) * naturalHeight;
        px2 = (self.x2 / 100) * naturalWidth;
        py2 = (self.y2 / 100) * naturalHeight;
      } else {
        // 像素坐标，需要根据 stage 尺寸转换
        px1 = (self.x1 / stageWidth) * naturalWidth;
        py1 = (self.y1 / stageHeight) * naturalHeight;
        px2 = (self.x2 / stageWidth) * naturalWidth;
        py2 = (self.y2 / stageHeight) * naturalHeight;
      }

      // 计算欧几里得距离
      const dx = px2 - px1;
      const dy = py2 - py1;
      return Math.sqrt(dx * dx + dy * dy);
    },
    get color() {
      // 根据 region 在列表中的位置分配颜色
      const regions = self.parent?.regs || [];
      const index = regions.findIndex((r) => r.id === self.id);
      const colors = [
        "#FF6B6B", // 红色
        "#4ECDC4", // 青色
        "#45B7D1", // 蓝色
        "#FFA07A", // 浅橙色
        "#98D8C8", // 薄荷绿
        "#F7DC6F", // 黄色
        "#BB8FCE", // 紫色
        "#85C1E2", // 天蓝色
      ];
      return colors[index % colors.length];
    },
  }))
  .actions((self) => ({
    afterCreate() {
      self.startX = self.x1;
      self.startY = self.y1;
      // 初始化角度
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      if (isFF(FF_DEV_3793)) {
        // 存储相对坐标
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (self.x1 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (self.y1 / stageHeight) * RELATIVE_STAGE_HEIGHT;
          self.relativeX2 = (self.x2 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = (self.y2 / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    setStartPoint(x, y) {
      self.x1 = x;
      self.y1 = y;
      self.startX = x;
      self.startY = y;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (x / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (y / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    setEndPoint(x, y) {
      self.x2 = x;
      self.y2 = y;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX2 = (x / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = (y / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    moveStartPoint(x, y) {
      // 将画布坐标转换为内部坐标
      // x, y 是 Konva 的 canvas 坐标（像素）
      // 直接更新坐标，确保实时响应
      let internalX, internalY;

      if (isFF(FF_DEV_3793)) {
        // FF_DEV_3793: 使用相对坐标系统
        internalX = self.parent?.canvasToInternalX(x) ?? x;
        internalY = self.parent?.canvasToInternalY(y) ?? y;
      } else {
        // 旧模式: 直接使用像素坐标
        internalX = x;
        internalY = y;
      }

      // 直接更新坐标，避免方法调用带来的延迟
      self.x1 = internalX;
      self.y1 = internalY;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      // 更新相对坐标（如果需要）
      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (internalX / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (internalY / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    moveEndPoint(x, y) {
      // 将画布坐标转换为内部坐标
      // x, y 是 Konva 的 canvas 坐标（像素）
      // 直接更新坐标，确保实时响应
      let internalX, internalY;

      if (isFF(FF_DEV_3793)) {
        // FF_DEV_3793: 使用相对坐标系统
        internalX = self.parent?.canvasToInternalX(x) ?? x;
        internalY = self.parent?.canvasToInternalY(y) ?? y;
      } else {
        // 旧模式: 直接使用像素坐标
        internalX = x;
        internalY = y;
      }

      // 直接更新坐标，避免方法调用带来的延迟
      self.x2 = internalX;
      self.y2 = internalY;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      // 更新相对坐标（如果需要）
      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX2 = (internalX / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = (internalY / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    setPositionInternal(x, y, width, height, rotation) {
      // TwoPointsDrawingTool 调用此方法
      // x, y 是起点（内部坐标），width 和 height 是终点相对于起点的偏移
      self.x1 = x;
      self.y1 = y;
      self.startX = x;
      self.startY = y;
      // width 和 height 是偏移量，需要加到起点得到终点
      self.x2 = x + width;
      self.y2 = y + height;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (x / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (y / stageHeight) * RELATIVE_STAGE_HEIGHT;
          self.relativeX2 = ((x + width) / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = ((y + height) / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    setPosition(x, y, width, height, rotation) {
      // Transformer 或拖动整个线时调用此方法
      // x, y 是新的 bounding box 左上角位置（画布坐标）
      // width, height 是新的 bounding box 尺寸（画布坐标）
      // rotation 是旋转角度（度）

      // 转换为内部坐标
      let internalX, internalY, internalWidth, internalHeight;

      if (isFF(FF_DEV_3793)) {
        internalX = self.parent?.canvasToInternalX(x) ?? x;
        internalY = self.parent?.canvasToInternalY(y) ?? y;
        internalWidth = self.parent?.canvasToInternalX(width) ?? width;
        internalHeight = self.parent?.canvasToInternalY(height) ?? height;
      } else {
        internalX = x;
        internalY = y;
        internalWidth = width;
        internalHeight = height;
      }

      // 使用对角线端点更新坐标（与 RectRegion 一致），角度由端点自动推导
      const newX1 = internalX;
      const newY1 = internalY;
      const newX2 = internalX + internalWidth;
      const newY2 = internalY + internalHeight;

      self.x1 = newX1;
      self.y1 = newY1;
      self.x2 = newX2;
      self.y2 = newY2;
      self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);

      // 更新相对坐标（如果需要）
      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (self.x1 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (self.y1 / stageHeight) * RELATIVE_STAGE_HEIGHT;
          self.relativeX2 = (self.x2 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = (self.y2 / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
    serialize() {
      // 序列化为 Label Studio 标准格式
      // 转换为百分比坐标（0-100）
      let x1 = self.x1;
      let y1 = self.y1;
      let x2 = self.x2;
      let y2 = self.y2;

      if (self.parent) {
        const { stageWidth, stageHeight } = self.parent;
        if (stageWidth && stageHeight) {
          if (self.coordstype === "px") {
            // 像素坐标转换为百分比
            x1 = (x1 / stageWidth) * 100;
            y1 = (y1 / stageHeight) * 100;
            x2 = (x2 / stageWidth) * 100;
            y2 = (y2 / stageHeight) * 100;
          } else if (isFF(FF_DEV_3793)) {
            // 如果使用相对坐标，需要转换
            x1 = self.relativeX1;
            y1 = self.relativeY1;
            x2 = self.relativeX2;
            y2 = self.relativeY2;
          }
        }
      }

      const value = {
        x1,
        y1,
        x2,
        y2,
        rotation: self.rotation || 0,
        coordstype: "perc",
      };

      return self.parent?.createSerializedResult ? self.parent.createSerializedResult(self, value) : value;
    },
    // 供 RegionEditor 使用：旋转字段被编辑时，按照长度不变、中心不变旋转线段
    setProperty(propName, value) {
      // 非 rotation 走 EditableRegion 的通用逻辑
      if (propName !== "rotation") {
        if (self.isPropertyEditable?.(propName)) {
          self[propName] = value;
          // 端点变更后，角度也需要保持正确
          if (["x1", "y1", "x2", "y2"].includes(propName)) {
            self.rotation = getAngleFromPoints(self.x1, self.y1, self.x2, self.y2);
          }
        } else {
          throw new Error(`Property ${propName} of model ${self.type} is not editable`);
        }
        return;
      }

      // rotation 被编辑：以线段中心为轴旋转，保持长度不变
      const angle = Number(value) || 0;
      const rad = (angle * Math.PI) / 180;

      // 当前中心和长度
      const centerX = (self.x1 + self.x2) / 2;
      const centerY = (self.y1 + self.y2) / 2;
      const halfDx = (self.x2 - self.x1) / 2;
      const halfDy = (self.y2 - self.y1) / 2;
      const halfLen = Math.sqrt(halfDx * halfDx + halfDy * halfDy) || 0;

      // 新方向向量
      const dirX = Math.cos(rad) * halfLen;
      const dirY = Math.sin(rad) * halfLen;

      self.x1 = centerX - dirX;
      self.y1 = centerY - dirY;
      self.x2 = centerX + dirX;
      self.y2 = centerY + dirY;
      self.rotation = ((angle % 360) + 360) % 360;

      // 同步相对坐标
      if (isFF(FF_DEV_3793)) {
        const { stageWidth, stageHeight } = self.parent || {};
        if (stageWidth && stageHeight) {
          self.relativeX1 = (self.x1 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY1 = (self.y1 / stageHeight) * RELATIVE_STAGE_HEIGHT;
          self.relativeX2 = (self.x2 / stageWidth) * RELATIVE_STAGE_WIDTH;
          self.relativeY2 = (self.y2 / stageHeight) * RELATIVE_STAGE_HEIGHT;
        }
      }
    },
  }));

const RulerRegionModel = types.compose(
  "RulerRegionModel",
  NormalizationMixin,
  RegionsMixin,
  AreaMixin,
  KonvaRegionMixin,
  EditableRegion,
  isFF(FF_DEV_3793) ? RulerRegionAbsoluteCoordsDEV3793 : types.model({}),
  Model,
);

/**
 * 计算所有标尺的比例
 */
function calculateRatios(regions) {
  if (regions.length < 2) return null;

  const lengths = regions.map((r) => r.length);
  const minLength = Math.min(...lengths);
  if (minLength === 0) return null; // 避免除以零

  const ratios = lengths.map((len) => len / minLength);

  // 尝试将比例简化为整数
  // 使用scaleFactor来获得整数比例
  const scaleFactor = 1000; // 放大倍数，以便处理浮点数
  const scaledRatios = ratios.map((r) => Math.round(r * scaleFactor));

  // 找到最大公约数来简化比例
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  let commonGcd = scaledRatios[0];
  for (let i = 1; i < scaledRatios.length; i++) {
    commonGcd = gcd(commonGcd, scaledRatios[i]);
  }

  // 如果commonGcd太小，可能导致比例过大，限制最小值为100
  const finalGcd = Math.max(commonGcd, 100);
  const simplified = scaledRatios.map((r) => Math.round(r / finalGcd));

  // 如果比例仍然太大，进一步简化
  const maxRatio = Math.max(...simplified);
  if (maxRatio > 100) {
    const reduceFactor = Math.ceil(maxRatio / 100);
    return simplified.map((r) => Math.round(r / reduceFactor)).join(":");
  }

  return simplified.join(":");
}

const RulerRegionView = ({ item }) => {
  // drawingRegion 被提交或删除后，可能仍有 React 节点持有旧引用，这里直接忽略已死亡节点，避免 MST 抛错
  if (!isAlive(item)) return null;

  const { store } = item;
  const { suggestion } = useContext(ImageViewContext) ?? {};
  const regionStyles = useRegionStyles(item, { suggestion });
  const { x1, y1, x2, y2, length, color } = item;

  // 获取所有标尺区域
  const allRulers = useMemo(() => {
    return item.parent?.regs?.filter((r) => r.type === "rulerregion") || [];
  }, [item.parent?.regs]);

  // 计算比例
  const ratios = useMemo(() => {
    return calculateRatios(allRulers);
  }, [allRulers]);

  // 当前线的索引
  const currentIndex = useMemo(() => {
    return allRulers.findIndex((r) => r.id === item.id);
  }, [allRulers, item.id]);

  // 转换为画布坐标
  const canvasX1 = isFF(FF_DEV_3793)
    ? item.parent?.internalToCanvasX(x1) ?? x1
    : x1;
  const canvasY1 = isFF(FF_DEV_3793)
    ? item.parent?.internalToCanvasY(y1) ?? y1
    : y1;
  const canvasX2 = isFF(FF_DEV_3793)
    ? item.parent?.internalToCanvasX(x2) ?? x2
    : x2;
  const canvasY2 = isFF(FF_DEV_3793)
    ? item.parent?.internalToCanvasY(y2) ?? y2
    : y2;

  // 文本位置（线的中点，稍微偏移以避免与线重叠）
  // 注意：文本标签现在在可拖动的 Group 内部，所以需要使用相对于 Group 的坐标
  const lineAngle = Math.atan2(canvasY2 - canvasY1, canvasX2 - canvasX1);
  const offsetX = Math.sin(lineAngle) * 20; // 垂直于线的方向偏移
  const offsetY = -Math.cos(lineAngle) * 20;
  
  // 计算相对于 Group 的坐标（Group 的位置是 item.canvasX, item.canvasY）
  // Line 的起点相对于 Group 是 (canvasX1 - item.canvasX, canvasY1 - item.canvasY)
  // Line 的终点相对于 Group 是 (canvasX2 - item.canvasX, canvasY2 - item.canvasY)
  // 所以文本标签的相对坐标是线段中点 + 偏移量
  const relativeX1 = canvasX1 - item.canvasX;
  const relativeY1 = canvasY1 - item.canvasY;
  const relativeX2 = canvasX2 - item.canvasX;
  const relativeY2 = canvasY2 - item.canvasY;
  const textX = (relativeX1 + relativeX2) / 2 + offsetX;
  const textY = (relativeY1 + relativeY2) / 2 + offsetY;

  // 格式化长度显示
  const formatLength = (len) => {
    if (len < 1) return `${Math.round(len * 10) / 10}px`;
    return `${Math.round(len)}px`;
  };

  // 构建显示文本
  let displayText = formatLength(length);
  let ratioText = "";
  if (allRulers.length > 1 && ratios) {
    const ratioParts = ratios.split(":");
    const currentRatio = ratioParts[currentIndex];
    displayText = `${displayText} (${currentRatio})`;
    if (currentIndex === 0) {
      ratioText = `Ratio: ${ratios}`;
    }
  }

  // 使用选中状态的颜色
  const strokeColor = item.selected ? regionStyles.strokeColor : color;
  const lineWidth = item.selected ? 3 : 2;

  // 检查是否是绘制状态且只点击了一个点（临时圆点状态）
  const isDrawingSinglePoint = item.isDrawing && Math.abs(canvasX1 - canvasX2) < 1 && Math.abs(canvasY1 - canvasY2) < 1;
  const isFinished = !item.isDrawing && !suggestion;
  const stage = item.parent?.stageRef;

  // 准备拖动和变换事件处理器
  const eventHandlers = {};
  const transformHandlers = {};

  if (isFinished && !item.isReadOnly() && !suggestion) {
    // Transformer 事件处理（与 RectRegion 保持一致，只在结束时提交变换）
    transformHandlers.onTransform = ({ target }) => {
      // 只重置 skew，不直接修改 MST 模型，避免在视图中写入受保护对象
      target.setAttr("skewX", 0);
      target.setAttr("skewY", 0);
    };

    transformHandlers.onTransformEnd = (e) => {
      if (!isAlive(item)) return;

      const t = e.target;
      const isFlipped = t.getAttr("scaleY") < 0;

      // 使用模型 action 提交变换，MST 允许在 action 中修改模型
      item.setPosition(
        t.getAttr("x"),
        t.getAttr("y"),
        t.getAttr("width") * t.getAttr("scaleX"),
        t.getAttr("height") * t.getAttr("scaleY"),
        t.getAttr("rotation"),
      );

      // 提交后把缩放复位，位置交给模型控制，避免视觉“回弹”
      t.setAttr("scaleX", 1);
      t.setAttr("scaleY", 1);

      if (isFlipped) {
        t.setAttr("rotation", item.rotation);
      }

      item.notifyDrawingFinished();
    };

    // 拖动事件处理（参考 Konva 示例）
    eventHandlers.onDragStart = (e) => {
      if (item.parent.getSkipInteractions()) {
        e.currentTarget.stopDrag(e.evt);
        return;
      }
      item.annotation.history.freeze(item.id);
    };

    // 拖动过程中实时更新位置，确保文本标签跟随移动
    eventHandlers.onDragMove = (e) => {
      if (!isAlive(item)) return;

      const t = e.target;

      // 实时更新模型位置，这样 textX 和 textY 会自动重新计算
      item.setPosition(
        t.getAttr("x"),
        t.getAttr("y"),
        t.getAttr("width") || item.canvasWidth,
        t.getAttr("height") || item.canvasHeight,
        t.getAttr("rotation") || item.rotation,
      );
    };

    eventHandlers.onDragEnd = (e) => {
      if (!isAlive(item)) return;

      const t = e.target;

      // 最终确认位置
      item.setPosition(
        t.getAttr("x"),
        t.getAttr("y"),
        t.getAttr("width") || item.canvasWidth,
        t.getAttr("height") || item.canvasHeight,
        t.getAttr("rotation") || item.rotation,
      );

      // 重置 Group 的位置
      t.position({ x: item.canvasX, y: item.canvasY });

      // 强制触发重新渲染，确保文本标签位置更新
      item.annotation.history.unfreeze(item.id);
      item.notifyDrawingFinished();

      // 确保 Konva 层重新绘制
      const stage = item.parent?.stageRef;
      if (stage) {
        stage.getLayer()?.batchDraw();
      }
    };

    eventHandlers.dragBoundFunc = createDragBoundFunc(item, {
      x: 0,
      y: 0,
    });
  }

  if (!item.parent) return null;
  if (!item.inViewPort) return null;

  return (
    <Group name={`${item.id}_group`}>
      {/* 主线条 - 只在完成绘制或正在绘制时显示 */}
      {!isDrawingSinglePoint && (
        <>
          {/* 可拖动的 Group，包含 Line 和 Circle，作为 Transformer 的目标 */}
          {isFinished ? (
            <Group
            name={`${item.id} _transformable`}
              x={item.canvasX}
              y={item.canvasY}
              draggable={!item.isReadOnly()}
              {...transformHandlers}
              {...eventHandlers}
              onClick={(e) => {
                if (item.parent.getSkipInteractions()) return;
                if (store.annotationStore.selected.isLinkingMode) {
                  const stage = item.parent?.stageRef;
                  if (stage) stage.container().style.cursor = Constants.DEFAULT_CURSOR;
                }
                item.setHighlight(false);
                item.onClickRegion(e);
              }}
              onMouseOver={() => {
                if (store.annotationStore.selected.isLinkingMode) {
                  item.setHighlight(true);
                }
                item.updateCursor(true);
              }}
              onMouseOut={() => {
                if (store.annotationStore.selected.isLinkingMode) {
                  item.setHighlight(false);
                }
                item.updateCursor();
              }}
              listening={!suggestion && !item.annotation?.isDrawing}
            >
              {/* 线条 */}
              <Line
                points={[relativeX1, relativeY1, relativeX2, relativeY2]}
                stroke={strokeColor}
                strokeWidth={lineWidth}
                lineCap="round"
                lineJoin="round"
                shadowBlur={item.selected ? 4 : 2}
                shadowColor={strokeColor}
                shadowOpacity={0.3}
                listening={false}
              />
              {/* 起点圆点（仅用于选中与提示，不可拖动） */}
              <Circle
                x={relativeX1}
                y={relativeY1}
                radius={5}
                fill={strokeColor}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                shadowBlur={2}
                shadowColor={strokeColor}
                shadowOpacity={0.5}
                draggable={false}
                onClick={(e) => {
                  if (item.parent.getSkipInteractions()) return;
                  e.cancelBubble = true;
                  if (store.annotationStore.selected.isLinkingMode) {
                    const stage = item.parent?.stageRef;
                    if (stage) stage.container().style.cursor = Constants.DEFAULT_CURSOR;
                  }
                  item.setHighlight(false);
                  item.onClickRegion(e);
                }}
                onMouseOver={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(true);
                  }
                  item.updateCursor(true);
                }}
                onMouseOut={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(false);
                  }
                  item.updateCursor();
                }}
                listening={!suggestion}
              />
              {/* 终点圆点（仅用于选中与提示，不可拖动） */}
              <Circle
                x={relativeX2}
                y={relativeY2}
                radius={5}
                fill={strokeColor}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                shadowBlur={2}
                shadowColor={strokeColor}
                shadowOpacity={0.5}
                draggable={false}
                onClick={(e) => {
                  if (item.parent.getSkipInteractions()) return;
                  e.cancelBubble = true;
                  if (store.annotationStore.selected.isLinkingMode) {
                    const stage = item.parent?.stageRef;
                    if (stage) stage.container().style.cursor = Constants.DEFAULT_CURSOR;
                  }
                  item.setHighlight(false);
                  item.onClickRegion(e);
                }}
                onMouseOver={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(true);
                  }
                  item.updateCursor(true);
                }}
                onMouseOut={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(false);
                  }
                  item.updateCursor();
                }}
                listening={!suggestion}
              />

              {/* 长度文本标签 */}
              <Group x={textX} y={textY} offsetX={0} offsetY={0}>
                <Rect
                  x={-60}
                  y={-12}
                  width={120}
                  height={ratioText ? 40 : 24}
                  fill="rgba(0, 0, 0, 0.75)"
                  opacity={0.9}
                  cornerRadius={6}
                  shadowBlur={4}
                  shadowColor="rgba(0, 0, 0, 0.3)"
                />
                <Text
                  x={0}
                  y={-8}
                  text={displayText}
                  fontSize={12}
                  fontFamily="Arial, sans-serif"
                  fontStyle="normal"
                  fill="#FFFFFF"
                  align="center"
                  width={120}
                  offsetX={60}
                />
                {ratioText && (
                  <Text
                    x={0}
                    y={8}
                    text={ratioText}
                    fontSize={11}
                    fontFamily="Arial, sans-serif"
                    fill="#E0E0E0"
                    align="center"
                    width={120}
                    offsetX={60}
                  />
                )}
              </Group>
            </Group>
          ) : (
            <>
              {/* 绘制中的线条 */}
              <Line
                points={[canvasX1, canvasY1, canvasX2, canvasY2]}
                stroke={strokeColor}
                strokeWidth={lineWidth}
                lineCap="round"
                lineJoin="round"
                shadowBlur={item.selected ? 4 : 2}
                shadowColor={strokeColor}
                shadowOpacity={0.3}
                listening={false}
              />
              {/* 起点圆点（绘制中） */}
              <Circle
                x={canvasX1}
                y={canvasY1}
                radius={6}
                fill={strokeColor}
                stroke="#FFFFFF"
                strokeWidth={2}
                shadowBlur={4}
                shadowColor={strokeColor}
                shadowOpacity={0.8}
                onClick={(e) => {
                  if (item.parent.getSkipInteractions()) return;
                  e.cancelBubble = true;
                  if (store.annotationStore.selected.isLinkingMode) {
                    const stage = item.parent?.stageRef;
                    if (stage) stage.container().style.cursor = Constants.DEFAULT_CURSOR;
                  }
                  item.setHighlight(false);
                  item.onClickRegion(e);
                }}
                onMouseOver={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(true);
                  }
                }}
                onMouseOut={() => {
                  if (store.annotationStore.selected.isLinkingMode) {
                    item.setHighlight(false);
                  }
                  item.updateCursor();
                }}
                listening={!suggestion}
              />
            </>
          )}
        </>
      )}
    </Group>
  );
};

const HtxRulerView = ({ item }) => {
  return (
    <RegionWrapper item={item}>
      <RulerRegionView item={item} />
    </RegionWrapper>
  );
};

const HtxRuler = AliveRegion(HtxRulerView);

Registry.addTag("rulerregion", RulerRegionModel, HtxRuler);
Registry.addRegionType(RulerRegionModel, "image", (value) => value.x1 !== undefined && value.x2 !== undefined);

export { RulerRegionModel, HtxRuler };

