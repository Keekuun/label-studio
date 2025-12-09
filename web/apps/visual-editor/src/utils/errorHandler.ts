/**
 * 错误处理工具函数
 */

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * 格式化错误信息
 */
export function formatError(error: unknown): AppError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error.name,
      details: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
    };
  }

  return {
    message: "发生未知错误",
    details: error,
  };
}

/**
 * 处理 XML 解析错误
 */
export function handleXMLParseError(error: unknown): string {
  const formatted = formatError(error);
  
  if (formatted.message.includes("parsererror") || formatted.message.includes("解析")) {
    return "XML 格式错误，请检查 XML 文件格式是否正确";
  }

  if (formatted.message.includes("根元素")) {
    return "XML 文件缺少根元素，请确保 XML 格式正确";
  }

  return formatted.message || "XML 解析失败";
}

/**
 * 处理组件操作错误
 */
export function handleComponentError(error: unknown): string {
  const formatted = formatError(error);
  
  if (formatted.message.includes("找不到") || formatted.message.includes("not found")) {
    return "找不到指定的组件";
  }

  if (formatted.message.includes("已存在") || formatted.message.includes("already exists")) {
    return "组件已存在";
  }

  return formatted.message || "组件操作失败";
}

