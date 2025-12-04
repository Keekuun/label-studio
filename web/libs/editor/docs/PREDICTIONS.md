# Predictions（预测/预标注）配置说明

## 1. 概述

`predictions` 是 Label Studio 中用于存储**机器学习模型或后端系统自动生成的预标注数据**的配置项。它与 `annotations`（人工标注）在结构上相似，但用途不同：

- **`annotations`**: 标注员手动创建的标注结果，是最终用于训练或评估的"真值"数据
- **`predictions`**: 模型自动生成的预标注，用于辅助标注员快速完成标注任务

## 2. 数据结构

### 2.1 基本格式

```json
{
  "data": {
    "image": "https://example.com/image.jpg"
  },
  "predictions": [
    {
      "model_version": "model 1",
      "created_ago": "3 hours",
      "result": [
        {
          "from_name": "tag",
          "id": "t5sp3TyXPo",
          "source": "$image",
          "to_name": "img",
          "type": "rectanglelabels",
          "value": {
            "height": 11.61,
            "rectanglelabels": ["Moonwalker"],
            "rotation": 0,
            "width": 39.6,
            "x": 13.2,
            "y": 34.7
          }
        }
      ]
    }
  ]
}
```

### 2.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model_version` | string | 否 | 生成该预测的模型版本标识，用于区分不同模型或版本的预测结果 |
| `created_ago` | string | 否 | 人类可读的时间描述（如 "3 hours", "2 days ago"），用于显示预测的创建时间 |
| `result` | array | **是** | 标注结果数组，格式与 `annotations` 中的 `result` 完全相同 |
| `score` | number | 否 | 预测的置信度分数（0-1），用于评估预测质量 |

### 2.3 Result 格式

`result` 数组中的每个元素遵循 Label Studio 的标准标注格式：

```json
{
  "from_name": "tag",        // 对应 XML 配置中 control tag 的 name
  "to_name": "img",          // 对应 XML 配置中 object tag 的 name
  "type": "rectanglelabels", // 标注类型（rectanglelabels, polygon, brush 等）
  "id": "unique-id",         // 唯一标识符
  "source": "$image",        // 数据源引用
  "value": {                 // 标注的具体值，类型取决于标注类型
    "x": 13.2,
    "y": 34.7,
    "width": 39.6,
    "height": 11.61,
    "rectanglelabels": ["Moonwalker"]
  }
}
```

## 3. 功能特性

### 3.1 多模型预测支持

一个任务可以包含多个 `predictions`，每个预测可以来自不同的模型版本：

```json
"predictions": [
  {
    "model_version": "model 1",
    "result": [...]
  },
  {
    "model_version": "model 2",
    "result": [...]
  },
  {
    "model_version": "model 3",
    "result": [...]
  }
]
```

### 3.2 UI 显示

在 Label Studio 界面中，predictions 具有以下特征：

1. **特殊图标标识**: 显示紫色火花图标（✨ `IconSparks`），用于区分预测和人工标注
2. **模型版本显示**: 显示 `model_version` 字段的值
3. **置信度分数**: 如果提供了 `score`，会显示为百分比（如 "85.23%"）
4. **创建时间**: 显示 `created_ago` 或自动计算的时间差

### 3.3 交互方式

- **查看预测**: 点击顶部标注列表中的预测项，可以查看模型生成的预标注结果
- **切换预测**: 如果有多个预测，可以在标注列表中切换查看不同模型的预测
- **转换为标注**: 标注员可以基于预测结果进行修改，创建新的标注（annotations）
- **非交互模式**: 某些预测结果可以设置为 `interactive_mode: false`，这些结果会自动显示在画布上，无需手动选择

## 4. 使用场景

### 4.1 预标注工作流

1. **模型生成预测**: ML 后端或模型服务生成预测结果，写入任务的 `predictions` 字段
2. **标注员审核**: 标注员查看预测结果，确认或修正
3. **创建标注**: 基于预测结果创建正式的 `annotations`

### 4.2 主动学习

- 模型对未标注数据进行预测
- 标注员只标注模型不确定或错误的部分
- 提高标注效率，减少重复工作

### 4.3 模型对比

- 同时提供多个模型版本的预测
- 标注员可以对比不同模型的效果
- 选择最佳模型或进行模型融合

## 5. 代码实现

### 5.1 数据加载

在 `web/libs/editor/src/stores/Annotation/store.js` 中：

```javascript
// AnnotationStore 维护两个独立的数组
annotations: types.array(Annotation),  // 人工标注
predictions: types.array(Annotation),  // 模型预测

// 添加预测
function addPrediction(options = {}) {
  options.editable = false;  // 预测默认不可直接编辑
  options.type = "prediction";
  const item = createItem(options);
  self.predictions.push(item);
  return item;
}
```

### 5.2 UI 组件

在 `web/libs/editor/src/components/TopBar/Annotations.jsx` 中：

```javascript
// 判断是否为预测
const isPrediction = entity.type === "prediction";

// 显示预测图标
{prediction && <IconSparks color="#944BFF" />}

// 显示置信度分数
{isPrediction && isDefined(entity.score) && (
  <span>{(entity.score * 100).toFixed(2)}%</span>
)}
```

### 5.3 选择预测

```javascript
// 选择特定的预测
function selectPrediction(id) {
  const p = selectItem(id, self.predictions);
  return p;
}
```

## 6. 与 Annotations 的区别

| 特性 | Predictions | Annotations |
|------|-------------|-------------|
| **来源** | 模型/后端自动生成 | 标注员手动创建 |
| **可编辑性** | 默认不可直接编辑 | 可直接编辑 |
| **UI 标识** | 紫色火花图标 ✨ | 用户头像 |
| **用途** | 辅助标注，提供参考 | 最终标注结果 |
| **存储位置** | `task.predictions` | `task.annotations` |
| **类型标识** | `type: "prediction"` | `type: "annotation"` |

## 7. 实际示例

### 7.1 图像边界框预测

```json
{
  "data": {
    "image": "https://example.com/photo.jpg"
  },
  "predictions": [
    {
      "model_version": "yolo-v5-2024",
      "created_ago": "1 hour",
      "score": 0.92,
      "result": [
        {
          "from_name": "tag",
          "to_name": "img",
          "type": "rectanglelabels",
          "value": {
            "x": 10,
            "y": 20,
            "width": 30,
            "height": 40,
            "rectanglelabels": ["Person"]
          }
        }
      ]
    }
  ]
}
```

### 7.2 多模型预测对比

```json
"predictions": [
  {
    "model_version": "baseline-v1",
    "result": [{"type": "rectanglelabels", "value": {...}}]
  },
  {
    "model_version": "improved-v2",
    "result": [{"type": "rectanglelabels", "value": {...}}]
  }
]
```

标注员可以在 UI 中切换查看两个模型的预测结果，选择更准确的版本。

## 8. 最佳实践

1. **提供模型版本**: 始终设置 `model_version`，便于追踪和对比
2. **包含置信度**: 提供 `score` 字段，帮助标注员判断预测质量
3. **时间戳**: 使用 `created_ago` 或自动生成时间，便于了解预测的新旧程度
4. **结果格式**: 确保 `result` 格式与 XML 配置完全匹配
5. **非交互模式**: 对于高置信度的预测，可以设置 `interactive_mode: false` 自动显示

## 9. 相关配置

- **XML 配置**: `config.xml` 定义了标注界面和可用的标注类型
- **Interface 设置**: 通过 `annotations:tabs` 和 `predictions:tabs` 控制是否显示标注/预测标签页
- **预标注设置**: 项目设置中可以配置是否自动使用预测进行预标注

## 10. 总结

`predictions` 是 Label Studio 中实现**人机协作标注**的核心机制。通过提供模型生成的预标注，可以：

- ✅ 大幅提高标注效率
- ✅ 减少标注员的重复工作
- ✅ 支持模型迭代和对比
- ✅ 实现主动学习工作流

正确使用 `predictions` 可以显著提升标注项目的整体效率和模型训练质量。

