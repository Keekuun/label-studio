import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Tooltip } from "antd";
import { Template } from "../../../data/templates";
import styles from "./ComponentPalette.module.scss";

interface LayoutTemplateCardProps {
  template: Template;
}

export const LayoutTemplateCard: React.FC<LayoutTemplateCardProps> = ({ template }) => {
  const draggableId = `palette-template-${template.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableId,
    data: {
      type: "palette-template",
      template: template,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.componentCard} ${styles.containerCard} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.componentIcon}>
        <span className={styles.defaultIcon}>{template.icon || "🧱"}</span>
      </div>
      <Tooltip title={template.description}>
        <div className={styles.componentInfo}>
          <div className={styles.componentName}>
            {template.name}
            <span className={styles.componentTag}>Layout</span>
          </div>
          <div className={styles.componentDescription}>{template.description}</div>
        </div>
      </Tooltip>
    </div>
  );
};

