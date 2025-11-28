# Image 组件与控制器工作原理

本文汇总 `Image` 对象标签与其控制器（`RectangleLabels`、`PolygonLabels` 等）在 Label Studio 前端中的实现方式，并提供扩展新增控制器的操作指南。

## 1. Image 组件定位

- **模型组合**：`ImageModel` 定义于 `web/libs/editor/src/tags/object/Image/Image.js`，由 `TagAttrs`、`ObjectBase`、`MultiItemObjectBase`（多图模式）、`AnnotationMixin`、`IsReadyWithDepsMixin`、`ImageEntityMixin`、核心 `Model` 以及坐标换算 mixin 组合而成。它负责：
  - 解析 XML 中的 `value` / `valueList`，通过 `parseValue()` 与任务数据绑定。
  - 维护 `regions` 数组（联合 `RectRegionModel`、`PolygonRegionModel`、`BrushRegionModel` 等），并和 `annotation.regionStore` 同步。
  - 管理缩放、旋转、亮度/对比度、网格、十字准线等显示状态。
  - 通过 `ImageEntityMixin` 管理多张图片的下载、预加载、自然尺寸、缩放因子等。
- **视图绑定**：`HtxImage` 仅注入 `store` 并渲染 `ImageView`（`web/libs/editor/src/components/ImageView/Image.jsx`），该视图在 `onLoad` 时回调 `updateImageSize`，并根据 `imageTransform` 应用缩放/旋转 CSS。

## 2. 渲染与数据流

1. XML 配置解析后，`Image` 标签会在 `Registry` 中被映射到 `ImageModel`，创建 MST 实例时会初始化 `imageEntities` 并根据 `valueList` 支持多页图片。
2. `afterAttach()` 会根据属性（如 `zoomControl`, `rotateControl`）将 Move/Zoom/Brightness/Contrast/Rotate 等内置工具注册到 `ToolsManager`，并创建图像实体列表。
3. `ImageView` 渲染过程中根据实体下载状态显示进度或错误，通过 `ImageRenderer` 处理跨域与缩放样式；所有交互事件最终回流至 `ImageModel.event()`，由工具管理器派发给当前选中的工具。

## 3. 控制器与工具链

- **控制器映射**：`ImageModel.states()` 会从 `annotation.toNames` 里检索所有 `toName=image` 的控制标签，并在 `activeStates()` 中筛选当前选中的 `labels` 控件。`controlButton()`/`controlButtonType` 用于确定工具栏上应展示的控制器图标。
- **ToolManager 管理**：
  - 对象侧：`ImageModel.afterAttach()` 根据配置将通用工具注册到 `ToolsManager`，`getToolsManager()` 在其他动作中复用同一实例。
  - 控制器侧：如 `RectangleLabels`，其模型由 `ControlBase` + `LabelsModel` + `RectangleModel` 等组合，并包含 `toolNames` 列表。`ToolManagerMixin` 会在 `afterAttach()` 中把控制器声明的工具（`Rect`、`Brush` 等）实例注册到与 `Image` 共用的 `ToolsManager`。
- **受控对象限制**：控制器通过 `Types.unionTag(["Image"])` 声明仅能绑定 `Image` 对象，确保 `toName` 检查在模型层执行。

## 4. 区域模型与结果序列化

- `ImageModel.createDrawingRegion()` 在开始绘制时临时生成区域草稿，`addShape()` 则在提交后把 `region` 推入 `regions` 并与 `annotation` 对齐。
- `createSerializedResult()` 会读取当前图片的原始尺寸、旋转、`item_index` 等信息写入结果，未加载完成时则降级到 `_rawResult`，保证多图场景下一致性。
- 所有缩放与坐标换算通过 `CoordsCalculations`（或 `AbsoluteCoordsCalculations`）封装，`canvasToInternalX/Y` 负责在不同工具之间统一坐标系，实现像素吸附 (`snapPointToPixel`) 与视口变换。

## 5. 新增 Image 控制器指南

> 目标：让自定义控制器能够针对 `Image` 生成新的区域类型或交互工具。

1. **定义控制器 Model**
   - 在 `web/libs/editor/src/tags/control/` 下创建新文件（例如 `MyShapeLabels.jsx`），使用 `ControlBase`、`AnnotationMixin`、`LabelMixin` 等组合出 MST 模型。
   - 通过 `Types.unionTag(["Image"])`（或更细粒度的受控对象列表）限制 `toName`。
   - 若需要工具栏入口，设置 `toolNames = ["MyShapeTool"]` 并确保在 `web/libs/editor/src/tools` 下实现对应工具类。
2. **准备区域模型**
   - 若新控制器重用现有区域（如 `RectRegionModel`），直接在控制器模型中 compose。
   - 如果需要全新区域（例如 `StarRegionModel`），需在 `web/libs/editor/src/regions/` 下实现该模型，并把它加入 `ImageModel.regions` 的 `types.union(...)` 中，否则结果树不会接受该区域。
3. **注册工具与视图**
   - 在控制器文件中调用 `Registry.addTag("myshapelabels", MyShapeLabelsModel, HtxMyShapeLabels)`。
   - 视图层可复用 `HtxLabels` 或自定义 React 组件，确保使用 `observer` 包裹并通过 `item` prop 获取 MST 实例。
4. **处理绘制/序列化**
   - 工具层调用 `control.createResult()` 时会落到 `ImageModel.createDrawingRegion()`，因此新区域需要实现 `updateImageSize`、`serialize()` 等方法以兼容缩放与结果导出。
   - 如果控制器需要特定的吸附策略，可在 `Tool` 内调用 `control.getSnappedPoint()` 并设置 `snapMode`。
5. **更新配置与测试**
   - 在 XML 配置中添加 `<MyShapeLabels name="labels" toName="image">...</MyShapeLabels>` 并关联 `<Image name="image" .../>`。
   - 运行 `cd web && yarn lsf:serve` 验证交互；如涉及多图/分辨率缩放，需检查 `createSerializedResult()` 输出。

## 6. 调试与排障建议

- 使用 `annotation.history` 快照定位缩放后区域错位的问题；`ImageModel._updateRegionsSizes()` 会在缩放或容器尺寸变化时批量更新区域坐标，必要时在该函数内添加日志。
- 开启 `FF_DEV_3793` 时，注意坐标系切换为绝对像素，工具需读取 `zoomedPixelSize` 以避免点击漂移。
- 利用 `ImageModel.suggestions` / `supportSuggestions` 可以在控制器中实现模型预标注的自定义呈现，调试时可通过浏览器控制台查看 `annotation.regionStore.suggestions`。

通过以上结构化信息，可以快速定位 Image 组件与控制器之间的协作关系，并在保证现有工具链一致性的前提下扩展新的图像标注能力。

