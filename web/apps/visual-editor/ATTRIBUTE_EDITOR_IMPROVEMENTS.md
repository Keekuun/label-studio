# 属性面板改进文档

## ✅ 已完成的改进

### 1. 输入框改为 TextArea
- ✅ 所有 string 类型的属性输入框改为 TextArea
- ✅ 支持多行输入
- ✅ 自动调整高度（minRows: 2, maxRows: 6）
- ✅ value 和 style 属性使用 3 行，其他使用 2 行

### 2. XML 生成优化
- ✅ 布尔属性只在值为 `true` 时才输出
- ✅ `false` 值不输出到 XML（精简代码）
- ✅ 保持 `true` 值的 `key="true"` 格式

### 3. Placeholder 改进
- ✅ 使用 `description` 作为 placeholder
- ✅ 提供详细的输入说明和示例

### 4. 默认值更新
- ✅ 根据 `editor/src/examples` 中的 XML 配置更新默认值
- ✅ Image: name="img", value="$image"
- ✅ Text: name="text", value="$text"
- ✅ RectangleLabels: name="tag", fillOpacity="0.5", strokeWidth="5"
- ✅ Header: value="标注任务"

## 📝 待完成的改进

### 需要批量更新的组件属性

由于组件数量较多（56 个组件，500+ 个属性），建议按优先级逐步更新：

#### 高优先级（常用组件）
1. ✅ Image - 已完成部分
2. ✅ Text - 已完成
3. ✅ RectangleLabels - 已完成部分
4. ⏳ Rectangle - 待更新
5. ⏳ PolygonLabels - 待更新
6. ⏳ Labels - 待更新
7. ⏳ Choices - 待更新
8. ⏳ Label - 待更新
9. ⏳ Choice - 待更新

#### 中优先级
10. ⏳ EllipseLabels
11. ⏳ KeyPointLabels
12. ⏳ BrushLabels
13. ⏳ TextArea
14. ⏳ Audio
15. ⏳ Video

#### 低优先级
16. ⏳ 其他 Control 组件
17. ⏳ 其他 Object 组件
18. ⏳ Visual 组件

## 🔧 更新模式

### name 属性
```typescript
{
  name: "name",
  type: "string",
  label: "名称",
  required: true,
  defaultValue: "组件类型的小写形式", // 如 "img", "text", "tag"
  description: "组件的唯一标识名称。示例：img、text、tag。此名称会被其他组件引用",
}
```

### value 属性
```typescript
{
  name: "value",
  type: "string",
  label: "数据源",
  required: true,
  defaultValue: "$字段名", // 如 "$image", "$text"
  description: "数据来源。可以是数据字段名（如 $image）或完整的 URL 地址",
}
```

### toName 属性
```typescript
{
  name: "toName",
  type: "select",
  label: "关联对象",
  required: true,
  description: "要标注的对象名称。必须引用画布中已存在的 Object 组件的 name 属性",
}
```

### 数值属性（opacity, strokeWidth 等）
```typescript
{
  name: "opacity",
  type: "string",
  label: "透明度",
  defaultValue: "0.6", // 根据 examples 设置
  description: "透明度值，取值范围 0-1。0 表示完全透明，1 表示完全不透明。示例：0.5、0.6",
}
```

### 布尔属性
```typescript
{
  name: "zoom",
  type: "boolean",
  label: "允许缩放",
  defaultValue: true, // 根据 examples 设置
  description: "是否允许使用鼠标滚轮缩放图像。设置为 true 时，用户可以使用鼠标滚轮进行缩放操作",
}
```

## 📋 从 Examples 提取的默认值参考

### Image 组件
- name="img"
- value="$image"
- zoom="true" (常见)
- zoomControl="true" (常见)
- showMousePos="true" (部分示例)

### RectangleLabels 组件
- name="tag"
- toName="img"
- fillOpacity="0.5"
- strokeWidth="5"
- canRotate="false" (部分示例)

### PolygonLabels 组件
- name="tag"
- toName="img"
- strokewidth="5"
- fillcolor="red"
- pointstyle="circle"
- pointsize="small"

### KeyPointLabels 组件
- name="tag"
- toName="img"
- fillcolor="red"

### Labels 组件
- name="ner" 或 "tag"
- toName="text" 或 "img"
- fillOpacity="0.5"
- strokeWidth="5"

### Choices 组件
- name="choice"
- toName="img"

## 🎯 下一步工作

1. 继续更新常用组件的 description
2. 根据 examples 更新更多默认值
3. 确保所有组件的 description 都足够详细
4. 测试 TextArea 的显示效果

## 📝 注意事项

1. **布尔属性默认值**: 如果 examples 中常见的是 `true`，则设置 `defaultValue: true`；如果常见的是不设置（false），则设置 `defaultValue: false`
2. **XML 输出**: 布尔属性只有在值为 `true` 时才会输出到 XML
3. **Placeholder**: 使用 `description` 字段作为 TextArea 的 placeholder
4. **多行输入**: value 和 style 属性使用 3 行，其他使用 2 行

