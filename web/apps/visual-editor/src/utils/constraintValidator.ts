import { ComponentNode } from "../types";
import { getComponentMeta } from "../data/componentMetas";
import { findNodeById } from "./componentTree";

/**
 * 验证是否可以添加子组件
 * @param parentType 父组件类型
 * @param childType 子组件类型
 * @returns 是否可以添加
 */
export function canAddChild(parentType: string, childType: string): boolean {
  const parentMeta = getComponentMeta(parentType);
  if (!parentMeta?.allowedChildren) {
    return false;
  }
  return parentMeta.allowedChildren.includes(childType);
}

/**
 * 验证组件是否可以作为指定父组件的子组件
 * @param childType 子组件类型
 * @param parentType 父组件类型
 * @returns 是否可以添加
 */
export function canBeChildOf(childType: string, parentType: string): boolean {
  const childMeta = getComponentMeta(childType);
  if (!childMeta?.allowedParents) {
    // 如果没有父组件约束，则检查父组件是否允许该子组件
    return canAddChild(parentType, childType);
  }
  return childMeta.allowedParents.includes(parentType);
}

/**
 * 验证 Control 组件是否可以绑定到指定的 Object 组件
 * @param controlType Control 组件类型
 * @param objectType Object 组件类型
 * @returns 是否可以绑定
 */
export function canBindControl(controlType: string, objectType: string): boolean {
  const controlMeta = getComponentMeta(controlType);
  if (!controlMeta?.toNameConstraints) {
    return false;
  }
  return controlMeta.toNameConstraints.includes(objectType);
}

/**
 * 验证拖拽操作是否有效
 * @param childType 要添加的子组件类型
 * @param parentNode 父节点
 * @returns 验证结果和错误消息
 */
export function validateDragOperation(
  childType: string,
  parentNode: ComponentNode | null
): { valid: boolean; message?: string } {
  if (!parentNode) {
    // 如果没有父节点，允许添加到根节点（View）
    return { valid: true };
  }

  const parentMeta = getComponentMeta(parentNode.type);
  const childMeta = getComponentMeta(childType);

  if (!parentMeta) {
    return { valid: false, message: `未知的父组件类型: ${parentNode.type}` };
  }

  if (!childMeta) {
    return { valid: false, message: `未知的子组件类型: ${childType}` };
  }

  // 检查父组件是否允许该子组件
  if (!canAddChild(parentNode.type, childType)) {
    return {
      valid: false,
      message: `${parentMeta.displayName} 不允许包含 ${childMeta.displayName}`,
    };
  }

  // 检查子组件是否允许作为该父组件的子组件
  if (!canBeChildOf(childType, parentNode.type)) {
    return {
      valid: false,
      message: `${childMeta.displayName} 不能作为 ${parentMeta.displayName} 的子组件`,
    };
  }

  return { valid: true };
}

/**
 * 获取可以绑定到指定 Control 组件的 Object 组件列表
 * @param controlType Control 组件类型
 * @param rootNode 根节点
 * @returns Object 组件节点列表
 */
export function getBindableObjects(
  controlType: string,
  rootNode: ComponentNode | null
): ComponentNode[] {
  if (!rootNode) return [];

  const controlMeta = getComponentMeta(controlType);
  if (!controlMeta?.toNameConstraints) {
    return [];
  }

  const bindableTypes = controlMeta.toNameConstraints;
  const objects: ComponentNode[] = [];

  // 递归查找所有 Object 类型的组件
  const findObjects = (node: ComponentNode) => {
    if (node.category === "object" && bindableTypes.includes(node.type)) {
      objects.push(node);
    }
    node.children.forEach(findObjects);
  };

  findObjects(rootNode);
  return objects;
}

/**
 * 验证 toName 属性值是否有效
 * @param controlType Control 组件类型
 * @param toNameValue toName 属性值
 * @param rootNode 根节点
 * @returns 验证结果和错误消息
 */
export function validateToName(
  controlType: string,
  toNameValue: string,
  rootNode: ComponentNode | null
): { valid: boolean; message?: string } {
  if (!toNameValue) {
    return { valid: false, message: "toName 不能为空" };
  }

  if (!rootNode) {
    return { valid: false, message: "画布中没有可绑定的对象" };
  }

  // 查找对应的 Object 组件
  const findObjectByName = (node: ComponentNode): ComponentNode | null => {
    if (node.category === "object" && node.attributes.name === toNameValue) {
      return node;
    }
    for (const child of node.children) {
      const found = findObjectByName(child);
      if (found) return found;
    }
    return null;
  };

  const targetObject = findObjectByName(rootNode);
  if (!targetObject) {
    return { valid: false, message: `找不到名称为 "${toNameValue}" 的对象组件` };
  }

  // 验证 Control 组件是否可以绑定到该 Object 组件
  if (!canBindControl(controlType, targetObject.type)) {
    const controlMeta = getComponentMeta(controlType);
    const objectMeta = getComponentMeta(targetObject.type);
    return {
      valid: false,
      message: `${controlMeta?.displayName || controlType} 不能绑定到 ${objectMeta?.displayName || targetObject.type}`,
    };
  }

  return { valid: true };
}

/**
 * 获取组件可以放置的所有有效父组件类型
 * @param componentType 组件类型
 * @returns 有效的父组件类型列表
 */
export function getValidParentTypes(componentType: string): string[] {
  const meta = getComponentMeta(componentType);
  if (!meta) return [];

  // 如果有明确的父组件约束，返回这些类型
  if (meta.allowedParents && meta.allowedParents.length > 0) {
    return meta.allowedParents;
  }

  // 否则，查找所有允许该组件作为子组件的父组件
  const validParents: string[] = [];
  // 这里需要遍历所有组件元数据，查找 allowedChildren 包含该组件的
  // 为了性能，我们可以返回常见的父组件类型
  // 或者可以创建一个反向索引
  return validParents;
}

