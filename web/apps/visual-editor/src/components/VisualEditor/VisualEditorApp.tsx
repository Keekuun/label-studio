import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  pointerWithin
} from "@dnd-kit/core";
import {Modal, message} from "antd";
import {ComponentPalette} from "./ComponentPalette";
import {CanvasArea} from "./CanvasArea";
import {PropertiesPanel} from "./PropertiesPanel";
import {VisualPreviewPanel} from "./VisualPreviewPanel";
import {Toolbar} from "./Toolbar";
import {useComponentTree} from "../../hooks/useComponentTree";
import {useKeyboardShortcuts} from "../../hooks/useKeyboardShortcuts";
import {ComponentMeta} from "../../types";
import {validateDragOperation} from "../../utils/constraintValidator";
import {findNodeById} from "../../utils/componentTree";
import styles from "./VisualEditorApp.module.scss";

export const VisualEditorApp: React.FC = () => {
  const {
    addComponent,
    moveComponent,
    reorderComponent,
    removeComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedNodeId,
    rootNode
  } =
    useComponentTree();
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [activeDragMeta, setActiveDragMeta] = React.useState<ComponentMeta | null>(null);

  // 键盘快捷键
  useKeyboardShortcuts({
    onDelete: () => {
      if (selectedNodeId) {
        // 使用更友好的确认方式
        const confirmed = window.confirm("确定要删除选中的组件吗？");
        if (confirmed) {
          removeComponent(selectedNodeId);
        }
      }
    },
    onCopy: () => {
      if (selectedNodeId) {
        copyComponent(selectedNodeId);
        message.success("组件已复制");
      }
    },
    onPaste: () => {
      if (selectedNodeId) {
        // 粘贴到选中的组件下
        pasteComponent(selectedNodeId);
        message.success("组件已粘贴");
      } else if (rootNode) {
        // 如果没有选中组件，粘贴到根节点
        pasteComponent(rootNode.id);
        message.success("组件已粘贴");
      }
    },
    onUndo: () => {
      if (canUndo) {
        undo();
        message.success("已撤销");
      }
    },
    onRedo: () => {
      if (canRedo) {
        redo();
        message.success("已重做");
      }
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const {active} = event;
    const activeData = active.data.current;

    // 如果是从组件面板拖拽的，记录组件元数据
    if (activeData?.type === "palette-item" && activeData.componentMeta) {
      setActiveDragMeta(activeData.componentMeta);
    }
  };

  const handleDragOver = () => {
    // 可以在这里添加拖拽悬停效果和约束验证的视觉反馈
    // 目前约束验证在 handleDragEnd 中进行
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    const activeData = active.data.current;

    // 如果是从组件面板拖拽的
    if (activeData?.type === "palette-item") {
      const componentMeta = activeData.componentMeta;

      if (!over) {
        // 如果没有 over，说明可能是在画布区域释放但没有精确的 drop target
        // 默认添加到根节点（View）
        const validation = validateDragOperation(componentMeta.type, rootNode);
        if (!validation.valid) {
          message.warning(validation.message || "无法添加组件");
          return;
        }
        addComponent(
          componentMeta.type,
          componentMeta.category,
          {},
          rootNode?.id // 添加到根节点
        );
        return;
      }

      const overData = over.data.current;

      // 从组件面板拖拽到画布：创建新组件
      if (overData?.type === "canvas") {
        const validation = validateDragOperation(componentMeta.type, rootNode);
        if (!validation.valid) {
          message.warning(validation.message || "无法添加组件");
          return;
        }
        addComponent(
          componentMeta.type,
          componentMeta.category,
          {},
          rootNode?.id // 添加到根节点
        );
        return;
      }

      // 从组件面板拖拽到画布中的节点：添加到该节点
      if (overData?.type === "canvas-node") {
        const parentId = overData.nodeId;
        const parentNode = findNodeById(rootNode, parentId);

        // 验证约束
        const validation = validateDragOperation(componentMeta.type, parentNode);
        if (!validation.valid) {
          message.warning(validation.message || "无法添加组件");
          return;
        }

        addComponent(
          componentMeta.type,
          componentMeta.category,
          {},
          parentId
        );
        return;
      }
    }

    // 画布内拖拽：排序或移动组件位置
    if (activeData?.type === "canvas-node" && over) {
      const nodeId = activeData.nodeId;
      const overData = over.data.current;

      if (!overData) return;

      // 获取要移动的节点
      const movingNode = findNodeById(rootNode, nodeId);
      if (!movingNode) return;

      // 检查是否是排序操作（同一父节点内的排序）
      if (overData.type === "canvas-node") {
        // 如果拖拽到 drop zone（父节点），则添加到该节点
        if (overData.nodeId === nodeId) {
          // 拖拽到自己，不处理
          return;
        }

        const overNode = findNodeById(rootNode, overData.nodeId);
        if (!overNode) return;

        // 如果是同一父节点，进行排序
        if (movingNode.parentId === overNode.parentId && movingNode.parentId) {
          // 计算新位置
          const parent = findNodeById(rootNode, movingNode.parentId);
          if (!parent) return;

          const siblings = parent.children.filter((child) => child.id !== nodeId);
          const overIndex = siblings.findIndex((child) => child.id === overNode.id);
          const newOrder = overIndex >= 0 ? overIndex : siblings.length;

          reorderComponent(nodeId, newOrder);
          return;
        }

        // 如果不是同一父节点，进行移动（添加到 overNode 作为子节点）
        const newParentId = overData.nodeId;
        const newParentNode = findNodeById(rootNode, newParentId);

        if (newParentNode) {
          // 验证约束
          const validation = validateDragOperation(movingNode.type, newParentNode);
          if (!validation.valid) {
            message.warning(validation.message || "无法移动组件");
            return;
          }

          // 计算新位置（添加到末尾）
          const newOrder = newParentNode.children.length;
          moveComponent(nodeId, newParentId, newOrder);
          return;
        }
      }
    }
  };

  return (
    <>
      <DndContext
        collisionDetection={(args) => {
          // 首先使用 pointerWithin 检测鼠标指针是否在 droppable 区域内
          // 这对于嵌套结构更准确
          const pointerCollisions = pointerWithin(args);
          if (pointerCollisions.length > 0) {
            // 如果有多个碰撞，选择最内层的（id 最长的）
            return pointerCollisions.sort((a, b) => {
              const aId = String(a.id).length;
              const bId = String(b.id).length;
              return bId - aId; // 降序排列，最长的在前
            });
          }
          // 如果没有指针碰撞，使用 closestCenter 作为后备
          return closestCenter(args);
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className={styles.container}>
          {/* 顶部工具栏 */}
          <div className={styles.toolbar}>
            <Toolbar onOpenPreview={() => setPreviewVisible(true)}/>
          </div>

          {/* 主要内容区域 */}
          <div className={styles.mainContent}>
            {/* 左侧：组件面板 */}
            <div className={styles.palette}>
              <ComponentPalette/>
            </div>

            {/* 中间：画布区域 */}
            <div className={styles.canvas}>
              <CanvasArea/>
            </div>

            {/* 右侧：属性面板 */}
            <div className={styles.properties}>
              <PropertiesPanel/>
            </div>
          </div>

          {/* 拖拽预览层 */}
          <DragOverlay dropAnimation={{ duration: 0 }}>
            {activeDragMeta ? (
              <div className={styles.dragOverlayCard}>
                <div className={styles.dragOverlayIcon}>
                  {activeDragMeta.icon ? (
                    <activeDragMeta.icon/>
                  ) : (
                    <span>{activeDragMeta.type.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.dragOverlayInfo}>
                  <div className={styles.dragOverlayName}>{activeDragMeta.displayName}<span className={styles.dragOverlayTag}>{activeDragMeta.type}</span></div>
                  <div className={styles.dragOverlayDescription}>{activeDragMeta.description}</div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
      <Modal
        open={previewVisible}
        footer={null}
        title={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width={'80vw'}
        bodyStyle={{padding: 0, minHeight: 640, display: "flex", flexDirection: "column",}}
        destroyOnClose={false}
      >
        <div className={styles.previewModalContent} style={{width: "100%", height: "100%", minHeight: 640}}>
          <VisualPreviewPanel />
        </div>
      </Modal>
    </>
  );
};
