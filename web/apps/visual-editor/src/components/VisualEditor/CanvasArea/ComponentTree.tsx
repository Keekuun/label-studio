import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ComponentNode } from "../../../types";
import { ComponentNodeItem } from "./ComponentNodeItem";

interface ComponentTreeProps {
  node: ComponentNode;
  depth?: number;
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  node,
  depth = 0,
}) => {
  // 获取所有子节点的 ID，用于 SortableContext
  const childIds = React.useMemo(() => {
    return node.children
      .sort((a, b) => a.order - b.order)
      .map((child) => child.id);
  }, [node.children]);

  return (
    <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
      <ComponentNodeItem node={node} depth={depth} />
    </SortableContext>
  );
};

