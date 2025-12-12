import { Template } from "../data/templates";
import { nanoid } from "./nanoid";

const CUSTOM_TEMPLATES_KEY = "visual-editor:custom-templates";

/**
 * 获取所有自定义模板
 */
export function getCustomTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Template[];
  } catch (error) {
    console.error("读取自定义模板失败:", error);
    return [];
  }
}

/**
 * 保存自定义模板
 */
export function saveCustomTemplate(template: Omit<Template, "id">): Template {
  const customTemplates = getCustomTemplates();
  const newTemplate: Template = {
    ...template,
    id: `custom-${nanoid()}`,
  };
  
  customTemplates.push(newTemplate);
  
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    return newTemplate;
  } catch (error) {
    console.error("保存自定义模板失败:", error);
    throw new Error("保存模板失败");
  }
}

/**
 * 删除自定义模板
 */
export function deleteCustomTemplate(templateId: string): boolean {
  const customTemplates = getCustomTemplates();
  const filtered = customTemplates.filter((t) => t.id !== templateId);
  
  if (filtered.length === customTemplates.length) {
    return false; // 模板不存在
  }
  
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("删除自定义模板失败:", error);
    throw new Error("删除模板失败");
  }
}

/**
 * 更新自定义模板
 */
export function updateCustomTemplate(templateId: string, updates: Partial<Omit<Template, "id">>): Template | null {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex((t) => t.id === templateId);
  
  if (index === -1) {
    return null; // 模板不存在
  }
  
  const updatedTemplate: Template = {
    ...customTemplates[index],
    ...updates,
  };
  
  customTemplates[index] = updatedTemplate;
  
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    return updatedTemplate;
  } catch (error) {
    console.error("更新自定义模板失败:", error);
    throw new Error("更新模板失败");
  }
}

/**
 * 获取所有模板（预设 + 自定义）
 */
export function getAllTemplates(): Template[] {
  const { templates } = require("../data/templates");
  const customTemplates = getCustomTemplates();
  return [...templates, ...customTemplates];
}

/**
 * 检查模板 ID 是否为自定义模板
 */
export function isCustomTemplate(templateId: string): boolean {
  return templateId.startsWith("custom-");
}

