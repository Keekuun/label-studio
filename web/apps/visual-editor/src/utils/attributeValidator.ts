/**
 * 属性验证工具函数
 */

export interface ValidationRule {
  type: "email" | "url" | "number" | "range" | "pattern" | "custom";
  min?: number;
  max?: number;
  step?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (value: any) => boolean | string;
}

/**
 * 验证邮箱格式
 */
export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 验证 URL 格式
 */
export function validateURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    // 也支持相对路径
    return /^(\/|\.\/|\.\.\/|[a-zA-Z0-9-]+:)/.test(value);
  }
}

/**
 * 验证数字范围
 */
export function validateNumberRange(
  value: number,
  min?: number,
  max?: number,
  step?: number
): { valid: boolean; message?: string } {
  if (typeof value !== "number" && value !== null && value !== undefined) {
    return { valid: false, message: "请输入有效的数字" };
  }

  if (value === null || value === undefined) {
    return { valid: true };
  }

  if (min !== undefined && value < min) {
    return { valid: false, message: `数值不能小于 ${min}` };
  }

  if (max !== undefined && value > max) {
    return { valid: false, message: `数值不能大于 ${max}` };
  }

  if (step !== undefined && step > 0) {
    const remainder = (value - (min || 0)) % step;
    if (Math.abs(remainder) > 0.0001 && Math.abs(remainder - step) > 0.0001) {
      return { valid: false, message: `数值必须是 ${step} 的倍数` };
    }
  }

  return { valid: true };
}

/**
 * 验证字符串长度
 */
export function validateStringLength(
  value: string,
  min?: number,
  max?: number
): { valid: boolean; message?: string } {
  if (typeof value !== "string") {
    return { valid: false, message: "请输入有效的字符串" };
  }

  const length = value.length;

  if (min !== undefined && length < min) {
    return { valid: false, message: `长度不能少于 ${min} 个字符` };
  }

  if (max !== undefined && length > max) {
    return { valid: false, message: `长度不能超过 ${max} 个字符` };
  }

  return { valid: true };
}

/**
 * 验证正则表达式模式
 */
export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * 执行验证规则
 */
export function validateAttribute(
  value: any,
  rules: ValidationRule[]
): { valid: boolean; message?: string } {
  for (const rule of rules) {
    switch (rule.type) {
      case "email":
        if (value && typeof value === "string" && !validateEmail(value)) {
          return {
            valid: false,
            message: rule.message || "请输入有效的邮箱地址",
          };
        }
        break;

      case "url":
        if (value && typeof value === "string" && !validateURL(value)) {
          return {
            valid: false,
            message: rule.message || "请输入有效的 URL",
          };
        }
        break;

      case "number":
        if (value !== null && value !== undefined) {
          const numValue = typeof value === "string" ? parseFloat(value) : value;
          if (isNaN(numValue)) {
            return {
              valid: false,
              message: rule.message || "请输入有效的数字",
            };
          }
        }
        break;

      case "range":
        if (value !== null && value !== undefined) {
          const numValue = typeof value === "string" ? parseFloat(value) : value;
          if (!isNaN(numValue)) {
            const result = validateNumberRange(
              numValue,
              rule.min,
              rule.max,
              rule.step
            );
            if (!result.valid) {
              return {
                valid: false,
                message: rule.message || result.message,
              };
            }
          }
        }
        break;

      case "pattern":
        if (value && typeof value === "string" && rule.pattern) {
          if (!validatePattern(value, rule.pattern)) {
            return {
              valid: false,
              message: rule.message || "格式不正确",
            };
          }
        }
        break;

      case "custom":
        if (rule.validator) {
          const result = rule.validator(value);
          if (result === false) {
            return {
              valid: false,
              message: rule.message || "验证失败",
            };
          }
          if (typeof result === "string") {
            return {
              valid: false,
              message: result,
            };
          }
        }
        break;
    }
  }

  return { valid: true };
}

