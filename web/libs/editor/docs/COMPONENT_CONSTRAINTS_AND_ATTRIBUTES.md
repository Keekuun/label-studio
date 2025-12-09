# Label Studio 组件约束与属性完整文档

本文档详细列出了 Label Studio Editor 中所有组件的约束关系、嵌套规则和属性定义，用于完善 visual-editor 项目的组件拖拽和放置约束。

## 目录

1. [组件分类](#组件分类)
2. [组件约束规则](#组件约束规则)
3. [Visual 组件](#visual-组件)
4. [Object 组件](#object-组件)
5. [Control 组件](#control-组件)
6. [Label Item 组件](#label-item-组件)

---

## 组件分类

Label Studio 组件分为三大类：

- **Visual 组件**：用于布局和视觉展示，如 `View`、`Header`
- **Object 组件**：用于显示数据，如 `Image`、`Text`、`Audio`
- **Control 组件**：用于标注控制，如 `RectangleLabels`、`Choices`、`Labels`
- **Label Item 组件**：标签项，如 `Label`、`Choice`

---

## 组件约束规则

### 1. 子组件约束（Children Constraints）

每个组件通过 `children: Types.unionArray([...])` 定义可以包含的子组件类型。

### 2. 对象绑定约束（toName Constraints）

Control 组件通过 `controlledTags: Types.unionTag([...])` 定义可以绑定到的 Object 组件类型。

### 3. 父组件约束（Parent Constraints）

某些组件（如 `Label`）通过 `parentTypes` 定义只能作为特定组件的子组件。

---

## Visual 组件

### View

**类型**: `view`  
**分类**: Visual  
**描述**: 用于配置块的显示，类似于 HTML 的 div 标签

**允许的子组件**:
```javascript
[
  "view", "header", "markdown", "labels", "label", "table", "taxonomy",
  "choices", "choice", "collapse", "datetime", "number", "rating", "ranker",
  "rectangle", "ellipse", "polygon", "keypoint", "brush", "bitmask", "magicwand",
  "ruler", "rectanglelabels", "ellipselabels", "polygonlabels", "vector",
  "vectorlabels", "keypointlabels", "brushlabels", "hypertextlabels",
  "timeserieslabels", "bitmasklabels", "text", "audio", "image", "hypertext",
  "richtext", "timeseries", "audioplus", "list", "dialog", "textarea",
  "pairwise", "style", "relations", "filter", "pagedview", "paragraphs",
  "paragraphlabels", "pdf", "video", "videorectangle", "timelinelabels",
  "custominterface", ...Registry.customTags
]
```

**属性**:
- `classname` (string, optional, default: ""): CSS 类名
- `display` (string, optional, default: "block"): 显示方式，`block` 或 `inline`
- `style` (string, nullable): CSS 样式字符串
- `idattr` (string, optional, default: ""): 唯一 ID 属性
- `visibleWhen` (string, optional): 控制可见性，可选值：
  - `region-selected`: 区域被选中时显示
  - `choice-selected`: 选择被选中时显示
  - `no-region-selected`: 没有区域被选中时显示
  - `choice-unselected`: 选择未选中时显示
- `whenTagName` (string, optional): 与 `visibleWhen` 配合使用，指定标签名称
- `whenLabelValue` (string, optional): 与 `visibleWhen="region-selected"` 配合使用，指定标签值（多个值用逗号分隔）
- `whenChoiceValue` (string, optional): 与 `visibleWhen` 配合使用，指定选择值（多个值用逗号分隔）

---

### Header

**类型**: `header`  
**分类**: Visual  
**描述**: 显示标题文本

**允许的子组件**: 无

**属性**:
- `value` (string, required): 标题文本，可以是静态文本或数据字段名（如 `$text`）
- `size` (string, optional, default: "4"): 标题级别（1-5），用于控制文本大小
- `style` (string, nullable): CSS 样式字符串
- `underline` (boolean, optional, default: false): 是否显示下划线

---

### PagedView

**类型**: `pagedview`  
**分类**: Visual  
**描述**: 分页视图，用于显示多个子视图

**允许的子组件**:
```javascript
[
  "view", "header", "labels", "label", "table", "taxonomy", "choices", "choice",
  "collapse", "datetime", "number", "rating", "ranker", "rectangle", "ellipse",
  "polygon", "keypoint", "brush", "magicwand", "rectanglelabels", "ellipselabels",
  "polygonlabels", "vector", "vectorlabels", "keypointlabels", "brushlabels",
  "hypertextlabels", "timeserieslabels", "text", "audio", "image", "hypertext",
  "richtext", "timeseries", "audioplus", "list", "dialog", "textarea", "pairwise",
  "style", "relations", "filter", "timeseries", "timeserieslabels", "pagedview",
  "paragraphs", "paragraphlabels", "video", "videorectangle"
]
```

**属性**: 无特殊属性（继承自 AnnotationMixin）

---

## Object 组件

### Image

**类型**: `image`  
**分类**: Object  
**描述**: 显示图像数据，用于图像标注任务

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `RectangleLabels`, `Rectangle`
- `PolygonLabels`, `Polygon`
- `EllipseLabels`, `Ellipse`
- `KeyPointLabels`, `KeyPoint`
- `BrushLabels`, `Brush`
- `BitmaskLabels`, `Bitmask`
- `Ruler`
- `VectorLabels`, `Vector`

**属性**:
- `name` (string, required): 图像对象的唯一标识
- `value` (string, nullable): 图像数据路径或 URL，如 `$image`
- `valueList` (string, nullable): 引用包含图像 URL 列表的变量，用于多页文档标注
- `width` (string, optional, default: "100%"): 图像宽度
- `height` (string, nullable): 图像高度
- `maxwidth` (string, optional, default: "100%"): 最大图像宽度
- `maxheight` (string, optional, default: "calc(100vh - 194px)"): 最大图像高度
- `zoom` (boolean, optional, default: true): 是否允许使用鼠标滚轮缩放图像
- `negativezoom` (boolean, optional, default: false): 是否允许缩小图像
- `zoomby` (string, optional, default: "1.1"): 缩放因子
- `zoomcontrol` (boolean, optional, default: true): 是否显示缩放控制按钮
- `brightnesscontrol` (boolean, optional, default: false): 是否显示亮度控制按钮
- `contrastcontrol` (boolean, optional, default: false): 是否显示对比度控制按钮
- `rotatecontrol` (boolean, optional, default: false): 是否显示旋转控制按钮
- `selectioncontrol` (boolean, optional, default: true): 是否显示选择控制
- `crosshair` (boolean, optional, default: false): 是否显示十字准线光标
- `grid` (boolean, optional, default: false): 是否显示网格
- `gridsize` (string, optional, default: "30"): 网格大小
- `gridcolor` (string, optional, default: "#EEEEF4"): 网格颜色（十六进制）
- `showlabels` (boolean, optional, default: false): 是否显示标签
- `showMousePos` (boolean, optional, default: false): 是否显示鼠标位置信息
- `smoothing` (boolean, nullable): 是否启用平滑处理
- `horizontalalignment` (enum, optional, default: "left"): 水平对齐方式，可选值：`left`, `center`, `right`
- `verticalalignment` (enum, optional, default: "top"): 垂直对齐方式，可选值：`top`, `center`, `bottom`
- `defaultzoom` (enum, optional, default: "fit"): 初始缩放方式，可选值：`auto`, `original`, `fit`
- `crossorigin` (enum, optional, default: "none"): CORS 跨域配置，可选值：`none`, `anonymous`, `use-credentials`
- `lazyoff` (boolean, optional, default: false): 关闭懒加载（用于测试）

---

### Text

**类型**: `text`  
**分类**: Object  
**描述**: 显示文本数据，用于文本标注任务

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `Labels`
- `Choices`
- `TextArea`

**属性**:
- `name` (string, required): 文本对象的唯一标识
- `value` (string, required): 文本数据路径，如 `$text`
- `valueType` (enum, optional, default: "text"): 值类型，可选值：`text`, `url`
- `saveTextResult` (enum, optional): 是否在结果中存储标注的文本，可选值：`yes`, `no`
- `encoding` (enum, optional): 编码方式，可选值：`none`, `base64`, `base64unicode`
- `selectionEnabled` (boolean, optional, default: true): 是否启用选择
- `highlightColor` (string, optional): 高亮颜色（十六进制字符串）
- `showLabels` (boolean, optional): 是否显示标签
- `granularity` (enum, optional): 选择粒度，可选值：`symbol`, `word`, `sentence`, `paragraph`

---

### Audio

**类型**: `audio`  
**分类**: Object  
**描述**: 播放音频并显示波形，用于音频标注任务

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `Labels`
- `Choices`
- `TextArea`
- `Rating`
- `Number`

**属性**:
- `name` (string, required): 音频对象的唯一标识
- `value` (string, nullable): 音频数据路径或 URL
- `defaultSpeed` (string, optional, default: "1"): 默认速度级别（0.5 到 2）
- `defaultScale` (string, optional, default: "1"): 音频面板默认 y 轴缩放
- `defaultZoom` (string, optional, default: "1"): 波形的默认缩放级别（1 到 1500）
- `defaultVolume` (string, optional, default: "1"): 默认音量级别（0 到 1）
- `hotkey` (string, nullable): 用于播放或暂停音频的快捷键
- `sync` (string, nullable): 要同步的对象名称
- `height` (string, optional, default: "96"): 音频播放器的总高度
- `waveHeight` (string, optional, default: "32"): 在 `splitChannels` 模式下显示多个通道时波形的最小高度
- `spectrogram` (boolean, optional, default: false): 是否在加载时自动显示音频频谱图
- `splitChannels` (boolean, optional, default: false): 是否分别显示多个音频通道（如果音频文件有多个通道）
- `decoder` (enum, optional, default: "webaudio"): 用于解码音频数据的解码器类型，可选值：`webaudio`, `ffmpeg`, `none`
- `player` (enum, optional, default: "html5"): 用于播放音频数据的播放器类型，可选值：`html5`, `webaudio`
- `muted` (boolean, optional, default: false): 是否静音
- `zoom` (boolean, optional, default: true): 是否允许缩放
- `volume` (boolean, optional, default: true): 是否显示音量控制
- `speed` (boolean, optional, default: true): 是否显示速度控制
- `showLabels` (boolean, optional, default: false): 是否显示标签
- `showScores` (boolean, optional, default: false): 是否显示分数
- `cursorWidth` (string, optional, default: "2"): 光标宽度
- `cursorColor` (string, optional, default: "#333"): 光标颜色
- `autoCenter` (boolean, optional, default: true): 是否自动居中
- `scrollParent` (boolean, optional, default: true): 是否滚动父容器

---

### HyperText

**类型**: `hypertext`  
**分类**: Object  
**描述**: 显示超文本标记（HTML），用于标注 HTML 编码的文本和网页

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `HyperTextLabels`
- `Choices`
- `TextArea`

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, optional): 元素的值
- `valueType` (enum, optional, default: "text"): 值类型，可选值：`text`, `url`
- `inline` (boolean, optional, default: false): 是否将 HTML 直接嵌入 Label Studio 或使用 iframe
- `saveTextResult` (enum, optional): 是否在结果中存储标注的文本，可选值：`yes`, `no`
- `encoding` (enum, optional): 编码方式，可选值：`none`, `base64`, `base64unicode`
- `selectionEnabled` (boolean, optional, default: true): 是否启用选择
- `clickableLinks` (boolean, optional, default: false): 是否允许从超文本标记中的链接打开资源
- `highlightColor` (string, optional): 高亮颜色（十六进制字符串）
- `showLabels` (boolean, optional): 是否显示标签
- `granularity` (enum, optional): 选择粒度，可选值：`symbol`, `word`, `sentence`, `paragraph`

---

### RichText

**类型**: `richtext`  
**分类**: Object  
**描述**: 显示文本或 HTML 并允许标注

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `Labels`
- `Choices`
- `TextArea`

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 元素的值
- `valueType` (enum, optional): 值类型，可选值：`text`, `url`（默认根据安全模式）
- `inline` (boolean, optional, default: false): 是否将 HTML 直接嵌入或使用 iframe
- `saveTextResult` (enum, optional): 是否保存选中的文本到序列化数据，可选值：`none`, `no`, `yes`
- `selectionEnabled` (boolean, optional, default: true): 是否启用选择
- `clickableLinks` (boolean, optional, default: false): 是否允许打开链接资源
- `highlightColor` (string, nullable): 高亮颜色（十六进制）
- `showLabels` (boolean, nullable): 是否显示标签
- `encoding` (enum, optional, default: "none"): 编码方式，可选值：`none`, `base64`, `base64unicode`
- `granularity` (enum, optional, default: "symbol"): 选择粒度，可选值：`symbol`, `word`, `sentence`, `paragraph`

---

### TimeSeries

**类型**: `timeseries`  
**分类**: Object  
**描述**: 用于标注时间序列数据

**允许的子组件**:
```javascript
["channel", "timeseriesoverview", "view", "hypertext", "multichannel"]
```

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `TimeSeriesLabels`

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, required): 用于查找数据的键，如果 `valueType=url` 则为时间序列的 URL，否则期望 JSON
- `valueType` (enum, optional, default: "url"): 时间序列数据的格式，可选值：`url`, `json`
- `sync` (string, nullable): 要同步的对象名称
- `cursorColor` (string, optional, default: "var(--color-neutral-inverted-surface)"): 同步中使用的播放光标颜色
- `timeColumn` (string, optional): 提供时间值的列名或索引
- `timeFormat` (string, optional): 用于解析 `timeColumn` 中值的模式（d3 strftime 格式）
- `timeDisplayFormat` (string, optional): 用于显示时间值的格式
- `durationDisplayFormat` (string, optional, default: ".0f"): 用于显示时间持续值的格式
- `sep` (string, optional, default: ","): CSV 文件的分隔符
- `overviewChannels` (string, optional): 在概览中显示的通道名称或索引的逗号分隔列表
- `overviewWidth` (string, optional, default: "25%"): 概览窗口的默认宽度（百分比）
- `fixedScale` (boolean, optional, default: false): 是否将 y 轴缩放到最大值以适合所有值
- `multiAxis` (boolean, optional, default: false): 是否在同一视图中显示通道
- `hotkey` (string, nullable): 快捷键

---

### Video

**类型**: `video`  
**分类**: Object  
**描述**: 播放简单的视频文件，用于视频分类和转录等标注任务

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `Choices`
- `TextArea`
- `TimelineLabels`
- `VideoRectangle`
- `Labels`

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 视频的 URL
- `frameRate` (number, optional, default: 24): 视频帧率（每秒帧数），可以使用任务数据如 `$fps`
- `sync` (string, nullable): 要同步的对象名称
- `muted` (boolean, optional, default: false): 是否静音视频
- `height` (number, optional, default: 600): 视频播放器的高度
- `timelineHeight` (number, nullable): 带区域的时间轴高度
- `defaultPlaybackSpeed` (number, optional, default: 1): 播放器加载时应开始的默认播放速度
- `minPlaybackSpeed` (number, optional, default: 0.25): 允许的最小播放速度
- `hotkey` (string, nullable): 快捷键

---

### Table

**类型**: `table`  
**分类**: Object  
**描述**: 以表格形式显示对象的键和值

**允许的子组件**: 无

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 包含 JSON 类型的数据字段值
- `valueType` (string, optional, default: "json"): 定义 Table 中数据类型的值

**数据格式**: 
- JSON 数组对象：每个对象作为一行，键作为列
- JSON 对象：键值对表示
- JSON 数组（原始值）：索引作为键

---

### List

**类型**: `list`  
**分类**: Object  
**描述**: 显示相似项目的列表，如文章、搜索结果等

**允许的子组件**: 无

**对象绑定约束**: 可以被 `Ranker` 组件绑定

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 包含对象数组的数据字段（每个对象应包含 `id`, `title`, `body`, `html` 字段）
- `title` (string, optional, default: ""): 列表的标题

**数据格式**: 应该是对象数组，每个对象包含：
- `id` (string): 唯一标识符
- `title` (string): 标题
- `body` (string, optional): 正文内容
- `html` (string, optional): HTML 内容

---

### Paragraphs

**类型**: `paragraphs`  
**分类**: Object  
**描述**: 在标注界面上显示段落文本，用于标注对话转录

**允许的子组件**: 无

**对象绑定约束**: 可以被以下 Control 组件绑定：
- `ParagraphLabels`
- `Choices`
- `TextArea`

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 包含段落内容的数据字段
- `valueType` (enum, optional, default: "json"): 数据类型，可选值：`json`, `url`
- `audioUrl` (string, nullable): 用于同步短语的音频
- `sync` (string, nullable): 要同步的对象名称
- `showPlayer` (boolean, optional, default: false): 是否在段落上方显示音频播放器
- `saveTextResult` (enum, optional, default: "yes"): 是否在结果中存储标注的文本，可选值：`none`, `no`, `yes`
- `layout` (enum, optional, default: "none"): 是否使用对话样式布局，可选值：`none`, `dialogue`
- `nameKey` (string, optional, default: "author"): 用于名称的键字段
- `textKey` (string, optional, default: "text"): 用于文本的键字段
- `contextScroll` (boolean, optional, default: false): 是否开启上下文滚动模式
- `highlightColor` (string, nullable): 高亮颜色
- `showLabels` (boolean, optional, default: false): 是否显示标签

**数据格式**: 应该是对象数组，每个对象包含：
- `[$nameKey]` (string): 作者名称（默认 `author`）
- `[$textKey]` (string): 文本内容（默认 `text`）
- `start` (number, optional): 开始时间（秒）
- `end` (number, optional): 结束时间（秒）

---

### Pdf

**类型**: `pdf`  
**分类**: Object  
**描述**: 用于从 URL 显示 PDF 文档

**允许的子组件**: 无

**属性**:
- `name` (string, required): 元素的名称
- `value` (string, nullable): 包含 PDF URL 的数据字段值

---

## Control 组件

### RectangleLabels

**类型**: `rectanglelabels`  
**分类**: Control  
**描述**: 用于在图像上标注矩形区域

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required, default: "tag"): 矩形标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称（必须引用 Image 组件的 name）
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `fillOpacity` (string, optional, default: "0.5"): 矩形的填充透明度（0-1），如 `0.5`
- `strokeWidth` (string, optional, default: "5"): 矩形边框的宽度，如 `5`
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `fillColor` (string, optional): 填充颜色（十六进制）
- `opacity` (string, optional, default: "0.6"): 矩形的透明度（0-1）
- `canRotate` (boolean, optional, default: true): 是否允许旋转矩形
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`

---

### Rectangle

**类型**: `rectangle`  
**分类**: Control  
**描述**: 添加矩形（边界框）到图像，无需选择标签

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `opacity` (string, optional, default: "0.2"): 矩形的透明度（0-1）
- `fillColor` (string, optional, default: "#f48a42"): 填充颜色（十六进制）
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `strokeWidth` (string, optional, default: "1"): 边框宽度
- `fillOpacity` (string, nullable): 填充透明度（0-1）
- `canRotate` (boolean, optional, default: true): 是否显示旋转控制
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`

---

### PolygonLabels

**类型**: `polygonlabels`  
**分类**: Control  
**描述**: 用于在图像上标注多边形区域

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 多边形标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `strokeWidth` (string, optional, default: "5"): 多边形边框的宽度
- `fillColor` (string, optional, default: "red"): 填充颜色（十六进制）
- `strokeColor` (string, optional): 边框颜色（十六进制）
- `opacity` (string, optional, default: "0.2"): 多边形的透明度（0-1）
- `pointSize` (enum, optional, default: "medium"): 多边形控制点的大小，可选值：`small`, `medium`, `large`
- `pointStyle` (enum, optional, default: "circle"): 控制点的样式，可选值：`rectangle`, `circle`
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`

---

### EllipseLabels

**类型**: `ellipselabels`  
**分类**: Control  
**描述**: 用于在图像上标注椭圆区域

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 椭圆标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `fillOpacity` (string, optional, default: "0.5"): 椭圆的填充透明度（0-1）
- `strokeWidth` (string, optional, default: "3"): 椭圆边框的宽度
- `strokeColor` (string, optional): 边框颜色（十六进制）
- `fillColor` (string, optional): 填充颜色（十六进制）
- `opacity` (string, optional, default: "0.6"): 椭圆的透明度（0-1）
- `canRotate` (boolean, optional, default: true): 是否显示旋转选项

---

### Labels

**类型**: `labels`  
**分类**: Control  
**描述**: 用于在文本上标注标签（命名实体识别等）

**允许的子组件**:
```javascript
["label", "header", "view", "text", "hypertext", "richtext"]
```

**对象绑定约束**: 可以绑定到 `Text`、`Audio` 等对象

**属性**:
- `name` (string, required, default: "tag"): 标签控件的唯一标识
- `toName` (string, required): 要标注的对象名称（必须引用 Object 组件的 name）
- `choice` (enum, optional, default: "multiple"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `opacity` (string, optional, default: "0.2"): 标签高亮的透明度（0-1）
- `fillColor` (string, optional, default: "#f48a42"): 填充颜色（十六进制）
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `strokeWidth` (string, optional, default: "1"): 边框宽度
- `fillOpacity` (string, nullable): 填充透明度（0-1）
- `allowEmpty` (boolean, optional, default: false): 是否允许空标签
- `value` (string, optional, default: ""): 任务数据字段，包含动态加载的标签列表

---

### Choices

**类型**: `choices`  
**分类**: Control  
**描述**: 用于分类任务的选择控件（单选或多选）

**允许的子组件**:
```javascript
["choice", "view", "header", "hypertext"]
```

**对象绑定约束**: 可以绑定到任何 Object 组件（`Image`、`Text`、`Audio` 等）

**属性**:
- `name` (string, required, default: "choice"): 选择控件的唯一标识
- `toName` (string, required): 要分类的对象名称（必须引用 Object 组件的 name）
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `single-radio`, `multiple`
- `showInline` (boolean, nullable): 是否在同一视觉行显示选项（已弃用，使用 `layout` 代替）
- `layout` (enum, optional, default: "vertical"): 布局方式，可选值：`select`, `inline`, `vertical`
- `required` (boolean, optional, default: false): 是否必填
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `perRegion` (boolean, optional): 是否用于特定区域而不是整个任务
- `perItem` (boolean, optional): 是否用于对象内的特定项而不是整个对象
- `value` (string, optional, default: ""): 任务数据字段，包含动态加载的选择列表
- `allowNested` (boolean, optional, default: false): 是否允许在动态选择中使用 `children` 字段进行嵌套
- `visibleWhen` (enum, optional): 控制可见性，可选值：`region-selected`, `no-region-selected`, `choice-selected`, `choice-unselected`
- `whenTagName` (string, optional): 与 `visibleWhen` 配合使用，指定标签名称
- `whenLabelValue` (string, optional): 与 `visibleWhen="region-selected"` 配合使用，指定标签值
- `whenChoiceValue` (string, optional): 与 `visibleWhen` 配合使用，指定选择值

---

### KeyPointLabels

**类型**: `keypointlabels`  
**分类**: Control  
**描述**: 用于在图像上标注关键点（如面部特征识别）

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 关键点标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `opacity` (string, optional, default: "0.9"): 关键点的透明度（0-1）
- `strokeWidth` (number, optional, default: 1): 边框宽度
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`

---

### BrushLabels

**类型**: `brushlabels`  
**分类**: Control  
**描述**: 用于图像分割任务，使用画笔工具绘制区域

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 画笔标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签

---

### BitmaskLabels

**类型**: `bitmasklabels`  
**分类**: Control  
**描述**: 用于像素级图像分割任务，输出 Base64 编码的 PNG 数据 URL

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 位掩码标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签

**注意事项**: 需要在 Image 标签上设置 `smoothing="false"` 才能处理单个像素

---

### TextArea

**类型**: `textarea`  
**分类**: Control  
**描述**: 用于显示文本输入区域，用于转录、释义或字幕任务

**允许的子组件**:
```javascript
["shortcut"]
```

**对象绑定约束**: 可以绑定到 `Audio`、`Image`、`HTML`、`Paragraphs`、`Text`、`TimeSeries`、`Video` 等对象

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的元素名称
- `value` (string, nullable): 预填充的值
- `label` (string, optional, default: ""): 标签文本
- `placeholder` (string, nullable): 占位符文本
- `maxSubmissions` (string, nullable): 最大提交次数
- `editable` (boolean, optional, default: false): 是否显示可编辑的文本区域
- `skipDuplicates` (boolean, optional, default: false): 防止文本区域输入中的重复项
- `transcription` (boolean, optional, default: false): 如果为 false，始终显示编辑器
- `displayMode` (enum, optional, default: "tag"): 文本区域的显示模式，可选值：`tag`, `region-list`
- `rows` (string, optional, default: "1"): 文本区域的行数
- `required` (boolean, optional, default: false): 是否验证文本区域内容为必填
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `showSubmitButton` (boolean, optional): 是否显示或隐藏提交按钮
- `perRegion` (boolean, optional): 是否用于标注区域而不是整个对象
- `perItem` (boolean, optional): 是否用于标注对象内的项而不是整个对象
- `allowSubmit` (boolean, optional, default: true): 是否允许提交

---

### Ruler

**类型**: `ruler`  
**分类**: Control  
**描述**: 用于在图像上测量距离和比例的标尺工具

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, required): 要标注的图像名称

---

### Ellipse

**类型**: `ellipse`  
**分类**: Control  
**描述**: 添加椭圆边界框到图像，无需选择标签

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `opacity` (string, optional, default: "0.2"): 椭圆的透明度（0-1）
- `fillColor` (string, optional, default: "#f48a42"): 填充颜色（十六进制）
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `strokeWidth` (string, optional, default: "1"): 边框宽度
- `fillOpacity` (string, nullable): 填充透明度（0-1）
- `canRotate` (boolean, optional, default: true): 是否显示旋转控制
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注

---

### Polygon

**类型**: `polygon`  
**分类**: Control  
**描述**: 添加多边形到图像，无需选择标签

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `opacity` (string, optional, default: "0.2"): 多边形的透明度（0-1）
- `fillColor` (string, optional, default: "#f48a42"): 填充颜色（十六进制）
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `strokeWidth` (string, optional, default: "2"): 边框宽度
- `pointSize` (enum, optional, default: "small"): 多边形控制点的大小，可选值：`small`, `medium`, `large`
- `pointStyle` (enum, optional, default: "circle"): 控制点的样式，可选值：`rectangle`, `circle`
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注

---

### KeyPoint

**类型**: `keypoint`  
**分类**: Control  
**描述**: 添加关键点到图像，无需选择标签

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `opacity` (string, optional, default: "0.9"): 关键点的透明度（0-1）
- `fillColor` (string, optional, default: "#8bad00"): 关键点填充颜色（十六进制）
- `strokeWidth` (string, optional, default: "2"): 边框宽度
- `strokeColor` (string, optional, default: "#8bad00"): 关键点边框颜色（十六进制）
- `snap` (enum, optional, default: "none"): 是否吸附到图像像素，可选值：`pixel`, `none`
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注

---

### Brush

**类型**: `brush`  
**分类**: Control  
**描述**: 用于图像分割任务，使用画笔工具绘制区域

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `strokeWidth` (string, optional, default: "15"): 画笔笔触宽度
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注

---

### Bitmask

**类型**: `bitmask`  
**分类**: Control  
**描述**: 用于像素级图像分割任务，输出 Base64 编码的 PNG 数据 URL

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `strokeWidth` (string, optional, default: "15"): 画笔笔触宽度
- `smart` (boolean, optional): 显示智能工具用于交互式预标注
- `smartOnly` (boolean, optional): 仅显示智能工具用于交互式预标注

**注意事项**: 需要在 Image 标签上设置 `smoothing="false"` 才能处理单个像素

---

### MagicWand

**类型**: `magicwand`  
**分类**: Control  
**描述**: 智能分割工具，点击图像区域并拖动鼠标动态更改洪水填充容差

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的图像名称
- `opacity` (string, optional, default: "0.6"): Magic Wand 区域使用时的透明度（0-1）
- `blurRadius` (string, optional, default: "5"): Magic Wand 区域边缘的模糊半径
- `defaultThreshold` (string, optional, default: "15"): 用户初始点击而不拖动时，颜色必须与初始选择的像素相差多远才能被选择

**注意事项**: 
- 需要像素级访问图像，如果图像托管在第三方域上，需要配置 CORS
- Image 标签需要正确设置 `crossOrigin` 属性

---

### Ranker

**类型**: `ranker`  
**分类**: Control  
**描述**: 用于对 `List` 中的项目进行排序或从 `List` 中选择相关项目

**允许的子组件**:
```javascript
["bucket"]  // Bucket 组件
```

**对象绑定约束**: 只能绑定到 `List`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要连接的 List 标签名称
- `collapsible` (boolean, optional, default: true): 是否可折叠

**Bucket 子组件属性**:
- `name` (string, required): Bucket 的名称
- `title` (string, optional): Bucket 的标题（用于显示列标题）
- `default` (boolean, optional): 此 Bucket 将默认用于显示 `List` 的结果

**使用模式**:
- **排序模式**：不使用 Bucket，直接对 List 中的项目进行排序
- **选择模式**：使用 Bucket，将项目移动到不同的 Bucket 中
- **分组模式**：使用 Bucket 并设置 `default="true"`，所有项目默认放在该 Bucket 中

---

### Pairwise

**类型**: `pairwise`  
**分类**: Control  
**描述**: 用于比较两个不同的对象并从列表中选择一个项目

**允许的子组件**: 无

**对象绑定约束**: 可以绑定到任何两个 Object 组件（通过逗号分隔的 `toName`）

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要比较的元素名称（逗号分隔，如 `"txt-1,txt-2"`）
- `selectionStyle` (string, nullable): 选择的样式
- `leftClass` (string, optional, default: "left"): 左侧对象的类名
- `rightClass` (string, optional, default: "right"): 右侧对象的类名

**结果值**: `selected` 字段，值为 `"left"`, `"right"`, 或 `"none"`

---

### Relations

**类型**: `relations`  
**分类**: Control  
**描述**: 用于创建区域之间的标签关系

**允许的子组件**:
```javascript
["relation"]  // Relation 组件
```

**属性**:
- `choice` (enum, optional, default: "multiple"): 选择模式，可选值：`single`, `multiple`

**Relation 子组件属性**:
- `value` (string, required): 关系的值
- `background` (string, optional): 活动标签的背景颜色（十六进制）

**使用说明**: 与 `Labels` 组件配合使用，用于标注区域之间的关系

---

### TimelineLabels

**类型**: `timelinelabels`  
**分类**: Control  
**描述**: 用于对视频帧进行分类（单帧或帧范围）

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Video`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 视频元素的名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签

**使用说明**: 
- 首先选择一个标签，然后点击一次标注单帧
- 点击并拖动标注多个帧
- 可以通过 Video 标签的 `timelineHeight` 参数增加时间轴高度

---

### VideoRectangle

**类型**: `videorectangle`  
**分类**: Control  
**描述**: 为视频带来对象跟踪功能，与 `<Video/>` 和 `<Labels/>` 标签配合使用

**允许的子组件**: 无

**对象绑定约束**: 只能绑定到 `Video`

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要控制的元素名称（视频）

**使用说明**: 需要配合 `Labels` 组件使用，用于在视频中跟踪对象

---

### Shortcut

**类型**: `shortcut`  
**分类**: Control  
**描述**: 定义快捷键，标注者可以使用快捷键添加预定义对象

**允许的子组件**: 无

**父组件约束**: 只能作为 `TextArea` 组件的子组件

**属性**:
- `value` (string, required): 快捷键的值
- `alias` (string, nullable): 快捷键别名
- `hotkey` (string, nullable): 快捷键组合
- `background` (string, optional, default: "#333333"): 背景颜色（十六进制）

---

### VectorLabels

**类型**: `vectorlabels`  
**分类**: Control  
**描述**: 用于在图像上标注向量路径（支持贝塞尔曲线）

**允许的子组件**:
```javascript
["label", "vectorlabel", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Image`

**属性**:
- `name` (string, required): 向量标签控件的唯一标识
- `toName` (string, required): 要标注的图像对象名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `curves` (boolean, optional): 是否启用贝塞尔曲线支持
- `closable` (boolean, optional): 是否允许闭合路径
- `minPoints` (string, optional): 最小点数
- `maxPoints` (string, optional): 最大点数
- `skeleton` (boolean, optional): 是否启用骨架模式（用于分支路径）

---

### HyperTextLabels

**类型**: `hypertextlabels`  
**分类**: Control  
**描述**: 用于在 HTML 文本上标注标签

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `HyperText`

**属性**:
- `name` (string, required): 超文本标签控件的唯一标识
- `toName` (string, required): 要标注的 HTML 元素名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签

---

### ParagraphLabels

**类型**: `paragraphlabels`  
**分类**: Control  
**描述**: 用于在段落文本上标注标签

**允许的子组件**:
```javascript
["label", "header", "view", "hypertext"]
```

**对象绑定约束**: 只能绑定到 `Paragraphs`

**属性**:
- `name` (string, required): 段落标签控件的唯一标识
- `toName` (string, required): 要标注的段落元素名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签

---

### TimeSeriesLabels

**类型**: `timeserieslabels`  
**分类**: Control  
**描述**: 用于在时间序列数据上标注时间范围

**允许的子组件**:
```javascript
["labels", "label", "choice"]
```

**对象绑定约束**: 只能绑定到 `TimeSeries`

**属性**:
- `name` (string, required): 时间序列标签控件的唯一标识
- `toName` (string, required): 要标注的时间序列元素名称
- `choice` (enum, optional, default: "single"): 选择模式，可选值：`single`, `multiple`
- `maxUsages` (string, nullable): 每个任务中标签的最大使用次数
- `showInline` (boolean, optional, default: true): 是否在同一视觉行显示标签
- `opacity` (string, optional, default: "0.9"): 时间范围的透明度（0-1）
- `fillColor` (string, nullable, default: "transparent"): 填充颜色（十六进制或 HTML 颜色名）
- `strokeColor` (string, optional, default: "#f48a42"): 边框颜色（十六进制）
- `strokeWidth` (number, optional, default: 1): 边框宽度

---

### Number

**类型**: `number`  
**分类**: Control  
**描述**: 用于数字分类

**允许的子组件**: 无

**对象绑定约束**: 可以绑定到任何 Object 组件

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的元素名称
- `min` (string, nullable): 最小数值
- `max` (string, nullable): 最大数值
- `step` (string, nullable, default: "1"): 值递增/递减的步长
- `defaultValue` (string, nullable): 默认数值
- `hotkey` (string, nullable): 增加数值的快捷键
- `required` (boolean, optional, default: false): 是否必填
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `perRegion` (boolean, optional): 是否用于特定区域而不是整个对象
- `perItem` (boolean, optional): 是否用于对象内的特定项而不是整个对象
- `slider` (boolean, optional, default: false): 是否使用滑块外观而不是输入框

---

### Rating

**类型**: `rating`  
**分类**: Control  
**描述**: 用于添加评分选择

**允许的子组件**: 无

**对象绑定约束**: 可以绑定到任何 Object 组件

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的元素名称
- `maxRating` (string, optional, default: "5"): 最大评分值
- `defaultValue` (string, optional, default: "0"): 默认评分值
- `size` (enum, optional, default: "medium"): 评分图标大小，可选值：`small`, `medium`, `large`
- `icon` (string, optional, default: "star"): 图标类型
- `hotkey` (string, nullable): 更改评分值的快捷键
- `required` (boolean, optional, default: false): 是否必填
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `perRegion` (boolean, optional): 是否用于特定区域而不是整个对象
- `perItem` (boolean, optional): 是否用于对象内的特定项而不是整个对象

---

### DateTime

**类型**: `datetime`  
**分类**: Control  
**描述**: 用于添加日期和时间选择

**允许的子组件**: 无

**对象绑定约束**: 可以绑定到任何 Object 组件

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要标注的元素名称
- `only` (string, nullable): 要显示的部分的逗号分隔列表（date, time, month, year）
- `format` (string, nullable): 输入/输出的 strftime 格式
- `min` (string, nullable): 最小日期时间值（ISO 格式）或最小年份（仅年份模式）
- `max` (string, nullable): 最大日期时间值（ISO 格式）或最大年份（仅年份模式）
- `step` (string, nullable): 步长
- `defaultValue` (string, nullable): 默认值
- `hotkey` (string, nullable): 快捷键
- `required` (boolean, optional, default: false): 是否必填
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `perRegion` (boolean, optional): 是否用于特定区域而不是整个对象
- `perItem` (boolean, optional): 是否用于对象内的特定项而不是整个对象

---

### Taxonomy

**类型**: `taxonomy`  
**分类**: Control  
**描述**: 用于创建分层分类（树形结构）

**允许的子组件**:
```javascript
["choice"]  // 允许嵌套 Choice 创建树形结构
```

**对象绑定约束**: 可以绑定到任何 Object 组件

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要分类的元素名称
- `apiUrl` (string, nullable): 从远程源获取分类（Beta）
- `leafsOnly` (boolean, optional, default: false): 是否只允许选择叶子节点
- `showFullPath` (boolean, optional, default: false): 是否显示选中项的完整路径
- `pathSeparator` (string, optional, default: " / "): 完整路径中的分隔符
- `maxUsages` (number, nullable): 每个任务或区域中选项的最大选择次数
- `maxWidth` (string, nullable): 下拉菜单的最大宽度（如 "500px"）
- `minWidth` (string, nullable): 下拉菜单的最小宽度（如 "300px"）
- `required` (boolean, optional, default: false): 是否至少选择一个选项
- `requiredMessage` (string, optional): 验证失败时显示的消息
- `placeholder` (string, optional): 输入框的提示文本
- `perRegion` (boolean, optional): 是否用于特定区域而不是整个对象
- `perItem` (boolean, optional): 是否用于对象内的特定项而不是整个对象
- `labeling` (boolean, optional, default: false): 是否用于标注文本中的区域（仅支持 Text 和 HyperText）
- `legacy` (boolean, optional, default: false): 是否启用旧版 Taxonomy 标签
- `value` (string, optional, default: ""): 任务数据字段，包含动态加载的分类列表

---

### Collapse

**类型**: `collapse`  
**分类**: Visual  
**描述**: 可折叠和展开的内容区域

**允许的子组件**:
```javascript
["panel"]  // Panel 组件
```

**Panel 允许的子组件**:
```javascript
[
  "view", "header", "labels", "label", "table", "taxonomy", "choices", "choice",
  "collapse", "datetime", "number", "rating", "ranker", "rectangle", "ellipse",
  "polygon", "keypoint", "brush", "bitmask", "magicwand", "rectanglelabels",
  "bitmasklabels", "ellipselabels", "polygonlabels", "vector", "vectorlabels",
  "keypointlabels", "brushlabels", "hypertextlabels", "text", "audio", "image",
  "hypertext", "audioplus", "list", "dialog", "textarea", "pairwise", "style",
  "label", "relations", "filter", "timeseries", "timeserieslabels", "paragraphs",
  "paragraphlabels", "pdf", "video", "videorectangle", "timelinelabels", "custominterface",
  ...Registry.customTags
]
```

**属性**:
- `accordion` (boolean, optional, default: true): 是否作为手风琴模式工作
- `bordered` (boolean, optional, default: false): 是否显示边框
- `open` (boolean, optional, default: false): 设置默认折叠状态

**Panel 属性**:
- `value` (string, required): 面板标题文本
- `open` (boolean, nullable): 是否默认展开

---

### Markdown

**类型**: `markdown`  
**分类**: Visual  
**描述**: 显示 Markdown 格式的文本内容

**允许的子组件**: 无

**属性**:
- `value` (string, optional, default: ""): Markdown 文本内容，可以是静态文本或数据字段名（如 `$markdown_field`）
- `style` (string, nullable): CSS 样式字符串
- `classname` (string, optional, default: ""): CSS 类名
- `idattr` (string, optional, default: ""): 唯一 ID 属性
- `visibleWhen` (enum, optional): 控制可见性，可选值：`region-selected`, `choice-selected`, `no-region-selected`, `choice-unselected`
- `whenTagName` (string, optional): 与 `visibleWhen` 配合使用，指定标签名称
- `whenLabelValue` (string, optional): 与 `visibleWhen="region-selected"` 配合使用，指定标签值
- `whenChoiceValue` (string, optional): 与 `visibleWhen` 配合使用，指定选择值

---

### Dialog

**类型**: `dialog`  
**分类**: Visual  
**描述**: 在任务上渲染对话框，显示说明或其他内容

**允许的子组件**: 无

**属性**:
- `name` (string, nullable): 元素的名称
- `value` (string, nullable): 元素的值（数据字段名，如 `$dialog`）

**数据格式**: `value` 引用的数据应该是一个对象数组，每个对象包含：
- `name` (string): 对话者名称
- `text` (string): 对话文本
- `selected` (boolean, optional): 是否选中
- `date` (string, optional): 日期
- `hint` (string, optional): 提示信息

---

### Filter

**类型**: `filter`  
**分类**: Visual  
**描述**: 为大量标签或选择添加过滤搜索功能

**允许的子组件**: 无

**对象绑定约束**: 必须绑定到 `Labels` 或 `Choices` 组件

**属性**:
- `name` (string, required): 元素的名称
- `toName` (string, nullable): 要过滤的标签或选择组件的名称
- `placeholder` (string, optional, default: "Quick Filter"): 过滤输入框的占位符文本
- `minlength` (string, optional, default: "3"): 过滤的最小长度
- `style` (string, nullable): CSS 样式字符串
- `hotkey` (string, nullable): 用于聚焦过滤文本区域的快捷键
- `caseSensitive` (boolean, optional, default: false): 是否区分大小写
- `cleanup` (boolean, optional, default: true): 是否清理过滤值

---

### Style

**类型**: `style`  
**分类**: Visual  
**描述**: 用于应用自定义 CSS 属性到标注界面

**允许的子组件**: 无

**属性**:
- `value` (string, optional, default: ""): CSS 样式内容（字符串）

**使用说明**: 可以在 `value` 中定义 CSS 规则，使用类选择器（如 `.cls-name`）来匹配 `View` 标签中的 `className` 属性。

---

### Repeater

**类型**: `repeater`  
**分类**: Visual  
**描述**: 用于在动态范围内使用相同语义标注多个数据对象（虚拟标签，在配置解析时展开）

**允许的子组件**: 所有 View 允许的子组件

**属性**:
- `on` (string, required): 数据字段对象，包含要重复的数组数据
- `indexFlag` (string, optional, default: "{{idx}}"): 用于替换数组索引的占位符
- `mode` (enum, optional): 显示模式，可选值：`list`, `pagination`

**注意事项**: 
- 这是一个虚拟标签，在配置解析时会被展开
- 所有 `indexFlag` 的出现都会被当前索引替换
- 标签名称必须唯一，因此可以在标签名称中使用占位符

---

## Label Item 组件

### Label

**类型**: `label`  
**分类**: Control (Label Item)  
**描述**: 标签控件的一个标签项

**允许的子组件**: 无

**父组件约束**: 只能作为以下组件的子组件：
- `Labels`
- `EllipseLabels`
- `RectangleLabels`
- `PolygonLabels`
- `KeyPointLabels`
- `BrushLabels`
- `HyperTextLabels`
- `TimelineLabels`
- `TimeSeriesLabels`
- `ParagraphLabels`
- `BitmaskLabels`
- `VectorLabels`
- 以及其他以 `Labels` 结尾的自定义标签

**属性**:
- `value` (string, required): 标签的值（必填）
- `selected` (boolean, optional, default: false): 是否默认选中
- `maxUsages` (string, nullable): 每个任务中此标签的最大使用次数
- `alias` (string, nullable): 标签别名（用于快捷键）
- `hint` (string, nullable): 悬停提示
- `hotkey` (string, nullable): 快捷键（如果未指定则自动生成）
- `showAlias` (boolean, optional, default: false): 是否在标签文本内显示别名
- `aliasStyle` (string, optional, default: "opacity: 0.6"): 别名的 CSS 样式
- `size` (string, optional, default: "medium"): 标签文本的大小
- `background` (string, optional, default: "#36B37E"): 活动标签的背景颜色（十六进制）
- `selectedColor` (string, optional, default: "#ffffff"): 活动标签的文本颜色（十六进制）
- `granularity` (enum, nullable): 基于符号或词选择的控制（仅用于 Text），可选值：`symbol`, `word`, `sentence`, `paragraph`
- `html` (string, nullable): HTML 代码，用于显示标签按钮而不是原始文本（需要正确转义）
- `category` (number, nullable): 类别，用于导出（在 label-studio-converter 库中）以确定 YOLO 和 COCO 的标签顺序

---

### Choice

**类型**: `choice`  
**分类**: Control (Label Item)  
**描述**: 选择控件的一个选项

**允许的子组件**:
```javascript
["choice"]  // 允许嵌套 Choice（用于嵌套选择）
```

**父组件约束**: 只能作为 `Choices` 组件的子组件

**属性**:
- `value` (string, required): 选项的值（必填）
- `selected` (boolean, optional, default: false): 是否默认选中
- `alias` (string, nullable): 选项的别名（用于快捷键）
- `html` (string, nullable): HTML 代码，用于显示选项按钮而不是原始文本（需要正确转义）

---

## 约束总结表

### 对象绑定约束（toName）

| Control 组件 | 可绑定的 Object 组件 |
|-------------|---------------------|
| `RectangleLabels`, `Rectangle` | `Image` |
| `PolygonLabels`, `Polygon` | `Image` |
| `EllipseLabels`, `Ellipse` | `Image` |
| `KeyPointLabels`, `KeyPoint` | `Image` |
| `BrushLabels`, `Brush` | `Image` |
| `BitmaskLabels`, `Bitmask` | `Image` |
| `VectorLabels` | `Image` |
| `MagicWand` | `Image` |
| `Ruler` | `Image` |
| `HyperTextLabels` | `HyperText` |
| `ParagraphLabels` | `Paragraphs` |
| `TimeSeriesLabels` | `TimeSeries` |
| `TimelineLabels` | `Video` |
| `VideoRectangle` | `Video` |
| `Labels` | `Text`, `Audio`, `HyperText`, `RichText` |
| `Choices` | 任何 Object 组件 |
| `TextArea` | `Text`, `Image`, `Audio`, `Video`, `Paragraphs`, `TimeSeries` 等 |
| `Number` | 任何 Object 组件 |
| `Rating` | 任何 Object 组件 |
| `DateTime` | 任何 Object 组件 |
| `Taxonomy` | 任何 Object 组件 |
| `Ranker` | `List` |
| `Pairwise` | 任何两个 Object 组件（逗号分隔） |
| `Filter` | `Labels`, `Choices` |

### 父组件约束

| 组件 | 只能作为以下组件的子组件 |
|-----|----------------------|
| `Label` | `Labels`, `*Labels` (所有以 Labels 结尾的组件) |
| `Choice` | `Choices`, `Taxonomy` |
| `Relation` | `Relations` |
| `Bucket` | `Ranker` |
| `Shortcut` | `TextArea` |
| `Panel` | `Collapse` |

---

## 使用示例

### 图像框选示例

```xml
<View>
  <Image name="img" value="$image" zoom="true" zoomControl="true"></Image>
  <RectangleLabels name="tag" toName="img" fillOpacity="0.5" strokeWidth="5">
    <Label value="Planet"></Label>
    <Label value="Moonwalker" background="blue"></Label>
  </RectangleLabels>
</View>
```

### 文本命名实体识别示例

```xml
<View>
  <Text name="text" value="$text"></Text>
  <Labels name="ner" toName="text" choice="multiple">
    <Label value="Person"></Label>
    <Label value="Organization"></Label>
    <Label value="Location"></Label>
  </Labels>
</View>
```

### 图像分类示例

```xml
<View>
  <Image name="img" value="$image"></Image>
  <Choices name="choice" toName="img" choice="single">
    <Choice value="Cat"></Choice>
    <Choice value="Dog"></Choice>
    <Choice value="Bird"></Choice>
  </Choices>
</View>
```

---

## 注意事项

1. **布尔属性格式**: XML 中的布尔属性必须使用 `key="true"` 或 `key="false"` 格式，不能只写属性名。

2. **toName 引用**: Control 组件的 `toName` 属性必须引用同一配置中存在的 Object 组件的 `name` 属性。

3. **嵌套规则**: 
   - `Label` 只能嵌套在 `*Labels` 组件内
   - `Choice` 只能嵌套在 `Choices` 组件内
   - `View` 可以嵌套自身和其他大部分组件

4. **动态加载**: `Labels` 和 `Choices` 支持通过 `value` 属性从任务数据中动态加载子项。

5. **可见性控制**: `View` 和 `Choices` 支持通过 `visibleWhen` 和相关属性控制可见性。

---

## 参考资源

- [Label Studio 官方文档](https://labelstud.io/guide/)
- [组件开发指南](./DEVELOPING_COMPONENTS.md)
- [Image 组件文档](./IMAGE_COMPONENT.md)
- [XML 到 React 渲染](./XML_TO_REACT_RENDERING.md)

---

## 组件统计

### Visual 组件（8个）
1. View
2. Header
3. PagedView
4. Collapse
5. Markdown
6. Dialog
7. Filter
8. Style
9. Repeater（虚拟标签）

### Object 组件（11个）
1. Image
2. Text
3. Audio
4. HyperText
5. RichText
6. TimeSeries
7. Video
8. Table
9. List
10. Paragraphs
11. Pdf

### Control 组件（32个）
1. RectangleLabels
2. Rectangle
3. PolygonLabels
4. Polygon
5. EllipseLabels
6. Ellipse
7. Labels
8. Choices
9. KeyPointLabels
10. KeyPoint
11. BrushLabels
12. Brush
13. BitmaskLabels
14. Bitmask
15. TextArea
16. Ruler
17. VectorLabels
18. HyperTextLabels
19. ParagraphLabels
20. TimeSeriesLabels
21. TimelineLabels
22. Number
23. Rating
24. DateTime
25. Taxonomy
26. Ranker
27. Pairwise
28. Relations
29. VideoRectangle
30. MagicWand
31. Shortcut

### Label Item 组件（3个）
1. Label
2. Choice
3. Relation（Relations 的子组件）
4. Bucket（Ranker 的子组件）

### 总计
- **Visual 组件**: 9 个（包括 Repeater）
- **Object 组件**: 11 个
- **Control 组件**: 31 个
- **Label Item 组件**: 4 个（包括 Relation 和 Bucket）
- **总计**: **55+ 个组件**

---

## 补充说明

本文档已包含 Label Studio Editor 中所有主要组件的详细信息，包括：
- 组件的类型和分类
- 允许的子组件
- 对象绑定约束（toName）
- 父组件约束
- 所有属性的类型、默认值和描述

**注意事项**:
1. **布尔属性格式**: XML 中的布尔属性必须使用 `key="true"` 或 `key="false"` 格式
2. **toName 引用**: Control 组件的 `toName` 属性必须引用同一配置中存在的 Object 组件的 `name` 属性
3. **嵌套规则**: 某些组件（如 `Label`, `Choice`, `Relation`, `Bucket`）只能作为特定组件的子组件
4. **动态加载**: `Labels`, `Choices`, `Taxonomy` 支持通过 `value` 属性从任务数据中动态加载子项
5. **虚拟标签**: `Repeater` 是虚拟标签，在配置解析时会被展开

---

*本文档基于 Label Studio Editor 源码分析生成，最后更新时间：2025/12/8

