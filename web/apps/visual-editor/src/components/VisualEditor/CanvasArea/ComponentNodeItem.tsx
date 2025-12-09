import React from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DeleteOutlined, DragOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";
import { ComponentNode } from "../../../types";
import { useComponentTree } from "../../../hooks/useComponentTree";
import { validateDragOperation } from "../../../utils/constraintValidator";
import { findNodeById } from "../../../utils/componentTree";
import { getComponentMeta } from "../../../data/componentMetas";
import { ComponentTree } from "./ComponentTree";
import styles from "./CanvasArea.module.scss";
import {Popconfirm} from "antd";

interface ComponentNodeItemProps {
  node: ComponentNode;
  depth: number;
}

export const ComponentNodeItem: React.FC<ComponentNodeItemProps> = ({
  node,
  depth,
}) => {
  const { selectComponent, removeComponent, selectedNodeId, rootNode, moveComponent, toggleNodeExpanded, isNodeExpanded } = useComponentTree();
  const [canDrop, setCanDrop] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [dragOverPosition, setDragOverPosition] = React.useState<'top' | 'bottom' | 'inside' | null>(null);

  const isExpanded = isNodeExpanded(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // 使用 useSortable 实现排序功能
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({
    id: node.id,
    data: {
      type: "canvas-node",
      nodeId: node.id,
      node: node,
    },
  });

  // 使用 useDroppable 实现放置功能（用于从组件面板拖入）
  const droppableId = `canvas-node-drop-${node.id}`;
  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
    id: droppableId,
    data: {
      type: "canvas-node",
      nodeId: node.id,
    },
  });

  // 使用全局拖拽监听来检测是否悬停在当前节点上
  // 同时使用 useDroppable 的 isOver 和全局监听，确保嵌套结构也能正确检测
  const [isOverFromMonitor, setIsOverFromMonitor] = React.useState(false);

  // 合并两个检测结果
  const isOver = isDroppableOver || isOverFromMonitor;

  // 合并两个 ref
  const setNodeRef = React.useCallback(
    (element: HTMLElement | null) => {
      setSortableRef(element);
      setDroppableRef(element);
    },
    [setSortableRef, setDroppableRef]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting ? 0.5 : 1,
  };

  const isSelected = selectedNodeId === node.id;

  // 监听拖拽状态，验证是否可以放置
  useDndMonitor({
    onDragOver: (event) => {
      // 检查是否悬停在当前节点的 droppable 区域
      // 需要检查 event.over.id 是否匹配，或者 event.over.data 中的 nodeId 是否匹配
      let isCurrentlyOver = false;

      if (event.over) {
        // 直接匹配 droppable id
        if (event.over.id === droppableId) {
          isCurrentlyOver = true;
        }
        // 或者检查 data 中的 nodeId
        else if (event.over.data?.current?.nodeId === node.id) {
          isCurrentlyOver = true;
        }
        // 或者检查 id 是否以当前 droppableId 开头（处理嵌套情况）
        else if (typeof event.over.id === 'string' && event.over.id.startsWith(droppableId)) {
          isCurrentlyOver = true;
        }
      }

      setIsOverFromMonitor(isCurrentlyOver);

      // 如果既不是 droppableOver 也不是 monitorOver，则重置状态
      if (!isDroppableOver && !isCurrentlyOver) {
        setCanDrop(true);
        setDragOverPosition(null);
        return;
      }

      const activeData = event.active.data.current;
      let isValid = true;
      let position: 'top' | 'bottom' | 'inside' | null = 'inside';

      // 计算拖拽位置（顶部、底部或内部）
      // 使用鼠标位置和节点位置来判断
      if (event.over && event.over.rect) {
        const rect = event.over.rect;
        // 尝试从多个来源获取鼠标位置
        const mouseY = (event as any).activatorEvent?.clientY ||
                      (event as any).delta?.y !== undefined ? (rect.top + (event as any).delta.y) : null;

        if (mouseY && rect) {
          const rectTop = rect.top;
          const rectBottom = rect.bottom;
          const rectHeight = rectBottom - rectTop;
          const relativeY = mouseY - rectTop;

          // 如果拖拽在节点的上半部分（前30%），显示顶部指示
          if (relativeY < rectHeight * 0.3) {
            position = 'top';
          }
          // 如果拖拽在节点的下半部分（后30%），显示底部指示
          else if (relativeY > rectHeight * 0.7) {
            position = 'bottom';
          }
          // 否则显示内部指示
          else {
            position = 'inside';
          }
        }
      }

      // 如果无法计算位置，默认使用内部
      if (!position) {
        position = 'inside';
      }

      if (activeData?.type === "palette-item") {
        const componentMeta = activeData.componentMeta;
        const validation = validateDragOperation(componentMeta.type, node);
        isValid = validation.valid;
      } else if (activeData?.type === "canvas-node") {
        const movingNode = findNodeById(rootNode, activeData.nodeId);
        if (movingNode) {
          const validation = validateDragOperation(movingNode.type, node);
          isValid = validation.valid;
        } else {
          isValid = true;
        }
      } else {
        isValid = true;
      }

      setCanDrop(isValid);
      setDragOverPosition(isValid ? position : null);
    },
    onDragEnd: () => {
      setIsOverFromMonitor(false);
      setCanDrop(true);
      setDragOverPosition(null);
    },
    onDragStart: () => {
      // 拖拽开始时重置状态
      setIsOverFromMonitor(false);
      setCanDrop(true);
      setDragOverPosition(null);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(node.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeExpanded(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(node.id);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父组件
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡到父组件
    setIsHovered(false);
  };

  // 获取组件关键字段用于显示
  const getKeyFields = (node: ComponentNode): string[] => {
    const keyFields: string[] = [];
    const meta = getComponentMeta(node.type);

    // 根据组件类型确定关键字段
    if (meta?.category === 'object') {
      // Object 组件：name 和 value 最重要
      if (node.attributes.name) keyFields.push('name');
      if (node.attributes.value) keyFields.push('value');
    } else if (meta?.category === 'control') {
      // Control 组件：name 和 toName 最重要
      if (node.attributes.name) keyFields.push('name');
      if (node.attributes.toName) keyFields.push('toName');
    } else if (meta?.category === 'label-item') {
      // Label Item 组件：value 最重要
      if (node.attributes.value) keyFields.push('value');
      if (node.attributes.name && !keyFields.includes('name')) keyFields.unshift('name');
    } else {
      // Visual 组件：name 最重要（如果有）
      if (node.attributes.name) keyFields.push('name');
      // 其他重要字段
      if (node.attributes.value) keyFields.push('value');
      if (node.attributes.toName) keyFields.push('toName');
    }

    return keyFields;
  };

  // 渲染关键字段
  const renderKeyFields = () => {
    const keyFields = getKeyFields(node);
    if (keyFields.length === 0) return null;

    return (
      <span className={styles.nodeKeyFields}>
        {keyFields.map((field, index) => {
          const value = node.attributes[field];
          if (value === undefined || value === null || value === '') return null;

          // 对于 value 字段，如果太长则截断
          let displayValue = String(value);
          const maxLength = field === 'value' ? 25 : 20;
          if (displayValue.length > maxLength) {
            displayValue = displayValue.substring(0, maxLength - 3) + '...';
          }

          return (
            <span key={field} className={styles.nodeKeyField} title={`${field}="${value}"`}>
              {field}="{displayValue}"
            </span>
          );
        })}
      </span>
    );
  };

  // 根据拖拽位置生成样式类
  const getDragOverClass = () => {
    if (!isOver || isSorting) return '';
    if (!canDrop) return styles.dragOverInvalid;
    if (dragOverPosition === 'top') return styles.dragOverTop;
    if (dragOverPosition === 'bottom') return styles.dragOverBottom;
    return styles.dragOver;
  };

  return (
    <>
      {/* 顶部放置指示线 */}
      {isOver && canDrop && dragOverPosition === 'top' && (
        <div className={styles.dropIndicator} style={{ paddingLeft: (depth + 1) * 16 }} />
      )}
      <div
        ref={setNodeRef}
        className={`${styles.componentTreeNode} ${getDragOverClass()} ${isSelected ? styles.selected : ""} ${isSorting ? styles.sorting : ""} ${isHovered ? styles.hovered : ""}`}
        style={{ ...style, paddingLeft: 16 }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <div className={styles.nodeHeader}>
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title="拖拽排序"
        >
          <DragOutlined />
        </div>
        {hasChildren && (
          <button
            className={styles.expandButton}
            onClick={handleToggleExpand}
            title={isExpanded ? "折叠" : "展开"}
          >
            {isExpanded ? <DownOutlined /> : <RightOutlined />}
          </button>
        )}
        {!hasChildren && <span className={styles.expandPlaceholder} />}
        {(() => {
          const meta = getComponentMeta(node.type);
          const IconComponent = meta?.icon;
          return IconComponent ? (
            <IconComponent className={styles.nodeIcon} />
          ) : null;
        })()}
        <span className={styles.nodeType}>{node.type}</span>
        {renderKeyFields()}
        {(isHovered || isSelected) && (
          <Popconfirm
            title="删除组件"
            description="确定要删除这个组件吗？"
            onConfirm={handleDelete}
            onCancel={() => {}}
            okText="确认"
            cancelText="取消"
          >
            <button
              className={styles.deleteButton}
              title="删除组件 (Delete)"
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className={styles.nodeChildren}>
          {node.children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <ComponentTree key={child.id} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
      </div>
      {/* 底部放置指示线 */}
      {isOver && canDrop && dragOverPosition === 'bottom' && (
        <div className={styles.dropIndicator} style={{ paddingLeft: (depth + 1) * 20 }} />
      )}
    </>
  );
};

