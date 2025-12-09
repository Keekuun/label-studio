import React from "react";
import { useAtom, useSetAtom } from "jotai";
import { editorStateAtom, selectedNodeAtom } from "../atoms/visualEditorAtoms";
import {
  addChildNode,
  removeNodeFromTree,
  moveNodeInTree,
  reorderNodeInTree,
  createComponentNode,
  findNodeById,
  updateNodeInTree,
  cloneNode,
  getAllNames,
  generateUniqueName,
} from "../utils/componentTree";
import { ComponentNode } from "../types";
import { getComponentMeta } from "../data/componentMetas";
import { validateDragOperation } from "../utils/constraintValidator";

// 历史记录的最大长度
const MAX_HISTORY_LENGTH = 50;

export function useComponentTree() {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const setSelectedNode = useSetAtom(selectedNodeAtom);

  // 递归展开所有节点
  const expandAllNodes = React.useCallback((node: ComponentNode | null, expandedSet: Set<string>) => {
    if (!node) return;
    expandedSet.add(node.id);
    node.children.forEach((child) => expandAllNodes(child, expandedSet));
  }, []);

  // 记录历史状态
  const recordHistory = React.useCallback((newRootNode: ComponentNode | null) => {
    setEditorState((prev) => {
      const newHistory = [...prev.history];
      const currentIndex = prev.currentHistoryIndex;

      // 如果当前不在历史记录的末尾，删除后面的记录
      if (currentIndex < newHistory.length - 1) {
        newHistory.splice(currentIndex + 1);
      }

      // 添加新状态
      newHistory.push(newRootNode ? JSON.parse(JSON.stringify(newRootNode)) : null);

      // 限制历史记录长度
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift();
      }

      // 自动展开新添加的节点
      const newExpandedNodes = new Set(prev.expandedNodes);
      if (newRootNode) {
        expandAllNodes(newRootNode, newExpandedNodes);
      }

      return {
        ...prev,
        rootNode: newRootNode,
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1,
        expandedNodes: newExpandedNodes,
      };
    });
  }, [setEditorState, expandAllNodes]);

  const addComponent = (
    type: string,
    category: "object" | "control" | "visual",
    attributes: Record<string, any> = {},
    parentId?: string
  ) => {
    // 获取组件元数据，应用默认值
    const meta = getComponentMeta(type);
    const defaultAttributes: Record<string, any> = {};
    
    if (meta) {
      meta.attributes.forEach((attr) => {
        if (attr.defaultValue !== undefined && !(attr.name in attributes)) {
          defaultAttributes[attr.name] = attr.defaultValue;
        }
      });
    }
    
    // 合并默认值和用户提供的属性
    const finalAttributes = { ...defaultAttributes, ...attributes };
    
    // 如果组件有 name 属性，确保唯一性
    if (finalAttributes.name && editorState.rootNode) {
      const existingNames = getAllNames(editorState.rootNode);
      finalAttributes.name = generateUniqueName(finalAttributes.name, existingNames);
    }
    
    const newNode = createComponentNode(type, category, finalAttributes, parentId);

    if (!editorState.rootNode) {
      // 如果没有根节点，创建 View 作为根节点
      const rootNode: ComponentNode = {
        id: newNode.id,
        type: "View",
        category: "visual",
        attributes: {},
        children: [],
        order: 0,
      };
      recordHistory(rootNode);
      return newNode;
    }

    // 确定父节点 ID
    const targetParentId = parentId || editorState.rootNode.id;

    const updatedRoot = addChildNode(editorState.rootNode, targetParentId, newNode);
    if (updatedRoot) {
      recordHistory(updatedRoot);
    }

    return newNode;
  };

  const removeComponent = (nodeId: string) => {
    if (!editorState.rootNode) return;

    // 如果删除的是根节点，清空整个树
    if (editorState.rootNode.id === nodeId) {
      setEditorState((prev) => ({
        ...prev,
        selectedNodeId: undefined,
      }));
      recordHistory(null);
      return;
    }

    const updatedRoot = removeNodeFromTree(editorState.rootNode, nodeId);
    setEditorState((prev) => ({
      ...prev,
      selectedNodeId:
        prev.selectedNodeId === nodeId
          ? undefined
          : prev.selectedNodeId,
    }));
    recordHistory(updatedRoot);
  };

  const moveComponent = (
    nodeId: string,
    newParentId: string,
    newOrder: number
  ) => {
    if (!editorState.rootNode) return;

    const updatedRoot = moveNodeInTree(
      editorState.rootNode,
      nodeId,
      newParentId,
      newOrder
    );
    if (updatedRoot) {
      recordHistory(updatedRoot);
    }
  };

  const reorderComponent = (nodeId: string, newOrder: number) => {
    if (!editorState.rootNode) return;

    const updatedRoot = reorderNodeInTree(
      editorState.rootNode,
      nodeId,
      newOrder
    );
    if (updatedRoot) {
      recordHistory(updatedRoot);
    }
  };

  const updateComponent = (nodeId: string, updates: Partial<ComponentNode>) => {
    if (!editorState.rootNode) return;

    const node = findNodeById(editorState.rootNode, nodeId);
    if (!node) return;

    const updatedNode: ComponentNode = {
      ...node,
      ...updates,
      attributes: {
        ...node.attributes,
        ...(updates.attributes || {}),
      },
    };

    const updatedRoot = updateNodeInTree(editorState.rootNode, nodeId, updatedNode);
    if (updatedRoot) {
      recordHistory(updatedRoot);
    }
  };

  const selectComponent = (nodeId: string | undefined) => {
    setEditorState({
      ...editorState,
      selectedNodeId: nodeId,
    });
  };

  const copyComponent = (nodeId: string) => {
    if (!editorState.rootNode) return;

    const node = findNodeById(editorState.rootNode, nodeId);
    if (!node) return;

    // 克隆节点（不包含 parentId，因为粘贴时会设置）
    const clonedNode = cloneNode(node);
    
    setEditorState({
      ...editorState,
      clipboard: clonedNode,
    });
  };

  const pasteComponent = (parentId?: string) => {
    if (!editorState.clipboard || !editorState.rootNode) return;

    // 确定目标父节点
    const targetParentId = parentId || editorState.rootNode.id;
    const parentNode = findNodeById(editorState.rootNode, targetParentId);
    
    if (!parentNode) return;

    // 验证约束
    const validation = validateDragOperation(editorState.clipboard.type, parentNode);
    if (!validation.valid) {
      return;
    }

    // 克隆节点并设置新的父节点
    const clonedNode = cloneNode(editorState.clipboard, targetParentId);
    
    // 如果克隆的节点有 name 属性，确保唯一性
    if (clonedNode.attributes.name) {
      const existingNames = getAllNames(editorState.rootNode);
      clonedNode.attributes.name = generateUniqueName(
        clonedNode.attributes.name,
        existingNames
      );
    }
    
    // 添加到目标父节点
    const updatedRoot = addChildNode(editorState.rootNode, targetParentId, clonedNode);
    if (updatedRoot) {
      setEditorState((prev) => ({
        ...prev,
        selectedNodeId: clonedNode.id,
      }));
      recordHistory(updatedRoot);
    }
  };

  const undo = () => {
    if (editorState.currentHistoryIndex <= 0) return;

    const newIndex = editorState.currentHistoryIndex - 1;
    const previousState = editorState.history[newIndex];

    setEditorState((prev) => ({
      ...prev,
      rootNode: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
      currentHistoryIndex: newIndex,
      selectedNodeId: undefined, // 清除选中状态
    }));
  };

  const redo = () => {
    if (editorState.currentHistoryIndex >= editorState.history.length - 1) return;

    const newIndex = editorState.currentHistoryIndex + 1;
    const nextState = editorState.history[newIndex];

    setEditorState((prev) => ({
      ...prev,
      rootNode: nextState ? JSON.parse(JSON.stringify(nextState)) : null,
      currentHistoryIndex: newIndex,
      selectedNodeId: undefined, // 清除选中状态
    }));
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setEditorState((prev) => {
      const newExpandedNodes = new Set(prev.expandedNodes);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return {
        ...prev,
        expandedNodes: newExpandedNodes,
      };
    });
  };

  const isNodeExpanded = (nodeId: string): boolean => {
    return editorState.expandedNodes.has(nodeId);
  };

  // 更新整个根节点（用于 XML 同步）
  const updateRootNode = React.useCallback((newRootNode: ComponentNode | null) => {
    recordHistory(newRootNode);
    setEditorState((prev) => ({
      ...prev,
      selectedNodeId: undefined, // 清除选中状态
    }));
  }, [recordHistory, setEditorState]);

  return {
    rootNode: editorState.rootNode,
    addComponent,
    removeComponent,
    moveComponent,
    reorderComponent,
    updateComponent,
    selectComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    toggleNodeExpanded,
    isNodeExpanded,
    updateRootNode,
    canUndo: editorState.currentHistoryIndex > 0,
    canRedo: editorState.currentHistoryIndex < editorState.history.length - 1,
    selectedNodeId: editorState.selectedNodeId,
    clipboard: editorState.clipboard,
  };
}

