import { types } from "mobx-state-tree";

import BaseTool, { DEFAULT_DIMENSIONS } from "./Base";
import ToolMixin from "../mixins/Tool";
import { TwoPointsDrawingTool } from "../mixins/DrawingTool";
import { AnnotationMixin } from "../mixins/AnnotationMixin";
import { NodeViews } from "../components/Node/Node";
import { FF_DEV_3793, isFF } from "../utils/feature-flags";
import { RELATIVE_STAGE_HEIGHT, RELATIVE_STAGE_WIDTH } from "../components/ImageView/Image";

const _BaseRulerTool = types
  .model("BaseRulerTool", {
    group: "segmentation",
    shortcut: "tool:ruler",
  })
  .views((self) => {
    const Super = {
      createRegionOptions: self.createRegionOptions,
      isIncorrectControl: self.isIncorrectControl,
      isIncorrectLabel: self.isIncorrectLabel,
      draw: self.draw,
    };

    return {
      get getActiveRuler() {
        const ruler = self.currentArea;

        if (ruler && ruler.type !== "rulerregion") return null;
        return ruler;
      },

      get tagTypes() {
        return {
          stateTypes: "rulerlabels",
          controlTagTypes: ["rulerlabels", "ruler"],
        };
      },
      get defaultDimensions() {
        return DEFAULT_DIMENSIONS.rect;
      },
      createRegionOptions({ x, y }) {
        return Super.createRegionOptions({
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          coordstype: "perc",
        });
      },

      isIncorrectControl() {
        return Super.isIncorrectControl() && self.current() === null;
      },
      isIncorrectLabel() {
        return !self.current() && Super.isIncorrectLabel();
      },
      canStart() {
        return self.current() === null && !self.annotation.isReadOnly();
      },

      current() {
        return self.getActiveRuler;
      },
    };
  })
  .actions((self) => {
    const Super = {
      commitDrawingRegion: self.commitDrawingRegion,
      draw: self.draw,
    };

    return {
      // 重写 draw 方法，保留实际坐标方向（不使用 reverseCoordinates）
      draw(x, y) {
        const shape = self.getCurrentArea();

        if (!shape) return;
        const maxStageWidth = isFF(FF_DEV_3793) ? RELATIVE_STAGE_WIDTH : self.obj.stageWidth;
        const maxStageHeight = isFF(FF_DEV_3793) ? RELATIVE_STAGE_HEIGHT : self.obj.stageHeight;

        // 直接使用实际坐标，不反转
        let x1 = shape.startX;
        let y1 = shape.startY;
        let x2 = x;
        let y2 = y;

        // 限制在画布范围内
        x1 = Math.max(0, Math.min(maxStageWidth, x1));
        y1 = Math.max(0, Math.min(maxStageHeight, y1));
        x2 = Math.max(0, Math.min(maxStageWidth, x2));
        y2 = Math.max(0, Math.min(maxStageHeight, y2));

        // 计算实际的偏移量（可以是负数）
        const distX = x2 - x1;
        const distY = y2 - y1;

        shape.setPositionInternal(x1, y1, distX, distY, shape.rotation);
      },

      beforeCommitDrawing() {
        const s = self.getActiveShape;
        if (!s) return false;

        const dx = s.x2 - s.x1;
        const dy = s.y2 - s.y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 最小长度检查（至少 0.5%）
        return distance > 0.5;
      },

      commitDrawingRegion() {
        const { currentArea, control, obj } = self;

        if (!currentArea) return;

        const value = {
          x1: currentArea.x1,
          y1: currentArea.y1,
          x2: currentArea.x2,
          y2: currentArea.y2,
          coordstype: "perc",
        };

        const region = self.annotation.createResult(value, {}, control, obj);

        currentArea.setDrawing(false);
        self.applyActiveStates(region);
        self.deleteRegion();
        region.notifyDrawingFinished();
        return region;
      },
    };
  });

const _Tool = types
  .model("RulerTool", {
    shortcut: "tool:ruler",
  })
  .views((self) => ({
    get viewTooltip() {
      return "Ruler";
    },
    get iconComponent() {
      return self.dynamic ? NodeViews.RulerRegionModel.altIcon : NodeViews.RulerRegionModel.icon;
    },
  }));

const Ruler = types.compose(
  _Tool.name,
  ToolMixin,
  BaseTool,
  TwoPointsDrawingTool,
  _BaseRulerTool,
  _Tool,
  AnnotationMixin,
);

export { Ruler };

