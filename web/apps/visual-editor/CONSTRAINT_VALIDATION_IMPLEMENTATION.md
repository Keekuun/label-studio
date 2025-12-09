# 拖拽约束验证实现文档

## 概述

已实现完整的组件拖拽约束验证系统，确保用户只能按照 Label Studio 的组件嵌套规则进行拖拽操作。

## 实现的功能

### 1. 约束验证工具 (`src/utils/constraintValidator.ts`)

创建了完整的约束验证工具函数集：

- **`canAddChild(parentType, childType)`**: 验证父组件是否允许添加指定类型的子组件
- **`canBeChildOf(childType, parentType)`**: 验证子组件是否可以作为指定父组件的子组件
- **`canBindControl(controlType, objectType)`**: 验证 Control 组件是否可以绑定到指定的 Object 组件
- **`validateDragOperation(childType, parentNode)`**: 综合验证拖拽操作是否有效
- **`getBindableObjects(controlType, rootNode)`**: 获取可以绑定到指定 Control 组件的 Object 组件列表
- **`validateToName(controlType, toNameValue, rootNode)`**: 验证 toName 属性值是否有效

### 2. 拖拽约束验证 (`VisualEditorApp.tsx`)

在 `handleDragEnd` 中添加了约束验证：

- ✅ 从组件面板拖拽到画布时验证
- ✅ 从组件面板拖拽到画布节点时验证
- ✅ 画布内移动组件时验证
- ✅ 验证失败时显示友好的错误提示

### 3. 视觉反馈 (`ComponentNodeItem.tsx`)

实现了拖拽时的视觉反馈：

- ✅ 使用 `useDndMonitor` 监听拖拽状态
- ✅ 实时验证是否可以放置
- ✅ 有效放置：绿色边框和背景 (`dragOver`)
- ✅ 无效放置：红色边框和背景 (`dragOverInvalid`)
- ✅ 拖拽结束时重置状态

### 4. 属性面板优化 (`AttributeEditor.tsx`)

优化了属性编辑器的 `toName` 属性处理：

- ✅ 根据 `toNameConstraints` 过滤可绑定的对象
- ✅ 只显示符合约束的对象组件
- ✅ 添加自定义验证规则
- ✅ 显示友好的错误提示
- ✅ 当没有可绑定对象时禁用下拉框

### 5. 样式更新 (`CanvasArea.module.scss`)

添加了无效拖拽的样式：

```scss
.dragOverInvalid {
  border-color: #ff4d4f;
  background: #fff1f0;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.15);
  cursor: not-allowed;
}
```

## 约束规则

### 1. 组件嵌套约束

- **allowedChildren**: 父组件允许的子组件类型列表
- **allowedParents**: 子组件允许的父组件类型列表

示例：
- `View` 可以包含几乎所有组件
- `Label` 只能作为 `*Labels` 组件的子组件
- `Choice` 只能作为 `Choices` 组件的子组件

### 2. 对象绑定约束

- **toNameConstraints**: Control 组件可以绑定到的 Object 组件类型列表

示例：
- `RectangleLabels` 只能绑定到 `Image`
- `TextArea` 可以绑定到 `Audio`、`Image`、`Text`、`TimeSeries` 等
- `Ruler` 只能绑定到 `Image`

### 3. 必填属性约束

- **requiredAttributes**: 组件必须设置的属性列表

示例：
- `Label` 必须设置 `value` 属性
- `Choice` 必须设置 `value` 属性

## 使用示例

### 验证拖拽操作

```typescript
import { validateDragOperation } from '../utils/constraintValidator';

const validation = validateDragOperation('RectangleLabels', parentNode);
if (!validation.valid) {
  message.warning(validation.message);
  return;
}
```

### 获取可绑定的对象

```typescript
import { getBindableObjects } from '../utils/constraintValidator';

const bindableObjects = getBindableObjects('RectangleLabels', rootNode);
// 返回所有可以绑定到 RectangleLabels 的 Image 组件
```

### 验证 toName 属性

```typescript
import { validateToName } from '../utils/constraintValidator';

const validation = validateToName('RectangleLabels', 'img-1', rootNode);
if (!validation.valid) {
  // 显示错误提示
}
```

## 用户体验改进

1. **实时视觉反馈**: 拖拽时立即显示是否可以放置
2. **友好错误提示**: 验证失败时显示清晰的错误消息
3. **智能过滤**: 属性面板只显示符合约束的选项
4. **防止错误操作**: 在拖拽结束时阻止无效操作

## 测试建议

1. **嵌套约束测试**:
   - 尝试将 `Label` 拖拽到 `View`（应该失败）
   - 尝试将 `Label` 拖拽到 `RectangleLabels`（应该成功）

2. **对象绑定测试**:
   - 尝试将 `RectangleLabels` 拖拽到没有 `Image` 的画布（应该失败）
   - 尝试设置 `RectangleLabels` 的 `toName` 为不存在的对象（应该失败）

3. **视觉反馈测试**:
   - 拖拽组件时观察边框颜色变化
   - 验证有效和无效状态的视觉区别

## 后续优化建议

1. **拖拽预览优化**: 在拖拽时显示约束提示信息
2. **批量验证**: 支持批量操作时的约束验证
3. **约束提示**: 在组件面板中显示组件的约束信息
4. **自动修复**: 提供自动修复无效配置的建议

## 相关文件

- `src/utils/constraintValidator.ts` - 约束验证工具
- `src/components/VisualEditor/VisualEditorApp.tsx` - 拖拽处理
- `src/components/VisualEditor/CanvasArea/ComponentNodeItem.tsx` - 视觉反馈
- `src/components/VisualEditor/PropertiesPanel/AttributeEditor.tsx` - 属性编辑
- `src/data/componentMetas.ts` - 组件元数据配置

