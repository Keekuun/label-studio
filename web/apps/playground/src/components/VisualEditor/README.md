# 可视化编辑器实现指南

## 快速开始

### 1. 安装依赖

```bash
cd web/apps/playground
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install antd xml2js
```

### 2. 核心概念

#### 组件树（Component Tree）
所有配置以树形结构存储，每个节点代表一个 XML 标签。

#### 组件元数据（Component Meta）
定义每个标签的属性、验证规则、依赖关系等。

#### 拖拽系统
- **组件面板** → **画布**：创建新组件
- **画布内拖拽**：调整组件顺序和层级

#### XML 转换
- **JSON → XML**：将组件树序列化为 XML
- **XML → JSON**：解析 XML 为组件树

### 3. 实现优先级

1. **P0（核心功能）**
   - 基础拖拽（组件面板到画布）
   - 组件树显示
   - 属性编辑
   - XML 生成和预览

2. **P1（重要功能）**
   - 画布内拖拽排序
   - 组件删除、复制
   - 属性验证
   - 撤销/重做

3. **P2（增强功能）**
   - 嵌套组件支持
   - 模板系统
   - 导入/导出
   - 快捷键支持

### 4. 开发建议

- 先实现简单的组件（如 View, Image, RectangleLabels）
- 逐步扩展到所有标签类型
- 保持与现有 playground 的集成
- 注重用户体验和错误处理

