# Label Studio 前端

Label Studio 前端（LSF）是 Label Studio 生态系统的关键模块，驱动着整个标注流程。它是一个纯前端模块，结合了用于创建标注的用户界面和标准化标注格式的数据层。Label Studio 中的每个手动标注都是使用 LSF 制作的，使其成为系统的重要组成部分。

### 使用说明

LSF 提供了特定的脚本来进行操作和测试：

_重要提示：这些脚本必须在 web 文件夹或其子文件夹内执行。这对于脚本的正确运行至关重要，因为它们被设计为在 web 目录结构和依赖关系的上下文中工作。_

- **`yarn lsf:watch`：持续构建 LSF**
  - 对于开发至关重要，此脚本会持续构建 Label Studio 前端（LSF），允许开发人员在 Label Studio 环境中实时观察他们的更改。
- **`yarn lsf:serve`：独立运行 LSF**
  - 以独立模式运行 Label Studio 前端。访问 http://localhost:3000 以独立模式使用应用程序。
- **`yarn lsf:e2e`：对 LSF 执行端到端（e2e）测试**
  - 运行全面的 e2e 测试，确保前端从开始到结束都能按预期工作。Label Studio 环境必须正在运行，通常在 `http://localhost:8080`。
- **`yarn lsf:integration`：运行集成测试**
  - 使用 Cypress 进行集成测试，验证 LSF 的不同部分是否能正确协同工作。必须运行 LSF 独立模式（`yarn lsf:serve`）。
- **`yarn lsf:integration:ui`：在 UI 模式下运行集成测试**
  - 通过在 UI 模式下运行集成测试来促进调试，让您能够直观地跟踪正在测试的内容。必须运行 LSF 独立模式（`yarn lsf:serve`）。
- **`yarn lsf:unit`：对 LSF 运行单元测试**
  - 对于维护代码质量和可靠性至关重要，特别是在协作开发中。

### 文档

编辑器附带了全面的文档，帮助您理解并扩展其功能：

- [自定义组件开发指南](docs/DEVELOPING_COMPONENTS.md) - 了解如何创建自定义组件以扩展功能
- [国际化实现指南](docs/I18N_IMPLEMENTATION_GUIDE.md) - i18n 系统实现的完整指南
- [i18n 快速参考](docs/I18N_QUICK_REFERENCE.md) - 国际化工作的快速参考
- [图像组件和控制器](docs/IMAGE_COMPONENT.md) - 图像组件和控制器工作原理的详细说明
- [工具快捷键实现](docs/TOOL_SHORTCUT_IMPLEMENTATION.md) - 工具组件中键盘快捷键实现方式的分析
- [XML 到 React 渲染](docs/XML_TO_REACT_RENDERING.md) - XML 配置如何转换为 React 组件的说明

### 语言

- [English Version](README.md) - English version of the documentation

<img src="https://github.com/HumanSignal/label-studio/blob/develop/images/opossum_looking.png?raw=true" title="大家好！" height="140" width="140" />