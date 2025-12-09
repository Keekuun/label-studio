import React from "react";
import { useDroppable } from "@dnd-kit/core";
import styles from "./CanvasArea.module.scss";

interface DragHintProps {
  isOver: boolean;
}

export const DragHint: React.FC<DragHintProps> = ({ isOver }) => {
  if (!isOver) return null;

  return (
    <div className={styles.dragHint}>
      <div className={styles.dragHintContent}>
        <span>释放以添加组件</span>
      </div>
    </div>
  );
};

