import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useAtom } from "jotai";
import { DragOutlined } from "@ant-design/icons";
import { editorStateAtom } from "../../../atoms/visualEditorAtoms";
import { ComponentTree } from "./ComponentTree";
import { DragHint } from "./DragHint";
import styles from "./CanvasArea.module.scss";

export const CanvasArea: React.FC = () => {
  const [editorState] = useAtom(editorStateAtom);
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: {
      type: "canvas",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.canvasArea} ${isOver ? styles.dragOver : ""}`}
    >
      <div className={styles.canvasHeader}>
        <h2>画布区域</h2>
        <p>拖拽组件到这里开始构建配置</p>
      </div>
      <div className={styles.canvasContent} style={{ position: "relative" }}>
        {isOver && <DragHint isOver={isOver} />}
        {editorState.rootNode ? (
          <ComponentTree node={editorState.rootNode} />
        ) : (
          <div className={styles.canvasEmpty}>
            <DragOutlined className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>开始构建配置</div>
            <div className={styles.emptyDescription}>
              从左侧组件面板拖拽组件到这里
            </div>
            <div className={styles.emptyHint}>
              提示：先添加容器类型组件（如 View），再添加 Object类型（如 Image），最后添加 Control 类型组件（如 RectangleLabels）
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

