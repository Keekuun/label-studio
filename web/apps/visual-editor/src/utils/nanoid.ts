// 使用项目中的 nanoid，如果没有则使用简单实现
let idCounter = 0;

export function nanoid(size: number = 21): string {
  try {
    // 尝试使用项目中的 nanoid
    const nanoidModule = require("nanoid");
    return nanoidModule.nanoid(size);
  } catch {
    // 如果不可用，使用简单实现
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const counter = (idCounter++).toString(36);
    return `${timestamp}-${random}-${counter}`.substring(0, size);
  }
}

