# 属性验证增强功能文档

## ✅ 已完成的功能

### 1. 验证工具函数 (`src/utils/attributeValidator.ts`)

创建了完整的属性验证工具函数集：

- **`validateEmail(value)`**: 验证邮箱格式
- **`validateURL(value)`**: 验证 URL 格式（支持绝对和相对路径）
- **`validateNumberRange(value, min, max, step)`**: 验证数字范围
- **`validateStringLength(value, min, max)`**: 验证字符串长度
- **`validatePattern(value, pattern)`**: 验证正则表达式模式
- **`validateAttribute(value, rules)`**: 综合验证函数

### 2. 类型定义扩展 (`src/types/index.ts`)

扩展了 `AttributeMeta` 接口，添加了 `validation` 字段：

```typescript
validation?: {
  min?: number;        // 最小值（用于数字或字符串长度）
  max?: number;        // 最大值（用于数字或字符串长度）
  step?: number;       // 步长（用于数字）
  pattern?: string;   // 正则表达式模式（字符串形式）
  email?: boolean;    // 邮箱格式验证
  url?: boolean;      // URL 格式验证
  custom?: (value: any) => boolean | string; // 自定义验证函数
}
```

### 3. 属性编辑器增强 (`AttributeEditor.tsx`)

实现了 `buildValidationRules` 函数，根据 `AttributeMeta.validation` 配置自动生成验证规则：

- ✅ 邮箱格式验证
- ✅ URL 格式验证
- ✅ 数字范围验证（min, max, step）
- ✅ 字符串长度验证（min, max）
- ✅ 正则表达式模式验证
- ✅ 自定义验证函数
- ✅ 在 `InputNumber` 组件上应用 min/max/step 属性

### 4. 验证规则示例

已为部分关键属性添加了验证规则：

#### opacity（透明度）
```typescript
{
  name: "opacity",
  type: "string",
  validation: {
    min: 0,
    max: 1,
    custom: (value) => {
      const num = parseFloat(String(value));
      if (isNaN(num)) return "请输入有效的数字";
      if (num < 0 || num > 1) return "透明度必须在 0 到 1 之间";
      return true;
    },
  },
}
```

#### strokeWidth（边框宽度）
```typescript
{
  name: "strokeWidth",
  type: "number",
  validation: {
    min: 0,
    step: 1,
  },
}
```

## 📋 支持的验证类型

### 1. 邮箱验证
```typescript
validation: {
  email: true,
}
```

### 2. URL 验证
```typescript
validation: {
  url: true,
}
```

### 3. 数字范围验证
```typescript
validation: {
  min: 0,
  max: 100,
  step: 1,
}
```

### 4. 字符串长度验证
```typescript
validation: {
  min: 1,  // 最小长度
  max: 100, // 最大长度
}
```

### 5. 正则表达式验证
```typescript
validation: {
  pattern: "^[a-zA-Z0-9]+$", // 只允许字母和数字
}
```

### 6. 自定义验证函数
```typescript
validation: {
  custom: (value) => {
    if (value === "invalid") {
      return "值不能为 invalid";
    }
    return true;
  },
}
```

## 🎯 使用示例

### 在 componentMetas.ts 中添加验证规则

```typescript
{
  name: "opacity",
  type: "string",
  label: "透明度",
  defaultValue: "0.6",
  description: "矩形的透明度（0-1）",
  validation: {
    min: 0,
    max: 1,
    custom: (value: any) => {
      if (!value) return true;
      const num = parseFloat(String(value));
      if (isNaN(num)) return "请输入有效的数字";
      if (num < 0 || num > 1) return "透明度必须在 0 到 1 之间";
      return true;
    },
  },
}
```

## 🔍 验证错误显示

- ✅ 验证失败时显示详细的错误消息
- ✅ 实时验证（输入时验证）
- ✅ 友好的错误提示
- ✅ 支持 Ant Design Form 的验证规则

## 📝 注意事项

1. **验证时机**: 验证在用户输入时实时进行，也会在表单提交时验证
2. **空值处理**: 如果属性不是必填的，空值会通过验证
3. **类型转换**: 字符串类型的数字属性会自动转换为数字进行验证
4. **自定义验证**: 自定义验证函数返回 `true` 表示通过，返回 `string` 表示错误消息

## 🚀 后续优化建议

1. **更多验证规则**: 可以添加更多常见的验证规则（如 IP 地址、颜色值等）
2. **异步验证**: 支持异步验证（如检查 URL 是否可访问）
3. **验证规则组合**: 支持多个验证规则的组合（AND/OR）
4. **验证规则可视化**: 在属性面板中显示验证规则说明

## 🔗 相关文件

- `src/utils/attributeValidator.ts` - 验证工具函数
- `src/types/index.ts` - 类型定义
- `src/components/VisualEditor/PropertiesPanel/AttributeEditor.tsx` - 属性编辑器
- `src/data/componentMetas.ts` - 组件元数据配置

