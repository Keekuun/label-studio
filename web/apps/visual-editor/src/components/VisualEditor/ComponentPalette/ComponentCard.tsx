import React from "react";
import {useDraggable} from "@dnd-kit/core";
import {Tooltip} from "antd";
import {ComponentMeta} from "../../../types";
import styles from "./ComponentPalette.module.scss";

interface ComponentCardProps {
  meta: ComponentMeta;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({meta}) => {
  const draggableId = `palette-${meta.type}`;
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: draggableId,
    data: {
      type: "palette-item",
      componentMeta: meta,
    },
  });

  // dynamic key access may trigger TS indexing error; cast styles to any
  const groupClass = meta.group ? (styles as any)[`${meta.group}Card`] ?? "" : "";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.componentCard} ${groupClass} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.componentIcon}>
        {meta.icon ? (
          <meta.icon/>
        ) : (
          <span className={styles.defaultIcon}>{meta.type.charAt(0)}</span>
        )}
      </div>
      <Tooltip title={meta.description}>
        <div className={styles.componentInfo}>
          <div className={styles.componentName}>
            {meta.displayName}
            <span className={styles.componentTag}>{meta.type}</span>
          </div>

          <div className={styles.componentDescription}>{meta.description}</div>
        </div>
      </Tooltip>
    </div>
  );
};
