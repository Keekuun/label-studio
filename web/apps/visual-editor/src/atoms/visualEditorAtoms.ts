import { atom } from "jotai";
import { EditorState, ComponentNode } from "../types";
import { findNodeById } from "../utils/componentTree";

const createInitialState = (): EditorState => ({
  rootNode: null,
  selectedNodeId: undefined,
  hoveredNodeId: undefined,
  clipboard: undefined,
  history: [],
  currentHistoryIndex: -1,
  expandedNodes: new Set<string>(), // 默认展开所有节点
});

export const editorStateAtom = atom<EditorState>(createInitialState());
export const selectedNodeAtom = atom<ComponentNode | null>((get) => {
  const state = get(editorStateAtom);
  if (!state.selectedNodeId || !state.rootNode) {
    return null;
  }
  return findNodeById(state.rootNode, state.selectedNodeId);
});

