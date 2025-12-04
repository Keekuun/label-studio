# Label Studio Editor - Cursor AI Prompts 指南

本文档为使用 Cursor AI 开发 Label Studio Editor 提供系统化的提示词模板，帮助快速上手、阅读源码和扩展功能。

---

## 📋 目录

1. [项目概述](#项目概述)
2. [快速上手](#快速上手)
3. [源码阅读指南](#源码阅读指南)
4. [扩展功能开发](#扩展功能开发)
5. [常用命令](#常用命令)
6. [关键概念](#关键概念)
7. [调试技巧](#调试技巧)

---

## 项目概述

### 架构概览

Label Studio 是一个开源数据标注工具，前端 Editor 部分（LSF - Label Studio Frontend）位于 `web/libs/editor/`，使用以下技术栈：

- **框架**: React + TypeScript/JavaScript
- **状态管理**: MobX State Tree (MST)
- **构建工具**: NX Monorepo + Webpack
- **样式**: SCSS + Tailwind CSS

### 核心目录结构

```
web/libs/editor/src/
├── core/              # 核心系统（Registry、Tree、Types）
├── tags/              # XML 标签实现
│   ├── object/       # 对象标签（Image, Text, Audio 等）
│   ├── control/      # 控制标签（RectangleLabels, MagicWand 等）
│   └── visual/       # 视觉标签（View, Header 等）
├── tools/             # 工具实现（Zoom, Rotate, MagicWand 等）
├── regions/           # 区域模型（RectRegion, PolygonRegion 等）
├── stores/            # 状态管理（AnnotationStore, AppStore 等）
├── components/        # React 组件
├── mixins/            # MST Mixins（共享逻辑）
├── utils/             # 工具函数
└── examples/          # 示例配置和测试数据
```

---

## 快速上手

### 提示词模板 1: 项目初始化

```
我需要快速了解 Label Studio Editor 项目。请帮我：

1. 查看项目根目录的 README.md，了解项目整体架构
2. 查看 web/README.md，了解前端开发环境配置
3. 查看 web/libs/editor/README.md，了解 Editor 模块的具体说明
4. 列出所有可用的开发命令（yarn lsf:*）
5. 说明如何启动开发服务器和查看示例

请用中文回答，并提供具体的文件路径和命令。
```

### 提示词模板 2: 运行第一个示例

```
我想运行 Label Studio Editor 的示例。请帮我：

1. 查看 web/libs/editor/src/env/development.js，了解默认加载的示例
2. 查看 web/libs/editor/src/examples/ 目录，列出所有可用的示例
3. 说明如何运行 `yarn lsf:serve` 启动独立模式
4. 解释如何修改 development.js 来切换不同的示例
5. 提供一个简单的示例配置（config.xml + tasks.json）的说明

请提供具体的步骤和代码示例。
```

### 提示词模板 3: 理解数据流

```
我想理解 Label Studio Editor 的数据流。请帮我：

1. 解释 XML 配置（config.xml）如何被解析和渲染
2. 说明任务数据（tasks.json）如何加载到 Editor
3. 追踪一个标注操作的完整流程：
   - 用户点击 → Tool 处理 → Region 创建 → Annotation 更新 → 结果序列化
4. 查看 web/libs/editor/src/stores/Annotation/store.js，解释 AnnotationStore 的作用
5. 说明 predictions 和 annotations 的区别和用途

请用流程图或步骤说明，并提供关键代码文件路径。
```

---

## 源码阅读指南

### 提示词模板 4: 理解 Registry 机制

```
我想理解 Label Studio Editor 的注册机制。请帮我：

1. 查看 web/libs/editor/src/core/Registry.ts，解释 Registry 类的作用
2. 说明如何注册一个新的标签（tag）：
   - Model（MST 模型）的注册
   - View（React 组件）的注册
   - 两者的关联方式
3. 查看一个现有标签的完整注册示例（如 MagicWand），说明：
   - 在哪里调用 Registry.addTag()
   - Model 和 View 的定义位置
   - 如何从 XML 配置映射到 React 组件
4. 解释自定义标签（CustomTag）的注册流程

请提供代码示例和文件路径。
```

### 提示词模板 5: 理解 MST 模型结构

```
我想理解 Label Studio Editor 中 MobX State Tree 的使用。请帮我：

1. 查看 web/libs/editor/src/tags/control/MagicWand.js，分析 MST 模型定义：
   - types.model() 定义的数据结构
   - .views() 定义的计算属性
   - .actions() 定义的操作方法
   - .volatile() 定义的临时状态
2. 解释 Mixins 的使用（如 AnnotationMixin, ToolManagerMixin）：
   - 如何通过 types.compose() 组合多个 Mixin
   - Mixin 的作用和共享逻辑
3. 查看 web/libs/editor/src/mixins/ 目录，列出常用的 Mixin 及其用途
4. 说明如何创建一个新的 MST 模型，需要哪些步骤

请提供代码示例和最佳实践。
```

### 提示词模板 6: 理解 Tool 和 Control 的关系

```
我想理解 Tool 和 Control 标签的关系。请帮我：

1. 查看 web/libs/editor/src/mixins/ToolManagerMixin.js，解释：
   - Control 标签如何注册 Tool
   - ToolsManager 的作用
   - toolNames 属性的作用
2. 查看 web/libs/editor/src/tools/MagicWand.jsx，分析：
   - Tool 如何与 Control 交互
   - Tool 如何创建 Region
   - Tool 的事件处理流程（mousedown, mousemove, mouseup）
3. 查看 web/libs/editor/src/tools/Manager.js，说明：
   - ToolsManager 如何管理多个 Tool
   - Tool 的选择和切换机制
4. 解释 Control → Tool → Region 的完整数据流

请提供代码示例和交互流程图。
```

### 提示词模板 7: 理解 Region 和 Result 的序列化

```
我想理解 Region 和 Result 的序列化机制。请帮我：

1. 查看 web/libs/editor/src/regions/ 目录，了解不同类型的 Region：
   - RectRegion, PolygonRegion, BrushRegion 等
   - 它们的序列化方法 serialize()
2. 查看 web/libs/editor/src/regions/Result.js，解释：
   - Result 的结构
   - 如何从 Region 转换为 Result
   - 如何从 Result 恢复 Region
3. 查看一个具体的 Region 实现（如 RectRegion），说明：
   - 如何存储坐标（相对/绝对、百分比/像素）
   - 如何处理缩放和旋转
   - 如何序列化为 Label Studio 标准格式
4. 解释 ImageModel 如何管理多个 Region

请提供代码示例和序列化格式说明。
```

---

## 扩展功能开发

### 提示词模板 8: 添加新的 Control 标签

```
我想添加一个新的 Control 标签（例如 MyShapeLabels）。请帮我：

1. 参考 web/libs/editor/src/tags/control/MagicWand.js，创建一个新的 Control：
   - 定义 MST Model（使用 ControlBase + Mixins）
   - 定义 React View 组件
   - 在文件末尾调用 Registry.addTag() 注册
2. 如果需要工具栏入口，创建对应的 Tool：
   - 在 web/libs/editor/src/tools/ 下创建 Tool 文件
   - 实现 mousedownEv, mousemoveEv, mouseupEv 等方法
   - 在 Control 的 toolNames 中声明
3. 如果需要新的 Region 类型：
   - 在 web/libs/editor/src/regions/ 下创建 Region Model
   - 实现 serialize() 和必要的坐标转换方法
   - 在对应的 Object Model（如 ImageModel）中注册
4. 创建示例配置（config.xml + tasks.json）进行测试

请提供完整的代码模板和步骤说明。
```

### 提示词模板 9: 添加新的 Object 标签

```
我想添加一个新的 Object 标签（例如 Video3D）。请帮我：

1. 参考 web/libs/editor/src/tags/object/Image/Image.js，创建新的 Object：
   - 定义 MST Model（使用 ObjectBase + AnnotationMixin）
   - 定义 React View 组件
   - 注册到 Registry
2. 如果需要支持 Region：
   - 定义 regions 数组（types.union(...)）
   - 实现 createDrawingRegion() 方法
   - 实现 _updateRegionsSizes() 处理缩放
3. 如果需要支持 Tool：
   - 在 afterAttach() 中初始化 ToolsManager
   - 注册需要的工具（Zoom, Rotate 等）
4. 创建示例配置和测试数据

请提供完整的代码模板和注意事项。
```

### 提示词模板 10: 添加新的 Tool

```
我想添加一个新的 Tool（例如 FreehandTool）。请帮我：

1. 参考 web/libs/editor/src/tools/MagicWand.jsx，创建新的 Tool：
   - 继承或参考 Base Tool 的结构
   - 定义 group, shortcut, smart 等属性
   - 实现事件处理方法（mousedownEv, mousemoveEv, mouseupEv）
2. 实现 Tool 的核心逻辑：
   - 如何捕获用户交互
   - 如何创建临时绘制（如预览线）
   - 如何创建最终的 Region
3. 注册 Tool：
   - 在 web/libs/editor/src/tools/index.js 中导出
   - 在对应的 Control 标签中声明 toolNames
4. 处理坐标系统：
   - 屏幕坐标 → Canvas 坐标 → 图像坐标的转换
   - 处理缩放和旋转的影响

请提供完整的代码模板和坐标转换示例。
```

### 提示词模板 11: 扩展现有功能（以 MagicWand 为例）

```
我想扩展 MagicWand 工具，添加基于预分割数据的一键选择功能。请帮我：

1. 分析现有 MagicWand 实现：
   - 查看 web/libs/editor/src/tags/control/MagicWand.js 的 Model 定义
   - 查看 web/libs/editor/src/tools/MagicWand.jsx 的工具逻辑
   - 理解当前的像素阈值算法
2. 设计扩展方案：
   - 添加新的 XML 属性（如 segmentSource, segmentPointsKey）
   - 在 Model 中添加 views 来解析预分割数据
   - 在 Tool 中添加新的交互模式（点击选择 vs 拖拽阈值）
3. 实现新功能：
   - 解析任务数据中的预分割信息
   - 实现点-多边形检测算法
   - 从预分割数据创建 Region
4. 创建示例和文档：
   - 更新 config.xml 示例
   - 创建包含预分割数据的 tasks.json
   - 编写使用文档

请提供完整的实现方案和代码。
```

### 提示词模板 12: 创建自定义组件（Plugin）

```
我想创建一个自定义组件作为插件。请帮我：

1. 查看 web/libs/editor/src/core/Registry.ts 的 addCustomTag() 方法，了解插件注册机制
2. 设计插件结构：
   - 定义 CustomTag 接口（tag, model, view, isObject, region 等）
   - 确定插件的类型（Object / Control / Visual）
3. 实现插件：
   - 创建 MST Model
   - 创建 React View
   - 实现必要的逻辑（如需要 Tool 或 Region）
4. 注册插件：
   - 在应用初始化时调用 Registry.addCustomTag()
   - 或在单独的插件文件中导出注册函数
5. 创建插件文档和使用示例

请提供完整的插件开发模板和最佳实践。
```

---

## 常用命令

### 提示词模板 13: 开发环境命令

```
请列出 Label Studio Editor 的所有开发命令，并说明每个命令的用途：

1. 查看 web/package.json 中的 scripts
2. 特别关注 yarn lsf:* 相关的命令
3. 说明以下命令的用途：
   - yarn lsf:watch（持续构建）
   - yarn lsf:serve（独立模式运行）
   - yarn lsf:unit（单元测试）
   - yarn lsf:integration（集成测试）
   - yarn lsf:e2e（端到端测试）
4. 说明如何配置开发环境（HMR、环境变量等）

请提供命令列表和使用场景。
```

### 提示词模板 14: 构建和部署

```
我想了解如何构建和部署 Label Studio Editor。请帮我：

1. 查看构建配置（webpack.config.js 或相关配置）
2. 说明生产构建命令（yarn build）
3. 解释如何将 Editor 作为独立库使用：
   - 如何导入 LabelStudio 组件
   - 如何传递配置和数据
   - 如何处理回调事件
4. 查看 web/libs/editor/src/index.js，了解导出接口
5. 说明如何集成到其他项目（npm 包或直接引用）

请提供构建步骤和集成示例。
```

---

## 关键概念

### 提示词模板 15: XML 配置系统

```
我想理解 Label Studio 的 XML 配置系统。请帮我：

1. 查看 web/libs/editor/src/core/Tree.js，了解 XML 解析流程
2. 解释 XML 标签到 React 组件的映射：
   - 如何从 XML 属性解析到 MST Model
   - 如何从 Model 渲染为 React View
3. 查看一个完整的示例（如 image_bbox）：
   - config.xml 的结构
   - tasks.json 的数据格式
   - 两者如何关联（通过 $variable 引用）
4. 说明常用标签类型：
   - Object 标签（Image, Text, Audio 等）
   - Control 标签（RectangleLabels, Choices 等）
   - Visual 标签（View, Header, Text 等）
5. 解释 toName / fromName 的关联机制

请提供 XML 配置示例和解析流程图。
```

### 提示词模板 16: 状态管理（MobX State Tree）

```
我想深入理解 Label Studio Editor 的状态管理。请帮我：

1. 查看 web/libs/editor/src/stores/ 目录，列出所有 Store：
   - AnnotationStore（标注状态）
   - AppStore（应用状态）
   - UserStore（用户状态）
   - 其他 Store
2. 解释 Store 之间的关系：
   - 如何通过 getRoot() 访问根 Store
   - 如何通过 getParent() 访问父节点
   - Store 之间的数据流
3. 查看 web/libs/editor/src/stores/Annotation/Annotation.js，分析：
   - Annotation Model 的结构
   - 如何管理 Regions
   - 如何序列化和反序列化
4. 说明响应式更新机制：
   - observer() 的使用
   - computed values（views）
   - actions 的副作用

请提供 Store 关系图和代码示例。
```

### 提示词模板 17: 坐标系统和变换

```
我想理解 Label Studio Editor 的坐标系统。请帮我：

1. 查看 web/libs/editor/src/tags/object/Image/Image.js，分析：
   - 图像坐标系统（自然尺寸 vs 显示尺寸）
   - 缩放和旋转的处理
   - 坐标转换方法（screenToImage, imageToScreen）
2. 查看 Region 实现，说明：
   - 相对坐标（百分比）vs 绝对坐标（像素）
   - coordstype 的作用（"perc" vs "px"）
   - 如何处理不同分辨率的图像
3. 解释工具交互中的坐标转换：
   - 鼠标事件坐标 → Canvas 坐标 → 图像坐标
   - 缩放和旋转的影响
4. 查看 web/libs/editor/src/utils/image.js，了解坐标转换工具函数

请提供坐标转换的代码示例和示意图。
```

---

## 调试技巧

### 提示词模板 18: 调试 MST 模型

```
我想调试 MobX State Tree 模型。请帮我：

1. 说明如何在 Cursor 中查看 MST 模型的状态：
   - 使用 console.log() 打印模型快照
   - 使用 onSnapshot() 监听状态变化
   - 使用 getSnapshot() 获取当前状态
2. 解释如何调试 Model 的 views 和 actions：
   - 在 views 中添加 console.log
   - 在 actions 中添加断点
   - 使用 MST 的调试工具
3. 查看 web/libs/editor/src/stores/Annotation/store.js，找出：
   - 关键的状态更新点
   - 如何追踪标注创建流程
4. 说明如何调试 Region 的创建和更新

请提供调试代码示例和工具推荐。
```

### 提示词模板 19: 调试 React 组件

```
我想调试 React 组件。请帮我：

1. 说明如何在 Cursor 中调试 React 组件：
   - 使用 React DevTools
   - 在组件中添加 console.log
   - 使用 debugger 语句
2. 查看 web/libs/editor/src/components/，找出：
   - 关键组件的渲染逻辑
   - 如何追踪 props 和 state 的变化
3. 解释 observer() 的作用：
   - 为什么需要使用 observer
   - 如何调试响应式更新问题
4. 说明如何调试事件处理：
   - 鼠标事件的处理流程
   - 键盘快捷键的处理
   - 自定义事件的触发

请提供调试技巧和常见问题排查方法。
```

### 提示词模板 20: 性能优化

```
我想优化 Label Studio Editor 的性能。请帮我：

1. 查看 web/libs/editor/src/stores/Annotation/store.js，分析：
   - 如何避免不必要的重新渲染
   - 如何使用 computed values 缓存计算结果
   - 如何优化大量 Region 的渲染
2. 说明 React 性能优化技巧：
   - 使用 React.memo()
   - 使用 useMemo() 和 useCallback()
   - 避免在 render 中创建新对象
3. 查看图像渲染优化：
   - 如何处理大图像的加载
   - 如何优化缩放和旋转的性能
   - 如何实现虚拟滚动（如果适用）
4. 说明 MobX State Tree 的性能最佳实践

请提供性能分析工具和优化建议。
```

---

## 实用提示词组合

### 组合 1: 完整功能开发流程

```
我想开发一个新功能 [功能名称]。请按照以下步骤帮我：

1. 【需求分析】分析需求，确定需要的组件类型（Object/Control/Tool）
2. 【架构设计】设计数据模型和交互流程
3. 【实现 Model】创建 MST Model，定义数据结构和操作
4. 【实现 View】创建 React 组件，实现 UI 渲染
5. 【实现 Tool】（如需要）创建交互工具
6. 【注册组件】在 Registry 中注册新组件
7. 【创建示例】创建 config.xml 和 tasks.json 示例
8. 【测试验证】运行开发服务器测试功能
9. 【编写文档】编写使用文档和 API 说明

请逐步指导我完成每个步骤，并提供代码模板。
```

### 组合 2: 问题排查流程

```
我遇到了一个问题 [问题描述]。请帮我排查：

1. 【定位问题】分析错误信息或异常行为
2. 【追踪代码】找到相关的代码文件（Model/View/Tool）
3. 【理解流程】理解数据流和调用链
4. 【检查配置】验证 XML 配置和任务数据
5. 【调试状态】检查 MST 模型状态
6. 【修复问题】提供修复方案
7. 【验证修复】确认问题已解决

请提供详细的排查步骤和代码分析。
```

### 组合 3: 学习特定功能

```
我想深入学习 [功能名称]（如 MagicWand、Image 组件等）。请帮我：

1. 【概览】查看相关文档和 README
2. 【代码分析】分析 Model、View、Tool 的完整实现
3. 【数据流】追踪从用户交互到结果序列化的完整流程
4. 【关键概念】解释涉及的核心概念和设计模式
5. 【扩展点】说明如何扩展或自定义该功能
6. 【最佳实践】提供使用和开发的最佳实践

请提供详细的代码分析和学习路径。
```

---

## 参考资源

### 关键文件路径

- **核心系统**: `web/libs/editor/src/core/`
- **标签实现**: `web/libs/editor/src/tags/`
- **工具实现**: `web/libs/editor/src/tools/`
- **区域模型**: `web/libs/editor/src/regions/`
- **状态管理**: `web/libs/editor/src/stores/`
- **示例配置**: `web/libs/editor/src/examples/`
- **文档**: `web/libs/editor/docs/` 和 `web/apps/labelstudio/docs/`

### 推荐阅读顺序

1. **入门**: README.md → web/README.md → web/libs/editor/README.md
2. **架构**: Registry.ts → Tree.js → Types.js
3. **示例**: examples/image_bbox/ → examples/image_magic_wand/
4. **实现**: tags/control/MagicWand.js → tools/MagicWand.jsx
5. **扩展**: docs/DEVELOPING_COMPONENTS.md → docs/IMAGE_COMPONENT.md

### 常用命令速查

```bash
# 开发
cd web
yarn lsf:watch        # 持续构建
yarn lsf:serve        # 独立模式运行（http://localhost:3000）

# 测试
yarn lsf:unit         # 单元测试
yarn lsf:integration # 集成测试
yarn lsf:e2e         # 端到端测试

# 构建
yarn build            # 生产构建
```

---

## 注意事项

1. **始终在 web 目录下运行命令**：所有 `yarn lsf:*` 命令必须在 `web/` 目录下执行
2. **理解 MST 响应式**：修改 MST 模型状态时，确保在 actions 中进行
3. **坐标系统**：注意区分屏幕坐标、Canvas 坐标和图像坐标
4. **注册顺序**：确保在文件末尾调用 Registry.addTag()，避免循环依赖
5. **类型安全**：使用 TypeScript 时，注意类型定义和导入

---

**最后更新**: 2025-01-XX  
**维护者**: Label Studio 开发团队

