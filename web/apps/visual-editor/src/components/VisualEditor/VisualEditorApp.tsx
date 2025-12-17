import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  pointerWithin
} from "@dnd-kit/core";
import { message, Button } from "antd";
import { DoubleLeftOutlined, DoubleRightOutlined, EyeOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useAtom, useSetAtom } from "jotai";
import { ComponentPalette } from "./ComponentPalette";
import { CanvasArea } from "./CanvasArea";
import { PropertiesPanel } from "./PropertiesPanel";
import { Toolbar } from "./Toolbar";
import { FullscreenModal } from "../FullscreenModal";
import { PreviewPlayground } from "./PreviewPlayground";
import { useComponentTree } from "../../hooks/useComponentTree";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { ComponentMeta } from "../../types";
import { validateDragOperation } from "../../utils/constraintValidator";
import { findNodeById } from "../../utils/componentTree";
import { editorStateAtom } from "../../atoms/visualEditorAtoms";
import {
  configAtom,
  showPreviewAtom,
  previewConfigAtom,
  previewTaskDataAtom,
  taskDataAtom,
} from "../../atoms/configAtoms";
import { generateXMLFromNode, parseXMLToNode } from "../../utils/xmlConverter";
import { createComponentNode, addChildNode, cloneNode, getAllNames, generateUniqueName } from "../../utils/componentTree";
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
    rootNode,
    updateRootNode
  } =
    useComponentTree();
  const [editorState] = useAtom(editorStateAtom);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [activeDragMeta, setActiveDragMeta] = React.useState<ComponentMeta | null>(null);
  const [paletteWidth, setPaletteWidth] = useState(270);
  const [propertiesWidth, setPropertiesWidth] = useState(320);
  const [isPaletteCollapsed, setPaletteCollapsed] = useState(false);
  const [isPropertiesCollapsed, setPropertiesCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const setConfig = useSetAtom(configAtom);
  const setGlobalShowPreview = useSetAtom(showPreviewAtom);
  const setPreviewConfig = useSetAtom(previewConfigAtom);
  const setPreviewTaskData = useSetAtom(previewTaskDataAtom);
  const setTaskData = useSetAtom(taskDataAtom);

  const resizingRef = useRef<null | "left" | "right">(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // 生成 XML 配置
  const xmlConfig = useMemo(() => {
    if (!editorState.rootNode) {
      return "<View>\n  <!-- 拖拽组件到画布开始构建配置 -->\n</View>";
    }
    try {
      return generateXMLFromNode(editorState.rootNode);
    } catch (error) {
      console.error("XML 生成错误:", error);
      return "<View>\n  <!-- XML 生成错误 -->\n</View>";
    }
  }, [editorState.rootNode]);

  const handleTogglePreviewInline = useCallback(() => {
    if (xmlConfig) {
      setConfig(xmlConfig);
    }
    setShowPreview((v) => !v);
  }, [xmlConfig, setConfig]);

  // 处理预览中 XML 配置的变化（同步回画布）
  const handleConfigChange = React.useCallback((config: string) => {
    try {
      const parsedNode = parseXMLToNode(config);
      if (!parsedNode) {
        return;
      }

      let newRootNode = parsedNode;
      if (parsedNode.type !== "View") {
        newRootNode = createComponentNode("View", "visual", {}, undefined);
        newRootNode.children = [parsedNode];
        parsedNode.parentId = newRootNode.id;
        parsedNode.order = 0;
      }

      updateRootNode(newRootNode);
    } catch (error: any) {
      console.error("XML 同步错误:", error);
    }
  }, [updateRootNode]);

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

  const handleResizeStart = useCallback((side: "left" | "right", clientX: number) => {
    resizingRef.current = side;
    startXRef.current = clientX;
    startWidthRef.current = side === "left" ? paletteWidth : propertiesWidth;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }, [paletteWidth, propertiesWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      if (resizingRef.current === "left") {
        const next = Math.min(420, Math.max(200, startWidthRef.current + delta));
        setPaletteWidth(next);
      } else {
        const next = Math.min(480, Math.max(240, startWidthRef.current - delta));
        setPropertiesWidth(next);
      }
    };
    const onMouseUp = () => {
      resizingRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

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

    // 如果是从组件面板拖拽的模板
    if (activeData?.type === "palette-template") {
      const template = activeData.template;

      if (!over) {
        // 如果没有 over，默认添加到根节点（View）
        if (!rootNode) {
          message.warning("请先创建根节点");
          return;
        }
        try {
          const parsedNode = parseXMLToNode(template.xml);
          if (!parsedNode) {
            message.error("模板解析失败");
            return;
          }

          let updatedRoot = rootNode;
          const existingNames = getAllNames(rootNode);

          // 如果解析的节点是 View，将其子节点添加到根节点
          if (parsedNode.type === "View") {
            parsedNode.children.forEach((child) => {
              // 确保 name 属性唯一
              if (child.attributes.name) {
                child.attributes.name = generateUniqueName(
                  child.attributes.name,
                  existingNames
                );
                existingNames.add(child.attributes.name);
              }
              // 克隆子节点并设置新的父节点
              const clonedChild = cloneNode(child, updatedRoot.id);
              const newRoot = addChildNode(updatedRoot, updatedRoot.id, clonedChild);
              if (newRoot) {
                updatedRoot = newRoot;
              }
            });
            updateRootNode(updatedRoot);
            message.success(`已添加模板：${template.name}`);
          } else {
            // 如果不是 View，将整个节点作为单个组件添加
            const validation = validateDragOperation(parsedNode.type, rootNode);
            if (!validation.valid) {
              message.warning(validation.message || "无法添加组件");
              return;
            }
            // 确保 name 属性唯一
            if (parsedNode.attributes.name) {
              parsedNode.attributes.name = generateUniqueName(
                parsedNode.attributes.name,
                existingNames
              );
            }
            const clonedNode = cloneNode(parsedNode, rootNode.id);
            const newRoot = addChildNode(rootNode, rootNode.id, clonedNode);
            if (newRoot) {
              updateRootNode(newRoot);
              message.success(`已添加模板：${template.name}`);
            }
          }
        } catch (err) {
          console.error(err);
          message.error("模板解析失败");
        }
        return;
      }

      const overData = over.data.current;

      // 从组件面板拖拽到画布：添加到根节点
      if (overData?.type === "canvas") {
        if (!rootNode) {
          message.warning("请先创建根节点");
          return;
        }
        try {
          const parsedNode = parseXMLToNode(template.xml);
          if (!parsedNode) {
            message.error("模板解析失败");
            return;
          }

          let updatedRoot = rootNode;
          const existingNames = getAllNames(rootNode);

          // 如果解析的节点是 View，将其子节点添加到根节点
          if (parsedNode.type === "View") {
            parsedNode.children.forEach((child) => {
              // 确保 name 属性唯一
              if (child.attributes.name) {
                child.attributes.name = generateUniqueName(
                  child.attributes.name,
                  existingNames
                );
                existingNames.add(child.attributes.name);
              }
              // 克隆子节点并设置新的父节点
              const clonedChild = cloneNode(child, updatedRoot.id);
              const newRoot = addChildNode(updatedRoot, updatedRoot.id, clonedChild);
              if (newRoot) {
                updatedRoot = newRoot;
              }
            });
            updateRootNode(updatedRoot);
            message.success(`已添加模板：${template.name}`);
          } else {
            // 如果不是 View，将整个节点作为单个组件添加
            const validation = validateDragOperation(parsedNode.type, rootNode);
            if (!validation.valid) {
              message.warning(validation.message || "无法添加组件");
              return;
            }
            // 确保 name 属性唯一
            if (parsedNode.attributes.name) {
              parsedNode.attributes.name = generateUniqueName(
                parsedNode.attributes.name,
                existingNames
              );
            }
            const clonedNode = cloneNode(parsedNode, rootNode.id);
            const newRoot = addChildNode(rootNode, rootNode.id, clonedNode);
            if (newRoot) {
              updateRootNode(newRoot);
              message.success(`已添加模板：${template.name}`);
            }
          }
        } catch (err) {
          console.error(err);
          message.error("模板解析失败");
        }
        return;
      }

      // 从组件面板拖拽到画布中的节点：添加到该节点
      if (overData?.type === "canvas-node") {
        const parentId = overData.nodeId;
        const parentNode = findNodeById(rootNode, parentId);

        if (!parentNode) {
          message.warning("目标节点不存在");
          return;
        }

        try {
          const parsedNode = parseXMLToNode(template.xml);
          if (!parsedNode) {
            message.error("模板解析失败");
            return;
          }

          let updatedRoot = rootNode;
          const existingNames = getAllNames(rootNode);

          // 如果解析的节点是 View，将其子节点添加到目标节点
          if (parsedNode.type === "View") {
            parsedNode.children.forEach((child) => {
              // 验证约束
              const validation = validateDragOperation(child.type, parentNode);
              if (!validation.valid) {
                message.warning(`${child.type}: ${validation.message || "无法添加组件"}`);
                return;
              }
              // 确保 name 属性唯一
              if (child.attributes.name) {
                child.attributes.name = generateUniqueName(
                  child.attributes.name,
                  existingNames
                );
                existingNames.add(child.attributes.name);
              }
              // 克隆子节点并设置新的父节点
              const clonedChild = cloneNode(child, parentId);
              const newRoot = addChildNode(updatedRoot, parentId, clonedChild);
              if (newRoot) {
                updatedRoot = newRoot;
              }
            });
            updateRootNode(updatedRoot);
            message.success(`已添加模板：${template.name}`);
          } else {
            // 如果不是 View，将整个节点作为单个组件添加
            const validation = validateDragOperation(parsedNode.type, parentNode);
            if (!validation.valid) {
              message.warning(validation.message || "无法添加组件");
              return;
            }
            // 确保 name 属性唯一
            if (parsedNode.attributes.name) {
              parsedNode.attributes.name = generateUniqueName(
                parsedNode.attributes.name,
                existingNames
              );
            }
            const clonedNode = cloneNode(parsedNode, parentId);
            const newRoot = addChildNode(rootNode, parentId, clonedNode);
            if (newRoot) {
              updateRootNode(newRoot);
              message.success(`已添加模板：${template.name}`);
            }
          }
        } catch (err) {
          console.error(err);
          message.error("模板解析失败");
        }
        return;
      }
    }

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
            <Toolbar
              onOpenPreview={() => {
                // 打开预览弹窗前，将当前画布 XML 同步为预览配置
                setPreviewConfig(xmlConfig);
                // 重置任务数据，让预览根据最新 XML 自动生成一次样例数据
                setTaskData("");
                setPreviewTaskData(null);
                setPreviewVisible(true);
                setGlobalShowPreview(true);
              }}
            />
          </div>

          {/* 主要内容区域 */}
          <div className={styles.mainContent}>
            {/* 左侧：组件面板 */}
            <div
              className={`${styles.palette} ${isPaletteCollapsed ? styles.collapsed : ""}`}
              style={{ width: isPaletteCollapsed ? 24 : paletteWidth }}
              onClick={() => {
                if (showPreview) {
                  setShowPreview(false);
                }
              }}
            >
              {!isPaletteCollapsed && (
                <div className={styles.panelBody}>
                  <ComponentPalette/>
                </div>
              )}
              {!isPaletteCollapsed && (
                <div
                  className={styles.resizer}
                  onMouseDown={(e) => handleResizeStart("left", e.clientX)}
                  role="separator"
                  aria-orientation="vertical"
                />
              )}
            </div>

            {/* 中间：画布区域 */}
            <div className={styles.canvas}>
              <CanvasArea showPreview={showPreview} />
              {/* 切换按钮 - 固定在中间区域右下角 */}
              <Button
                type="dashed"
                size="middle"
                shape="circle"
                icon={showPreview ? React.createElement(AppstoreOutlined) : React.createElement(EyeOutlined)}
                onClick={handleTogglePreviewInline}
                className={styles.canvasToggleButton}
                style={{position: "absolute", bottom: 4, right: 4, borderRadius: "50%"}}
                title={showPreview ? "切换到画布视图" : "切换到预览视图"}
              />
            </div>

            {/* 右侧：属性面板 */}
            <div
              className={`${styles.properties} ${isPropertiesCollapsed ? styles.collapsed : ""}`}
              style={{ width: isPropertiesCollapsed ? 24 : propertiesWidth }}
              onClick={() => {
                if (showPreview) {
                  setShowPreview(false);
                }
              }}
            >
              {!isPropertiesCollapsed && (
                <div
                  className={styles.resizer}
                  onMouseDown={(e) => handleResizeStart("right", e.clientX)}
                  role="separator"
                  aria-orientation="vertical"
                />
              )}
              {!isPropertiesCollapsed && (
                <div className={styles.panelBody}>
                  <PropertiesPanel/>
                </div>
              )}
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
    <div className={styles.fixedToggleLeft}>
      <Button
        type="dashed"
        size="small"
        shape="circle"
        icon={isPaletteCollapsed ? React.createElement(DoubleRightOutlined) : React.createElement(DoubleLeftOutlined)}
        onClick={() => setPaletteCollapsed((v) => !v)}
        title={isPaletteCollapsed ? "展开组件面板" : "收起组件面板"}
        style={{ opacity: previewVisible ? 0 : 0.8 }}
      />
    </div>
    <div className={styles.fixedToggleRight}>
      <Button
        type="dashed"
        size="small"
        shape="circle"
        icon={isPropertiesCollapsed ? React.createElement(DoubleLeftOutlined) : React.createElement(DoubleRightOutlined)}
        onClick={() => setPropertiesCollapsed((v) => !v)}
        title={isPropertiesCollapsed ? "展开属性面板" : "收起属性面板"}
        style={{ opacity: previewVisible ? 0 : 0.8 }}
      />
    </div>
      <FullscreenModal
        open={previewVisible}
        footer={null}
        title={null}
        onCancel={() => setPreviewVisible(false)}
        fullscreen
        destroyOnClose={false}
      >
        <PreviewPlayground
          initialConfig={xmlConfig}
          onConfigChange={handleConfigChange}
        />
      </FullscreenModal>
    </>
  );
};
