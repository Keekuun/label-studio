# Visual Editor 组件配置状态

## 已完成的工作

### 1. 类型定义更新 (`src/types/index.ts`)
- ✅ 添加了 `allowedParents`：父组件约束
- ✅ 添加了 `toNameConstraints`：对象绑定约束

### 2. 组件配置 (`src/data/componentMetas.ts`)
已添加 **56 个组件**的完整配置：

#### Visual 组件（10个）
1. ✅ View - 视图容器（完整属性）
2. ✅ Header - 标题
3. ✅ PagedView - 分页视图
4. ✅ Collapse - 折叠面板
5. ✅ Markdown - Markdown 显示
6. ✅ Dialog - 对话框
7. ✅ Filter - 过滤器
8. ✅ Style - CSS 样式
9. ✅ Panel - 面板（Collapse 的子组件）
10. ✅ Repeater - 重复器（虚拟标签）

#### Object 组件（11个）
1. ✅ Image - 图像（完整属性，30+ 个属性）
2. ✅ Text - 文本（完整属性）
3. ✅ Audio - 音频（完整属性）
4. ✅ Video - 视频（完整属性）
5. ✅ HyperText - 超文本（完整属性）
6. ✅ RichText - 富文本（完整属性）
7. ✅ TimeSeries - 时间序列（完整属性）
8. ✅ Table - 表格
9. ✅ List - 列表
10. ✅ Paragraphs - 段落（完整属性）
11. ✅ Pdf - PDF 文档

#### Control 组件（32个）
1. ✅ RectangleLabels - 矩形标签（完整属性）
2. ✅ Rectangle - 矩形工具
3. ✅ PolygonLabels - 多边形标签（完整属性）
4. ✅ Polygon - 多边形工具
5. ✅ EllipseLabels - 椭圆标签（完整属性）
6. ✅ Ellipse - 椭圆工具
7. ✅ KeyPointLabels - 关键点标签（完整属性）
8. ✅ KeyPoint - 关键点工具
9. ✅ BrushLabels - 画笔标签
10. ✅ Brush - 画笔工具
11. ✅ BitmaskLabels - 位掩码标签
12. ✅ Bitmask - 位掩码工具
13. ✅ MagicWand - 魔法棒
14. ✅ VectorLabels - 向量标签（完整属性）
15. ✅ Labels - 标签（完整属性）
16. ✅ Choices - 选择（完整属性）
17. ✅ TextArea - 文本区域（完整属性）
18. ✅ Ruler - 标尺
19. ✅ Number - 数字（完整属性）
20. ✅ Rating - 评分（完整属性）
21. ✅ DateTime - 日期时间（完整属性）
22. ✅ Taxonomy - 分类（完整属性）
23. ✅ Ranker - 排序器
24. ✅ Pairwise - 成对比较
25. ✅ Relations - 关系
26. ✅ TimelineLabels - 时间线标签
27. ✅ VideoRectangle - 视频矩形
28. ✅ HyperTextLabels - 超文本标签
29. ✅ ParagraphLabels - 段落标签
30. ✅ TimeSeriesLabels - 时间序列标签（完整属性）

#### Label Item 组件（5个）
1. ✅ Label - 标签项（完整属性，15+ 个属性）
2. ✅ Choice - 选项（完整属性）
3. ✅ Shortcut - 快捷键
4. ✅ Bucket - 桶（Ranker 的子组件）
5. ✅ Relation - 关系项（Relations 的子组件）

## 配置特点

每个组件包含：
- ✅ **基本信息**：type, category, group, sortOrder, displayName, description
- ✅ **属性定义**：name, type, label, defaultValue, required, description, options
- ✅ **约束关系**：
  - `allowedChildren`：允许的子组件列表
  - `allowedParents`：父组件约束（如 Label 只能作为 *Labels 的子组件）
  - `toNameConstraints`：对象绑定约束（Control 组件可以绑定到哪些 Object 组件）
  - `requiredAttributes`：必填属性列表

## 文件统计

- **文件总行数**：约 3850+ 行
- **组件总数**：56 个
- **属性总数**：500+ 个属性定义

## 下一步工作

### 1. 实现拖拽约束验证
- [ ] 在 `CanvasArea` 中实现拖拽时的约束检查
- [ ] 根据 `allowedChildren` 限制可拖入的子组件
- [ ] 根据 `allowedParents` 限制可拖入的父组件
- [ ] 根据 `toNameConstraints` 限制 Control 组件只能绑定到指定的 Object 组件

### 2. 完善属性面板
- [ ] 根据 `attributes` 动态生成表单字段
- [ ] 实现 `toName` 属性的动态下拉选择（从画布中的 Object 组件获取）
- [ ] 实现属性值的实时更新
- [ ] 实现必填属性验证

### 3. 组件分组和排序
- [ ] 在 `ComponentPalette` 中按 `group` 和 `sortOrder` 分组显示
- [ ] 优化组件卡片的显示顺序

### 4. 组件图标
- [ ] 为每个组件添加合适的图标
- [ ] 在组件面板中显示图标

### 5. 模板功能增强
- [ ] 根据组件配置验证模板的有效性
- [ ] 提供更多预设模板

## 使用示例

### 获取组件元数据
```typescript
import { getComponentMeta, getAllComponentMetas } from './data/componentMetas';

// 获取单个组件的元数据
const imageMeta = getComponentMeta('Image');
console.log(imageMeta?.attributes); // 所有属性定义
console.log(imageMeta?.allowedChildren); // 允许的子组件
console.log(imageMeta?.toNameConstraints); // 对象绑定约束

// 获取所有组件
const allMetas = getAllComponentMetas();
```

### 验证拖拽约束
```typescript
function canDropComponent(parentType: string, childType: string): boolean {
  const parentMeta = getComponentMeta(parentType);
  if (!parentMeta?.allowedChildren) return false;
  return parentMeta.allowedChildren.includes(childType);
}

function canBindControl(controlType: string, objectType: string): boolean {
  const controlMeta = getComponentMeta(controlType);
  if (!controlMeta?.toNameConstraints) return false;
  return controlMeta.toNameConstraints.includes(objectType);
}
```

## 注意事项

1. **组件类型大小写**：所有组件类型使用首字母大写的驼峰命名（如 `RectangleLabels`），但在 XML 中使用小写（如 `rectanglelabels`）
2. **属性名称映射**：XML 中的属性名使用小写（如 `toName`），但在配置中使用驼峰命名（如 `toName`）
3. **布尔属性格式**：XML 中的布尔属性必须使用 `key="true"` 或 `key="false"` 格式
4. **虚拟标签**：`Repeater` 是虚拟标签，在配置解析时会被展开，实际使用时需要注意

## 参考文档

- 组件约束和属性文档：`web/libs/editor/docs/COMPONENT_CONSTRAINTS_AND_ATTRIBUTES.md`
- 组件元数据配置：`web/apps/visual-editor/src/data/componentMetas.ts`
- 类型定义：`web/apps/visual-editor/src/types/index.ts`

