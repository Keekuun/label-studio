import React, { useMemo } from "react";
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

  const layoutColumns = useMemo(() => {
    const root = editorState.rootNode;
    if (!root || root.type !== "View") return 0;
    const style = (root.attributes?.style || "").toString().toLowerCase();
    const isFlex = style.includes("display: flex");
    const isColumnDir = style.includes("flex-direction: column");
    if (!isFlex || isColumnDir) return 0;
    const count = root.children.length;
    if (count >= 3) return 3;
    if (count === 2) return 2;
    return 0;
  }, [editorState.rootNode]);

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
        {layoutColumns > 0 && (
          <div className={styles.layoutPreview} data-cols={layoutColumns}>
            {Array.from({ length: layoutColumns }).map((_, idx) => (
              <div key={idx} className={styles.layoutColumn}>
                {layoutColumns === 2 ? (idx === 0 ? "左列" : "右列") : `列 ${idx + 1}`}
              </div>
            ))}
          </div>
        )}
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

