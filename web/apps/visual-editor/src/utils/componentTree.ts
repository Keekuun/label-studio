import { ComponentNode } from "../types";
import { nanoid } from "nanoid";

/**
 * 在组件树中查找节点
 */
export function findNodeById(
  node: ComponentNode | null,
  id: string
): ComponentNode | null {
  if (!node) return null;
  if (node.id === id) return node;

  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }

  return null;
}

/**
 * 查找节点的父节点
 */
export function findParentNode(
  root: ComponentNode | null,
  targetId: string
): ComponentNode | null {
  if (!root) return null;

  // 检查直接子节点
  for (const child of root.children) {
    if (child.id === targetId) {
      return root;
    }
  }

  // 递归检查子节点
  for (const child of root.children) {
    const found = findParentNode(child, targetId);
    if (found) return found;
  }

  return null;
}

/**
 * 创建新的组件节点
 */
export function createComponentNode(
  type: string,
  category: "object" | "control" | "visual",
  attributes: Record<string, any> = {},
  parentId?: string
): ComponentNode {
  return {
    id: nanoid(),
    type,
    category,
    attributes,
    children: [],
    parentId,
    order: 0,
  };
}

/**
 * 克隆节点（递归克隆所有子节点并重新生成 ID）
 */
export function cloneNode(node: ComponentNode, newParentId?: string): ComponentNode {
  const clonedNode: ComponentNode = {
    id: nanoid(),
    type: node.type,
    category: node.category,
    attributes: { ...node.attributes },
    children: [],
    parentId: newParentId,
    order: node.order,
  };

  // 递归克隆子节点
  clonedNode.children = node.children.map((child, index) => {
    const clonedChild = cloneNode(child, clonedNode.id);
    clonedChild.order = index;
    return clonedChild;
  });

  return clonedNode;
}

/**
 * 添加子节点到父节点
 */
export function addChildNode(
  root: ComponentNode | null,
  parentId: string,
  newNode: ComponentNode
): ComponentNode | null {
  if (!root) return null;

  const parent = findNodeById(root, parentId);
  if (!parent) return null;

  // 设置新节点的父节点和顺序
  newNode.parentId = parentId;
  newNode.order = parent.children.length;

  // 创建新的根节点（不可变更新）
  return updateNodeInTree(root, parentId, {
    ...parent,
    children: [...parent.children, newNode],
  });
}

/**
 * 在组件树中更新节点
 */
export function updateNodeInTree(
  root: ComponentNode | null,
  nodeId: string,
  updatedNode: ComponentNode
): ComponentNode | null {
  if (!root) return null;
  if (root.id === nodeId) return updatedNode;

  return {
    ...root,
    children: root.children.map((child) =>
      child.id === nodeId
        ? updatedNode
        : updateNodeInTree(child, nodeId, updatedNode) || child
    ),
  };
}

/**
 * 从组件树中删除节点
 */
export function removeNodeFromTree(
  root: ComponentNode | null,
  nodeId: string
): ComponentNode | null {
  if (!root) return null;
  if (root.id === nodeId) return null;

  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== nodeId)
      .map((child) => removeNodeFromTree(child, nodeId) || child)
      .filter((child): child is ComponentNode => child !== null),
  };
}

/**
 * 移动节点到新位置
 */
export function moveNodeInTree(
  root: ComponentNode | null,
  nodeId: string,
  newParentId: string,
  newOrder: number
): ComponentNode | null {
  if (!root) return null;

  const node = findNodeById(root, nodeId);
  if (!node) return root;

  // 先从原位置删除
  let newRoot = removeNodeFromTree(root, nodeId);
  if (!newRoot) return null;

  // 找到新父节点
  const newParent = findNodeById(newRoot, newParentId);
  if (!newParent) return newRoot;

  // 更新新节点的父节点和顺序
  const movedNode: ComponentNode = {
    ...node,
    parentId: newParentId,
    order: newOrder,
  };

  // 调整新父节点下其他子节点的顺序
  const updatedChildren = [...newParent.children];
  updatedChildren.forEach((child, index) => {
    if (index >= newOrder) {
      child.order = index + 1;
    }
  });

  // 插入到新位置
  updatedChildren.splice(newOrder, 0, movedNode);

  // 更新树
  return updateNodeInTree(newRoot, newParentId, {
    ...newParent,
    children: updatedChildren,
  });
}

/**
 * 在同一父节点内重新排序节点
 */
export function reorderNodeInTree(
  root: ComponentNode | null,
  nodeId: string,
  newOrder: number
): ComponentNode | null {
  if (!root) return null;

  const node = findNodeById(root, nodeId);
  if (!node || !node.parentId) return root;

  const parent = findNodeById(root, node.parentId);
  if (!parent) return root;

  // 获取所有兄弟节点（排除当前节点）
  const siblings = parent.children.filter((child) => child.id !== nodeId);
  
  // 确保 newOrder 在有效范围内
  const clampedOrder = Math.max(0, Math.min(newOrder, siblings.length));

  // 插入到新位置
  siblings.splice(clampedOrder, 0, {
    ...node,
    order: clampedOrder,
  });

  // 更新所有兄弟节点的 order
  siblings.forEach((child, index) => {
    child.order = index;
  });

  // 更新父节点
  return updateNodeInTree(root, node.parentId, {
    ...parent,
    children: siblings,
  });
}

/**
 * 获取所有 Object 类型的组件（用于 toName 引用）
 */
export function getObjectComponents(
  root: ComponentNode | null
): ComponentNode[] {
  if (!root) return [];

  const objects: ComponentNode[] = [];
  const traverse = (node: ComponentNode) => {
    if (node.category === "object") {
      objects.push(node);
    }
    node.children.forEach(traverse);
  };

  traverse(root);
  return objects;
}

/**
 * 收集所有节点的 name 属性值
 */
export function getAllNames(root: ComponentNode | null): Set<string> {
  const names = new Set<string>();
  
  const traverse = (node: ComponentNode) => {
    if (node.attributes.name) {
      names.add(node.attributes.name);
    }
    node.children.forEach(traverse);
  };

  if (root) {
    traverse(root);
  }
  
  return names;
}

/**
 * 生成唯一的 name，如果已存在则添加后缀
 */
export function generateUniqueName(
  baseName: string,
  existingNames: Set<string>
): string {
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let counter = 1;
  let newName = `${baseName}-${counter}`;
  
  while (existingNames.has(newName)) {
    counter++;
    newName = `${baseName}-${counter}`;
  }
  
  return newName;
}

