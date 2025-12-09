export interface ComponentNode {
  id: string;
  type: string;
  category: "object" | "control" | "visual";
  name?: string;
  attributes: Record<string, any>;
  children: ComponentNode[];
  parentId?: string;
  order: number;
}

export interface ComponentMeta {
  type: string;
  category: "object" | "control" | "visual";
  group?: string;
  sortOrder?: number;
  displayName: string;
  icon?: React.ComponentType;
  description: string;
  attributes: AttributeMeta[];
  // 允许的子组件类型列表
  allowedChildren?: string[];
  // 父组件约束：只能作为哪些组件的子组件
  allowedParents?: string[];
  // 对象绑定约束：Control 组件可以绑定到哪些 Object 组件（toName）
  toNameConstraints?: string[];
  // 必填属性列表
  requiredAttributes?: string[];
}

import { ValidationRule } from "../utils/attributeValidator";

export interface AttributeMeta {
  name: string;
  type: "string" | "number" | "boolean" | "select" | "color";
  label: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  required?: boolean;
  description?: string;
  dependsOn?: string;
  // 是否为常用属性（默认显示）
  isCommon?: boolean;
  // 常用选项（用于字符串类型的快速选择）
  commonOptions?: { label: string; value: string }[];
  // 验证规则
  validation?: {
    min?: number; // 最小值（用于数字或字符串长度）
    max?: number; // 最大值（用于数字或字符串长度）
    step?: number; // 步长（用于数字）
    pattern?: string; // 正则表达式模式（字符串形式）
    email?: boolean; // 邮箱格式验证
    url?: boolean; // URL 格式验证
    custom?: (value: any) => boolean | string; // 自定义验证函数
  };
}

export interface EditorState {
  rootNode: ComponentNode | null;
  selectedNodeId?: string;
  hoveredNodeId?: string;
  clipboard?: ComponentNode;
  history: (ComponentNode | null)[];
  currentHistoryIndex: number;
  expandedNodes: Set<string>; // 展开的节点 ID 集合
}

