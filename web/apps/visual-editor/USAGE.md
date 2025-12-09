# Visual Editor 使用指南

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install antd xml2js
```

### 2. 启动开发服务器

```bash
yarn visual-editor:serve
```

访问 http://localhost:4201

## 基本操作

### 创建配置

1. **添加组件**
   - 从左侧组件面板拖拽组件到中间画布区域
   - 或者拖拽到画布中已有的组件上（作为子组件）

2. **编辑属性**
   - 点击画布中的组件选中它
   - 在右侧属性面板中编辑属性
   - 修改会实时同步到组件树和 XML

3. **查看预览**
   - 底部预览面板会实时显示生成的 XML
   - 可以复制 XML 配置用于 Label Studio

### 组件操作

- **选择组件**：点击画布中的组件节点
- **删除组件**：
  - 点击组件节点上的删除按钮（悬停或选中时显示）
  - 或选中组件后按 Delete/Backspace 键
- **移动组件**：在画布内拖拽组件（待完善）

### 工具栏操作

顶部工具栏提供以下功能：

- **清空**：清空所有组件
- **复制 XML**：将生成的 XML 复制到剪贴板
- **下载 XML**：下载 XML 配置文件
- **导入 XML**：从 XML 文件导入配置 ✅

### 键盘快捷键

- **Delete / Backspace**：删除选中的组件
- **Ctrl/Cmd + C**：复制（待实现）
- **Ctrl/Cmd + V**：粘贴（待实现）
- **Ctrl/Cmd + Z**：撤销（待实现）
- **Ctrl/Cmd + Shift + Z / Y**：重做（待实现）

## 支持的组件

### Object 类型
- **Image** - 图像对象
  - 必需属性：name, value
  - 可选属性：zoom, zoomControl, rotateControl
- **Text** - 文本对象
  - 必需属性：name, value
  - 可选属性：granularity

### Control 类型
- **RectangleLabels** - 矩形标签
  - 必需属性：name, toName
  - 可选属性：choice, opacity, strokeWidth
- **Rectangle** - 矩形（无标签）
  - 必需属性：name, toName
- **Labels** - 文本标签
  - 必需属性：name, toName
  - 可选属性：choice
- **Choices** - 选择控件
  - 必需属性：name, toName
  - 可选属性：choice, showInline
- **Choice** - 选项
  - 必需属性：value
  - 可选属性：alias, selected
- **Label** - 标签项
  - 必需属性：value
  - 可选属性：alias, background, selected

### Visual 类型
- **View** - 视图容器
  - 用于组织其他组件
- **Header** - 标题
  - 必需属性：value
  - 可选属性：level

## 属性类型说明

### string
文本输入框，用于输入字符串值（如 name, value）

### number
数字输入框，用于输入数字值（如 opacity, strokeWidth）

### boolean
开关按钮，用于布尔值（如 zoom, zoomControl）

### select
下拉选择框，用于从预定义选项中选择（如 choice）
- 特殊处理：toName 会自动从画布中的 Object 组件获取选项

### color
颜色选择器，用于选择颜色值

## 示例：创建图像标注配置

1. **添加 Image 组件**
   - 从组件面板拖拽 "图像" 到画布
   - 在属性面板设置：
     - name: "img"
     - value: "$image"

2. **添加 RectangleLabels 组件**
   - 从组件面板拖拽 "矩形标签" 到画布
   - 在属性面板设置：
     - name: "tag"
     - toName: 选择 "img"（会自动出现在下拉列表中）
     - choice: 选择 "single" 或 "multiple"

3. **查看生成的 XML**
   - 底部预览面板会显示生成的 XML：
   ```xml
   <View>
     <Image name="img" value="$image" />
     <RectangleLabels name="tag" toName="img" choice="single" />
   </View>
   ```

## 注意事项

1. **toName 属性**：必须引用画布中已存在的 Object 组件的 name 属性
2. **name 属性**：每个组件的 name 应该是唯一的
3. **实时同步**：属性修改会立即反映到组件树和 XML 中
4. **组件嵌套**：某些组件可以包含子组件（如 View 可以包含其他组件）

## 已知限制

1. 目前只支持部分 Label Studio 标签（View, Image, RectangleLabels）
2. 画布内拖拽排序功能待完善
3. 撤销/重做功能待实现
4. 组件复制、粘贴功能待实现
5. XML 导入时，某些复杂属性可能无法完全还原（如动态值、嵌套结构）

## 下一步功能

- 支持更多 Label Studio 标签
- 组件复制、粘贴
- 撤销/重做
- 模板保存和加载
- XML 导入功能
- 组件搜索和筛选

