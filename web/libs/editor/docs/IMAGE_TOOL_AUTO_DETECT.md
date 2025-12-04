# Image Tool 与 Auto-Detect Tool 实现原理

本文档详细解析 Label Studio Editor 中 Image Tool 的架构以及 Auto-Detect Tool（智能工具）的实现原理和使用场景。

---

## 目录

1. [Image Tool 架构概览](#image-tool-架构概览)
2. [Tool 与 Control 的关系](#tool-与-control-的关系)
3. [Auto-Detect Tool 实现原理](#auto-detect-tool-实现原理)
4. [Smart Tool 机制](#smart-tool-机制)
5. [ML 后端交互](#ml-后端交互)
6. [使用场景与示例](#使用场景与示例)
7. [扩展开发指南](#扩展开发指南)

---

## Image Tool 架构概览

### 1.1 核心组件

Label Studio Editor 中的图像标注工具由以下核心组件构成：

```
┌─────────────────────────────────────────────────────────┐
│                    Image Object Tag                      │
│  (web/libs/editor/src/tags/object/Image/Image.js)        │
│  - 管理图像显示、缩放、旋转                              │
│  - 维护 regions 数组                                     │
│  - 注册内置工具（Zoom, Rotate, Brightness 等）          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Control Tags                            │
│  (RectangleLabels, PolygonLabels, MagicWand 等)          │
│  - 定义标注类型和标签                                    │
│  - 通过 ToolManagerMixin 注册工具                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Tools                                 │
│  (Rect, Polygon, Brush, MagicWand 等)                    │
│  - 处理用户交互（鼠标事件）                              │
│  - 创建和管理 Region                                     │
│  - 支持 smart 模式（ML 辅助）                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Regions                               │
│  (RectRegion, PolygonRegion, BrushRegion 等)            │
│  - 存储标注数据                                          │
│  - 序列化为 Label Studio 格式                           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 关键文件路径

| 组件 | 文件路径 | 说明 |
|------|----------|------|
| **Image Model** | `web/libs/editor/src/tags/object/Image/Image.js` | Image 对象标签的 MST 模型 |
| **Image View** | `web/libs/editor/src/components/ImageView/Image.jsx` | Image 的 React 视图组件 |
| **Control Base** | `web/libs/editor/src/tags/control/Base.js` | 所有 Control 标签的基类 |
| **Tool Base** | `web/libs/editor/src/tools/Base.jsx` | 所有 Tool 的基类 |
| **Tools Manager** | `web/libs/editor/src/tools/Manager.js` | 工具管理器 |
| **Toolbar** | `web/libs/editor/src/components/Toolbar/Toolbar.jsx` | 工具栏 UI 组件 |

---

## Tool 与 Control 的关系

### 2.1 注册机制

Control 标签通过 `ToolManagerMixin` 注册工具：

```javascript
// web/libs/editor/src/mixins/ToolManagerMixin.js
export const ToolManagerMixin = types.model().actions((self) => {
  return {
    afterAttach() {
      const toolNames = self.toolNames ?? [];
      const manager = ToolsManager.getInstance({ name: self.toname });
      const env = { manager, control: self };
      const tools = {};

      toolNames.forEach((toolName) => {
        if (toolName in Tools) {
          const tool = Tools[toolName].create({}, env);
          tools[toolName] = tool;
        }
      });

      self.tools = tools;
      manager.addToolsFromControl(self);
    },
  };
});
```

### 2.2 示例：RectangleLabels 注册 Rect Tool

```javascript
// web/libs/editor/src/tags/control/Rectangle.js
const Model = types
  .model({
    type: "rectanglelabels",
  })
  .volatile(() => ({
    toolNames: ["Rect", "Rect3Point"],  // 声明工具名称
  }));

const RectangleModel = types.compose(
  "RectangleModel",
  ControlBase,
  AnnotationMixin,
  SeparatedControlMixin,
  TagAttrs,
  Model,
  ToolManagerMixin,  // 混入工具管理器
);
```

### 2.3 Tool 的创建流程

1. **Control 标签初始化**：`afterAttach()` 被调用
2. **获取 ToolsManager**：为对应的 Object（如 Image）创建或获取管理器
3. **创建 Tool 实例**：根据 `toolNames` 创建工具实例
4. **注册到 Manager**：将工具添加到 ToolsManager 的工具集合中

```javascript
// web/libs/editor/src/tools/Manager.js
addTool(toolName, tool, removeDuplicatesNamed = null, prefix = guidGenerator()) {
  const name = tool.toolName ?? toolName;
  const key = `${prefix ?? this._prefix}#${name}`;
  this.tools[key] = tool;
  
  if (tool.default && !this._default_tool) {
    this._default_tool = tool;
  }
  
  // 自动选择默认工具
  if (this._default_tool && !this.hasSelected) {
    this.selectTool(this._default_tool, true, true);
  }
}
```

### 2.4 Tool 与 Control 的交互

```javascript
// Tool 通过 env 访问 Control 和 Object
const env = { 
  manager: ToolsManager,    // 工具管理器
  control: ControlTag,      // 控制标签（如 RectangleLabels）
  object: ImageModel        // 对象标签（如 Image）
};

// Tool 中访问 Control
get control() {
  return getEnv(self).control;
}

// Tool 中访问 Object
get obj() {
  return getEnv(self).object;
}
```

---

## Auto-Detect Tool 实现原理

### 3.1 什么是 Auto-Detect Tool？

Auto-Detect Tool 不是一个独立的工具，而是一个**智能工具集合的 UI 入口**。它允许用户：

- 在多个支持 ML 辅助的工具之间快速切换
- 使用 ML 后端提供的交互式预测进行标注
- 提高标注效率，减少重复工作

### 3.2 Smart Tool 的创建机制

当一个 Tool 设置了 `smart: true` 时，BaseTool 会自动创建一个动态副本：

```javascript
// web/libs/editor/src/tools/Base.jsx
const BaseTool = types
  .model("BaseTool", {
    smart: false,  // 是否支持智能模式
    // ...
  })
  .actions((self) => {
    return {
      afterCreate() {
        if (self.smart && self.control?.smart) {
          const currentEnv = getEnv(self);
          const toolType = getType(self);
          const snapshot = {
            ...getSnapshot(self),
            smart: false,      // 副本不再标记为 smart
            default: false,
          };
          
          // 创建智能工具副本
          const smartCopy = toolType.create(snapshot, env);
          smartCopy.makeDynamic();  // 标记为动态工具
          
          // 注册为独立的工具（名称后缀 -smart）
          getEnv(self).manager.addTool(
            `${toolType.name}-smart`, 
            smartCopy, 
            self.control.removeDuplicatesNamed
          );
        }
      },
      
      makeDynamic() {
        self.dynamic = true;  // 标记为动态工具
      },
    };
  });
```

### 3.3 支持 Smart 模式的工具

以下工具默认支持 Smart 模式：

| 工具 | 文件路径 | 说明 |
|------|----------|------|
| **Rect** | `web/libs/editor/src/tools/Rect.js` | 矩形标注工具 |
| **Brush** | `web/libs/editor/src/tools/Brush.jsx` | 画笔工具 |
| **MagicWand** | `web/libs/editor/src/tools/MagicWand.jsx` | 魔棒工具 |
| **KeyPoint** | `web/libs/editor/src/tools/KeyPoint.js` | 关键点工具 |
| **Bitmask** | `web/libs/editor/src/tools/Bitmask.jsx` | 位掩码工具 |

### 3.4 Toolbar 中的 Smart Tools 显示

```javascript
// web/libs/editor/src/components/Toolbar/Toolbar.jsx
const SmartTools = observer(({ tools }) => {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(tools.findIndex((t) => t.selected), 0)
  );
  
  const selected = useMemo(() => tools[selectedIndex], [selectedIndex]);
  const hasSelected = tools.some((t) => t.selected);

  return (
    tools.length > 0 && (
      <div className={cn("toolbar").elem("group").toClassName()}>
        <Tool
          smart
          label="Auto-Detect"
          active={hasSelected}
          icon={selected.iconClass}
          shortcut="tool:auto-detect"
          extra={
            tools.length > 1 ? (
              <div className={cn("toolbar").elem("smart").toClassName()}>
                {tools.map((t, i) => (
                  <div
                    key={i}
                    onClickCapture={(e) => {
                      e.preventDefault();
                      setSelectedIndex(i);
                      t.manager.selectTool(t, true);
                    }}
                  >
                    <ToolView />
                  </div>
                ))}
              </div>
            ) : null
          }
          onClick={(e) => {
            // 循环切换智能工具
            let nextIndex = selectedIndex + 1;
            if (!hasSelected) nextIndex = 0;
            else if (nextIndex >= tools.length) nextIndex = 0;
            
            const nextTool = tools[nextIndex];
            setSelectedIndex(nextIndex);
            nextTool.manager.selectTool(nextTool, true);
          }}
        />
      </div>
    )
  );
});
```

### 3.5 Auto-Detect 按钮的显示条件

Auto-Detect 按钮只在以下条件满足时显示：

1. **Auto-Annotation 已启用**：`store.autoAnnotation === true`
2. **存在 Smart Tools**：至少有一个 `dynamic: true` 的工具
3. **Control 标签启用了 Smart**：XML 配置中设置了 `smart="true"` 或 `smartOnly="true"`

```javascript
// web/libs/editor/src/components/Toolbar/Toolbar.jsx
{store.autoAnnotation && <SmartTools tools={smartTools} />}
```

---

## Smart Tool 机制

### 4.1 Smart 属性的作用

在 Control 标签中，`smart` 属性控制是否启用智能工具：

```xml
<!-- 启用智能工具（同时保留手动工具） -->
<RectangleLabels name="rect" toName="image" smart="true">
  <Label value="Person" />
</RectangleLabels>

<!-- 仅显示智能工具（隐藏手动工具） -->
<RectangleLabels name="rect" toName="image" smartOnly="true">
  <Label value="Person" />
</RectangleLabels>
```

### 4.2 Smart Tool 的工作流程

```
┌─────────────────────────────────────────────────────────┐
│  1. 用户选择 Auto-Detect 工具                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. 用户在图像上绘制（如拖拽矩形）                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. Tool 触发 ML 后端请求                               │
│     - 发送当前标注上下文                                 │
│     - 请求交互式预测                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. ML 后端返回预测结果                                  │
│     - 边界框、分割掩码、关键点等                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5. 自动接受或手动审核预测                               │
│     - autoAcceptSuggestions: 自动创建 Region            │
│     - 否则：显示预览，用户确认                           │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Smart Tool 的状态管理

```javascript
// web/libs/editor/src/stores/AppStore.js
const AppStore = types.model({
  _autoAnnotation: types.optional(types.boolean, false),
  _autoAcceptSuggestions: types.optional(types.boolean, false),
  awaitingSuggestions: false,  // 等待 ML 后端响应
  // ...
})
.views((self) => ({
  get autoAnnotation() {
    return self.forceAutoAnnotation || self._autoAnnotation;
  },
  get autoAcceptSuggestions() {
    return self.forceAutoAcceptSuggestions || self._autoAcceptSuggestions;
  },
}));
```

---

## ML 后端交互

### 5.1 交互式预测请求

当使用 Smart Tool 时，Editor 会向 ML 后端发送交互式预测请求：

**请求端点**：`POST /api/ml/predict`

**请求格式**：
```json
{
  "task": {
    "id": 123,
    "data": { "image": "https://example.com/image.jpg" }
  },
  "context": {
    "result": [
      {
        "type": "rectanglelabels",
        "value": {
          "x": 10,
          "y": 20,
          "width": 100,
          "height": 80,
          "rectanglelabels": ["Person"]
        }
      }
    ],
    "from_name": "rect",
    "to_name": "image"
  }
}
```

**响应格式**：
```json
{
  "result": [
    {
      "type": "rectanglelabels",
      "value": {
        "x": 15,
        "y": 25,
        "width": 90,
        "height": 75,
        "rectanglelabels": ["Person"]
      },
      "score": 0.95
    }
  ]
}
```

### 5.2 预测结果的处理

```javascript
// 预测结果的处理流程
1. 接收 ML 后端响应
2. 解析 result 数组
3. 根据 autoAcceptSuggestions 决定：
   - true: 自动创建 Region
   - false: 显示预览，等待用户确认
4. 更新 awaitingSuggestions 状态
```

### 5.3 非交互式预测

除了交互式预测，Label Studio 还支持非交互式预测（`interactive_mode: false`）：

```javascript
// web/libs/editor/src/stores/Annotation/store.js
function findNonInteractivePredictionResults() {
  return self.predictions.reduce((results, prediction) => {
    return [
      ...results,
      ...prediction._initialAnnotationObj
        .filter((result) => result.interactive_mode === false)
        .map((r) => ({ ...r })),
    ];
  }, []);
}
```

这些预测结果会在任务加载时自动显示在画布上。

---

## 使用场景与示例

### 6.1 基本使用场景

**场景 1：对象检测（Object Detection）**

```xml
<View>
  <Image name="image" value="$image" />
  <RectangleLabels name="rect" toName="image" smart="true">
    <Label value="Person" />
    <Label value="Car" />
  </RectangleLabels>
</View>
```

**工作流程**：
1. 用户启用 Auto-Annotation
2. 选择 Auto-Detect 工具
3. 在图像上拖拽一个矩形区域
4. ML 后端返回该区域内的对象检测结果
5. 自动或手动接受预测

**场景 2：图像分割（Image Segmentation）**

```xml
<View>
  <Image name="image" value="$image" />
  <BrushLabels name="brush" toName="image" smart="true">
    <Label value="Sky" />
    <Label value="Ground" />
  </BrushLabels>
</View>
```

**工作流程**：
1. 用户启用 Auto-Annotation
2. 选择 Auto-Detect 工具（Brush）
3. 在图像上绘制一笔
4. ML 后端返回该区域的分割掩码
5. 自动或手动接受预测

### 6.2 配置选项

**启用 Auto-Annotation**：
- 在标注界面点击 "Auto-Annotation" 按钮
- 或通过设置启用：`store.setFlags({ _autoAnnotation: true })`

**自动接受建议**：
- 在标注界面启用 "Auto accept annotation suggestions"
- 或通过设置：`store.setFlags({ _autoAcceptSuggestions: true })`

**仅显示智能工具**：
```xml
<RectangleLabels name="rect" toName="image" smartOnly="true">
  <Label value="Person" />
</RectangleLabels>
```

### 6.3 完整示例

```xml
<!-- config.xml -->
<View>
  <Header value="智能标注示例" />
  <Image name="image" value="$image" zoomControl="true" />
  
  <!-- 矩形标注（支持智能工具） -->
  <RectangleLabels name="rect" toName="image" smart="true">
    <Label value="Person" background="green" />
    <Label value="Car" background="blue" />
  </RectangleLabels>
  
  <!-- 画笔标注（仅智能工具） -->
  <BrushLabels name="brush" toName="image" smartOnly="true">
    <Label value="Sky" />
    <Label value="Ground" />
  </BrushLabels>
</View>
```

```json
// tasks.json
[
  {
    "data": {
      "image": "https://example.com/image.jpg"
    },
    "predictions": [
      {
        "model_version": "yolo-v5",
        "result": [
          {
            "from_name": "rect",
            "to_name": "image",
            "type": "rectanglelabels",
            "value": {
              "x": 10,
              "y": 20,
              "width": 100,
              "height": 80,
              "rectanglelabels": ["Person"]
            },
            "score": 0.95
          }
        ]
      }
    ]
  }
]
```

---

## 扩展开发指南

### 7.1 为现有工具添加 Smart 支持

如果要将一个现有工具改为支持 Smart 模式：

```javascript
// web/libs/editor/src/tools/YourTool.jsx
const _Tool = types
  .model("YourTool", {
    group: "segmentation",
    shortcut: "tool:your-tool",
    smart: true,  // 启用 Smart 支持
    // ...
  })
  .actions((self) => ({
    // 在绘制完成后触发 ML 后端请求
    commitDrawingRegion() {
      const region = Super.commitDrawingRegion();
      
      // 如果启用了 autoAnnotation，请求预测
      if (self.store.autoAnnotation && self.dynamic) {
        self.requestSuggestions(region);
      }
      
      return region;
    },
    
    async requestSuggestions(region) {
      // 发送请求到 ML 后端
      // 处理响应并创建预测 Region
    },
  }));
```

### 7.2 创建新的 Smart Tool

1. **定义 Tool Model**：
```javascript
const YourSmartTool = types
  .model("YourSmartTool", {
    smart: true,
    group: "segmentation",
    shortcut: "tool:your-smart-tool",
  })
  .actions((self) => ({
    // 实现交互逻辑
  }));
```

2. **在 Control 标签中注册**：
```javascript
const YourControlModel = types
  .model({
    type: "yourcontrol",
  })
  .volatile(() => ({
    toolNames: ["YourSmartTool"],
  }));
```

3. **在 XML 配置中启用**：
```xml
<YourControl name="control" toName="image" smart="true">
  <Label value="Label1" />
</YourControl>
```

### 7.3 自定义 ML 后端交互

如果需要自定义 ML 后端的交互逻辑：

```javascript
// 在 Tool 中实现自定义请求逻辑
async requestCustomSuggestions(context) {
  const response = await fetch('/api/ml/custom-predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task: self.store.task.data,
      context: context,
    }),
  });
  
  const data = await response.json();
  return data.result;
}
```

---

## 总结

### 关键要点

1. **Auto-Detect 不是独立工具**：它是一个 UI 组件，用于管理所有 Smart Tools
2. **Smart Tool 是动态副本**：当工具设置 `smart: true` 时，BaseTool 会自动创建动态副本
3. **ML 后端交互**：Smart Tools 通过 `/api/ml/predict` 端点获取交互式预测
4. **状态管理**：通过 `autoAnnotation` 和 `autoAcceptSuggestions` 控制行为
5. **扩展性**：可以轻松为现有工具添加 Smart 支持或创建新的 Smart Tool

### 相关文档

- [Image Component 文档](./IMAGE_COMPONENT.md)
- [Tool Shortcut 实现](./TOOL_SHORTCUT_IMPLEMENTATION.md)
- [XML to React 渲染](./XML_TO_REACT_RENDERING.md)
- [Predictions 配置说明](./PREDICTIONS.md)

### 参考代码

- **Toolbar 组件**：`web/libs/editor/src/components/Toolbar/Toolbar.jsx`
- **Base Tool**：`web/libs/editor/src/tools/Base.jsx`
- **Tools Manager**：`web/libs/editor/src/tools/Manager.js`
- **App Store**：`web/libs/editor/src/stores/AppStore.js`

