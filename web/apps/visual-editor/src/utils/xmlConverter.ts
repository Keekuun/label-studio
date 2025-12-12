import { ComponentNode } from "../types";
import { nanoid } from "nanoid";
import { getComponentMeta } from "../data/componentMetas";

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function indent(str: string, level: number = 1): string {
  const indentStr = "  ".repeat(level);
  return str
    .split("\n")
    .map((line) => (line.trim() ? indentStr + line : line))
    .join("\n");
}

export function generateXMLFromNode(node: ComponentNode): string {
  if (!node) {
    return "<View>\n</View>";
  }

  // 获取组件元数据，用于判断属性类型
  const meta = getComponentMeta(node.type);
  
  const attributes = Object.entries(node.attributes)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        // 布尔属性：只有值为 true 时才输出，false 时不输出（精简 XML）
        if (value === true) {
          return `${key}="true"`;
        }
        return null; // false 时不输出
      }
      return `${key}="${escapeXML(String(value))}"`;
    })
    .filter(Boolean)
    .join(" ");

  const openTag = attributes ? `<${node.type} ${attributes}>` : `<${node.type}>`;
  const closeTag = `</${node.type}>`;

  if (node.children.length === 0) {
    return `${openTag}${closeTag}`;
  }

  const childrenXML = node.children
    .sort((a, b) => a.order - b.order)
    .map((child) => generateXMLFromNode(child))
    .join("\n");

  return `${openTag}\n${indent(childrenXML)}\n${closeTag}`;
}

/**
 * 检测 XML 解析错误
 */
function detectParseError(doc: Document): string | null {
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    return parserError.textContent || "XML 解析错误";
  }
  return null;
}

/**
 * 将 XML 属性转换为对象
 */
function parseAttributes(element: Element): Record<string, any> {
  const attributes: Record<string, any> = {};
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const name = attr.name;
    let value: any = attr.value;

    // 尝试转换数据类型
    // 布尔值（如果属性存在但没有值，或者值为 "true"/"false"）
    if (value === "" || value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    }
    // 数字
    else if (!isNaN(Number(value)) && value !== "") {
      value = Number(value);
    }
    // 字符串（保持原样）
    else {
      value = value;
    }

    attributes[name] = value;
  }

  return attributes;
}

/**
 * 确定组件的分类（object, control, visual）
 */
function determineCategory(tagName: string): "object" | "control" | "visual" {
  const tagLower = tagName.toLowerCase();
  
  // Visual 标签
  const visualTags = ["view", "header", "style", "filter", "collapse", "dialog"];
  if (visualTags.includes(tagLower)) {
    return "visual";
  }

  // Object 标签
  const objectTags = [
    "image", "text", "audio", "video", "hypertext", "paragraphs",
    "table", "timeseries", "list", "richtext", "pdf"
  ];
  if (objectTags.includes(tagLower)) {
    return "object";
  }

  // Control 标签（默认）
  return "control";
}

/**
 * 将 XML Element 转换为 ComponentNode
 */
function elementToNode(
  element: Element,
  parentId?: string,
  order: number = 0
): ComponentNode {
  const tagName = element.tagName;
  const attributes = parseAttributes(element);
  
  // 确定分类
  const category = determineCategory(tagName);
  
  // 获取组件元数据，应用默认值
  const meta = getComponentMeta(tagName);
  const defaultAttributes: Record<string, any> = {};
  
  if (meta) {
    meta.attributes.forEach((attr) => {
      // 如果属性在 XML 中不存在，且有默认值，则应用默认值
      if (attr.defaultValue !== undefined && !(attr.name in attributes)) {
        defaultAttributes[attr.name] = attr.defaultValue;
      }
    });
  }
  
  // 合并默认值和 XML 中的属性（XML 中的属性优先级更高）
  const finalAttributes = { ...defaultAttributes, ...attributes };
  
  // 创建节点
  const node: ComponentNode = {
    id: nanoid(),
    type: tagName,
    category,
    attributes: finalAttributes,
    children: [],
    parentId,
    order,
  };

  // 处理子节点
  const children = Array.from(element.children);
  node.children = children.map((child, index) =>
    elementToNode(child, node.id, index)
  );

  return node;
}

/**
 * 从 XML 字符串解析为组件树
 */
export function parseXMLToNode(xmlString: string): ComponentNode | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    // 检测解析错误
    const error = detectParseError(doc);
    if (error) {
      throw new Error(error);
    }

    // 获取根元素
    const rootElement = doc.documentElement;
    if (!rootElement) {
      throw new Error("XML 中没有根元素");
    }

    // 转换为组件树
    return elementToNode(rootElement);
  } catch (error) {
    console.error("XML 解析错误:", error);
    throw error;
  }
}

