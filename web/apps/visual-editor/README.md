# Label Studio Visual Editor

可视化拖拽编辑器，用于通过拖拽组件的方式配置 Label Studio XML 模板。

## ✨ 功能特性

- 🎨 **可视化编辑**：通过拖拽组件的方式配置模板，无需编写 XML
- 👀 **所见即所得**：实时预览配置效果
- 🔧 **属性编辑**：可视化编辑组件属性，支持多种类型
- 📋 **实时预览**：实时生成 XML 并预览效果
- 💾 **导入/导出**：支持 XML 文件导入和导出
- ⌨️ **键盘快捷键**：支持 Delete 删除等快捷键
- 🎯 **智能提示**：拖拽提示、空状态提示

## 🚀 快速开始

### 安装依赖

```bash
cd web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities antd
```

### 启动开发服务器

```bash
yarn visual-editor:serve
```

访问 http://localhost:4201

### 构建生产版本

```bash
yarn visual-editor:build
```

## 📖 使用指南

详细使用说明请查看：
- [快速开始指南](./QUICKSTART.md) - 5 分钟快速上手
- [使用指南](./USAGE.md) - 完整使用文档
- [功能清单](./FEATURES.md) - 所有功能列表

## 🏗️ 项目结构

```
web/apps/visual-editor/
├── src/
│   ├── components/
│   │   ├── VisualEditor/
│   │   │   ├── VisualEditorApp.tsx      # 主应用
│   │   │   ├── ComponentPalette/       # 组件面板
│   │   │   ├── CanvasArea/             # 画布区域
│   │   │   ├── PropertiesPanel/        # 属性面板
│   │   │   ├── VisualPreviewPanel/     # 预览面板
│   │   │   └── Toolbar/               # 工具栏
│   │   └── ErrorBoundary/              # 错误边界
│   ├── hooks/                          # React Hooks
│   │   ├── useComponentTree.ts        # 组件树操作
│   │   └── useKeyboardShortcuts.ts   # 键盘快捷键
│   ├── atoms/                          # Jotai 状态管理
│   ├── data/                           # 组件元数据定义
│   ├── types/                          # TypeScript 类型定义
│   ├── utils/                          # 工具函数
│   │   ├── componentTree.ts           # 组件树操作
│   │   ├── xmlConverter.ts            # XML 转换
│   │   └── errorHandler.ts            # 错误处理
│   ├── index.html                      # HTML 入口
│   └── main.tsx                        # React 入口
├── docs/                               # 文档
├── project.json                        # Nx 项目配置
├── tsconfig.json                       # TypeScript 配置
└── README.md                           # 本文件
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Jotai** - 状态管理
- **@dnd-kit** - 拖拽功能
- **Ant Design** - UI 组件库
- **Tailwind CSS** - 样式
- **DOMParser** - XML 解析

## 📦 支持的组件

### Object 类型
- Image（图像）
- Text（文本）

### Control 类型
- RectangleLabels（矩形标签）
- Rectangle（矩形）
- Labels（标签）
- Choices（选择）
- Choice（选项）
- Label（标签项）

### Visual 类型
- View（视图容器）
- Header（标题）

## ✅ 已完成功能

- [x] 拖拽创建组件
- [x] 组件树可视化
- [x] 属性编辑（多种类型）
- [x] XML 导入/导出
- [x] 组件删除
- [x] 工具栏功能
- [x] 实时预览
- [x] 键盘快捷键
- [x] 错误处理

## 📚 相关文档

- [快速开始](./QUICKSTART.md) - 5 分钟快速上手
- [使用指南](./USAGE.md) - 完整使用文档
- [功能清单](./FEATURES.md) - 所有功能列表
- [进度文档](./PROGRESS.md) - 开发进度
- [更新日志](./CHANGELOG.md) - 版本更新记录
- [技术方案](../playground/docs/VISUAL_EDITOR_TECHNICAL_PLAN.md) - 详细技术方案

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

与 Label Studio 项目保持一致。
