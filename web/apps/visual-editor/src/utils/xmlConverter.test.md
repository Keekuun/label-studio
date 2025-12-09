# XML 转换功能测试说明

## 功能说明

### 1. XML → 组件树（parseXMLToNode）

将 XML 字符串解析为 ComponentNode 树结构。

**示例**：
```xml
<View>
  <Image name="img" value="$image" zoom="true" />
  <RectangleLabels name="tag" toName="img" choice="single" />
</View>
```

**转换结果**：
```javascript
{
  id: "...",
  type: "View",
  category: "visual",
  attributes: {},
  children: [
    {
      id: "...",
      type: "Image",
      category: "object",
      attributes: {
        name: "img",
        value: "$image",
        zoom: true  // 自动转换为布尔值
      },
      children: [],
      order: 0
    },
    {
      id: "...",
      type: "RectangleLabels",
      category: "control",
      attributes: {
        name: "tag",
        toName: "img",
        choice: "single"
      },
      children: [],
      order: 1
    }
  ],
  order: 0
}
```

### 2. 组件树 → XML（generateXMLFromNode）

将 ComponentNode 树结构转换为 XML 字符串。

**特性**：
- 自动转义特殊字符
- 布尔值属性处理（true 时输出为 `key="true"`，false 时输出为 `key="false"`）
- 自动缩进
- 按 order 排序子节点

## 测试用例

### 测试 1: 简单 XML
```xml
<View>
  <Image name="img" value="$image" />
</View>
```

### 测试 2: 带布尔值属性
```xml
<View>
  <Image name="img" value="$image" zoom="true" zoomControl="false" />
</View>
```

### 测试 3: 嵌套结构
```xml
<View>
  <Image name="img" value="$image" />
  <RectangleLabels name="tag" toName="img">
    <Label value="Person" />
    <Label value="Animal" />
  </RectangleLabels>
</View>
```

### 测试 4: 数字属性
```xml
<View>
  <RectangleLabels name="tag" toName="img" opacity="0.6" strokeWidth="2" />
</View>
```

## 注意事项

1. **属性类型转换**：
   - 空字符串或 "true" → `true` (布尔值)
   - "false" → `false` (布尔值)
   - 数字字符串 → `number`
   - 其他 → `string`

2. **组件分类**：
   - Visual: View, Header, Style, Filter, Collapse, Dialog
   - Object: Image, Text, Audio, Video, HyperText, Paragraphs, Table, TimeSeries, List, RichText, Pdf
   - Control: 其他所有标签（默认）

3. **错误处理**：
   - XML 格式错误会抛出异常
   - 解析错误会显示用户友好的错误信息

