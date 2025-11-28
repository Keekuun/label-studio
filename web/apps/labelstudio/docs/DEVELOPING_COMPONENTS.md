# 自定义组件开发指南

Editor 支持开发自定义组件来扩展功能。组件分为三类：

- **Object 组件**：用于显示数据（如 `Image`, `Text`, `Markdown`）
- **Control 组件**：用于标注控制（如 `Number`, `Choice`, `Rectangle`）
- **Visual 组件**：用于视觉布局（如 `View`, `Header`）

## 组件开发步骤

### 1. 创建组件文件

根据组件类型，在相应目录下创建文件：

- Object 组件：`src/tags/object/YourComponent.jsx`
- Control 组件：`src/tags/control/YourComponent.jsx`
- Visual 组件：`src/tags/visual/YourComponent.jsx`

### 2. 定义 Model（数据模型）

使用 `mobx-state-tree` 定义组件的数据模型：

```javascript
import { types } from "mobx-state-tree";
import Base from "./Base";  // 或 control/Base.js
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import ProcessAttrsMixin from "../../mixins/ProcessAttrs";

const Model = types
  .model({
    type: "your-component",  // 组件类型标识
    value: types.maybeNull(types.string),  // 组件属性
    // 添加其他属性...
  })
  .actions((self) => ({
    // 定义操作方法
    updateValue(store) {
      // 处理数据更新逻辑
    },
  }));

// 组合 Mixins
const YourComponentModel = types.compose(
  "YourComponentModel",
  Base,
  ProcessAttrsMixin,
  AnnotationMixin,  // Object 组件需要
  Model
);
```

### 3. 创建 View（React 组件）

创建 React 组件来渲染 UI：

```javascript
import { inject, observer } from "mobx-react";
import { YourComponentView } from "../../components/YourComponent/YourComponentView";

// 使用 inject 注入 store，observer 使其响应式
const HtxYourComponent = inject("store")(observer(({ item }) => {
  return <YourComponentView item={item} />;
}));
```

或者直接内联实现：

```javascript
import { inject, observer } from "mobx-react";

const HtxYourComponent = inject("store")(observer(({ item }) => {
  return (
    <div className="your-component">
      {/* 组件 UI */}
    </div>
  );
}));
```

### 4. 注册组件

使用 `Registry` 注册组件：

```javascript
import Registry from "../../core/Registry";

// 注册标签
Registry.addTag("your-component", YourComponentModel, HtxYourComponent);

// 如果是 Object 组件，还需要注册对象类型
Registry.addObjectType(YourComponentModel);
```

### 5. 导出组件（可选）

如果组件需要在其他地方使用，导出它：

```javascript
export { HtxYourComponent, YourComponentModel };
```

## 完整示例：Markdown 组件

参考 `src/tags/object/Markdown.jsx` 的实现：

```javascript
import { inject } from "mobx-react";
import { types } from "mobx-state-tree";
import Registry from "../../core/Registry";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import ProcessAttrsMixin from "../../mixins/ProcessAttrs";
import Base from "./Base";
import { parseValue } from "../../utils/data";
import { MarkdownPreview } from "../../components/MarkdownPreview/MarkdownPreview";

// 1. 定义 Model
const Model = types
  .model({
    type: "markdown",
    value: types.maybeNull(types.string),
    valuetype: types.optional(types.enumeration(["text", "url"]), "text"),
    encoding: types.optional(
      types.enumeration(["none", "base64unicode"]),
      "none"
    ),
    _content: types.maybeNull(types.string),
  })
  .actions((self) => ({
    updateValue(store) {
      const parsed = parseValue(self.value, store.task.dataObj);
      // 处理数据逻辑...
      self._content = parsed;
    },
  }));

// 2. 组合 Mixins
const MarkdownModel = types.compose(
  "MarkdownModel",
  Base,
  ProcessAttrsMixin,
  AnnotationMixin,
  Model
);

// 3. 创建 View
const HtxMarkdown = inject("store")(MarkdownPreview);

// 4. 注册组件
Registry.addTag("markdown", MarkdownModel, HtxMarkdown);
Registry.addObjectType(MarkdownModel);

export { HtxMarkdown, MarkdownModel };
```

## 常用 Mixins

- **`Base`** / **`ControlBase`**：基础功能
- **`AnnotationMixin`**：标注相关功能（Object 组件必需）
- **`ProcessAttrsMixin`**：处理属性值解析
- **`PerRegionMixin`**：支持按区域标注
- **`RequiredMixin`**：必填验证
- **`ReadOnlyControlMixin`**：只读模式

## 组件开发注意事项

### 1. 命名规范

- Model 名称：`YourComponentModel`
- View 组件名称：`HtxYourComponent`（Htx 前缀表示 HyperText）
- 文件命名：使用 PascalCase（如 `YourComponent.jsx`）

### 2. 类型定义

- 使用 `types.maybeNull()` 处理可选值
- 使用 `types.optional()` 设置默认值
- 使用 `types.enumeration()` 限制枚举值

### 3. 数据解析

- 使用 `parseValue()` 解析配置中的 `$variable` 引用
- 在 `updateValue()` 方法中处理数据更新

### 4. 响应式更新

- View 组件必须使用 `observer()` 包装
- 使用 `inject("store")` 注入 store
- Model 中的属性变化会自动触发 View 更新

### 5. 样式处理

- 创建对应的 `.scss` 文件
- 使用 CSS Modules 或 BEM 命名规范
- 注意 CSS 前缀（默认 `lsf-`）

## 测试自定义组件

### 1. 在配置中使用

```xml
<View>
  <YourComponent name="comp-1" value="$data" />
</View>
```

### 2. 运行开发服务器

```bash
yarn lsf:serve
```

### 3. 编写单元测试

在 `src/tags/object/__tests__/` 或 `src/tags/control/__tests__/` 下创建测试文件

## 参考资源

### 现有组件示例

- **Object 组件**：`src/tags/object/Markdown.jsx` - Markdown 显示组件
- **Control 组件**：`src/tags/control/Number.jsx` - 数字输入组件
- **简单组件**：`src/tags/control/Rating.jsx` - 评分组件

### 核心文件

- **`src/core/Registry.ts`** - 组件注册机制
- **`src/tags/object/Base.js`** - Object 组件基类
- **`src/tags/control/Base.js`** - Control 组件基类
- **`src/mixins/`** - 各种功能 Mixins

### Mixins 详细说明

- **`AnnotationMixin`** (`src/mixins/AnnotationMixin.js`) - 提供标注相关功能
- **`ProcessAttrsMixin`** (`src/mixins/ProcessAttrs.js`) - 处理属性值解析和数据解析
- **`PerRegionMixin`** (`src/mixins/PerRegion.js`) - 支持按区域标注
- **`RequiredMixin`** (`src/mixins/Required.js`) - 必填验证
- **`ReadOnlyControlMixin`** (`src/mixins/ReadOnlyMixin.js`) - 只读模式支持

## 常见问题

### Q: 组件注册后无法使用？

**A**: 确保：
1. 组件文件已被正确导入（在 `src/tags/object/index.js` 或相应索引文件中）
2. 使用 `Registry.addTag()` 注册了组件
3. Object 组件还需要调用 `Registry.addObjectType()`

### Q: 组件样式不生效？

**A**: 检查：
1. 样式文件是否正确导入
2. CSS 类名是否正确使用
3. 是否有 CSS 前缀冲突（默认 `lsf-`）

### Q: 组件数据不更新？

**A**: 确保：
1. View 组件使用了 `observer()` 包装
2. Model 中的属性变化是通过 MST actions 进行的
3. 使用了 `inject("store")` 注入 store

### Q: 如何调试组件？

**A**: 
1. 使用浏览器开发者工具查看组件状态
2. 在 Model 的 actions 中添加 `console.log` 调试
3. 使用 React DevTools 查看组件树
4. 检查 MobX State Tree 的 snapshots

## 最佳实践

1. **保持组件简单**：每个组件只负责一个功能
2. **复用现有组件**：查看是否有类似的组件可以复用或扩展
3. **遵循命名规范**：保持与现有组件一致的命名风格
4. **编写测试**：为新组件编写单元测试和集成测试
5. **文档化**：在组件文件中添加 JSDoc 注释，说明组件的用途和参数

