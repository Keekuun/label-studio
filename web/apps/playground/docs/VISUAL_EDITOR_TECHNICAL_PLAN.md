# Label Studio 可视化拖拽编辑器技术方案

## 一、需求分析

### 1.1 现状
- **当前方式**：通过 XML 配置文件定义 Label Studio 模板
- **优点**：对开发人员友好，灵活度高
- **缺点**：对运营人员不友好，需要理解 XML 语法和标签结构

### 1.2 目标
- **可视化编辑**：通过拖拽组件的方式配置模板
- **所见即所得**：实时预览配置效果
- **降低门槛**：运营人员无需了解 XML 语法即可配置

## 二、技术选型

### 2.1 拖拽库对比

| 库名 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **dnd-kit** | 现代化、TypeScript 支持好、性能优秀、支持触摸设备 | 学习曲线较陡 | ⭐⭐⭐⭐⭐ |
| react-dnd | 成熟稳定、功能强大 | API 复杂、体积较大 | ⭐⭐⭐ |
| react-beautiful-dnd | 简单易用 | 已停止维护、不支持严格模式 | ⭐⭐ |

**推荐：dnd-kit**
- 现代化设计，与 React 18 兼容性好
- TypeScript 支持完善
- 性能优秀，支持虚拟滚动
- 活跃维护中

### 2.2 其他技术栈
- **状态管理**：Jotai（与现有 playground 保持一致）
- **UI 库**：@humansignal/ui + Tailwind CSS
- **XML 解析/生成**：使用现有的 XML 解析逻辑，新增 XML 序列化功能
- **表单组件**：Ant Design Form（用于属性编辑面板）

## 三、架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    VisualEditorApp                        │
├──────────────┬──────────────┬──────────────┬─────────────┤
│              │              │              │             │
│ Component    │   Canvas     │  Properties  │   Preview   │
│  Palette     │   Area       │    Panel     │   Panel     │
│  (左侧)      │   (中间)     │   (右侧)     │  (底部/右侧)│
│              │              │              │             │
│ - Object     │ - 拖拽放置   │ - 属性编辑   │ - XML 预览  │
│ - Control    │ - 组件树     │ - 表单验证   │ - 实时预览   │
│ - Visual     │ - 层级管理   │ - 依赖关系   │ - 导出功能   │
│              │              │              │             │
└──────────────┴──────────────┴──────────────┴─────────────┘
```

### 3.2 数据模型设计

#### 3.2.1 组件树结构（JSON Schema）

```typescript
interface ComponentNode {
  id: string;                    // 唯一标识
  type: string;                   // 标签类型：Image, RectangleLabels, View 等
  category: 'object' | 'control' | 'visual'; // 组件分类
  name?: string;                  // name 属性
  attributes: Record<string, any>; // 所有属性
  children: ComponentNode[];      // 子组件
  parentId?: string;              // 父组件 ID
  order: number;                  // 排序
}

interface EditorState {
  rootNode: ComponentNode;        // 根节点（通常是 View）
  selectedNodeId?: string;         // 当前选中的节点
  hoveredNodeId?: string;          // 悬停的节点
  clipboard?: ComponentNode;      // 剪贴板
  history: EditorState[];        // 撤销/重做历史
  currentHistoryIndex: number;
}
```

#### 3.2.2 组件元数据定义

```typescript
interface ComponentMeta {
  type: string;                   // 标签名
  category: 'object' | 'control' | 'visual';
  displayName: string;            // 显示名称
  icon: React.ComponentType;      // 图标组件
  description: string;            // 描述
  attributes: AttributeMeta[];   // 属性定义
  allowedChildren?: string[];     // 允许的子组件类型
  requiredAttributes?: string[];  // 必需属性
  validationRules?: ValidationRule[]; // 验证规则
}

interface AttributeMeta {
  name: string;                   // 属性名
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  label: string;                  // 显示标签
  defaultValue?: any;             // 默认值
  options?: { label: string; value: any }[]; // 选项（用于 select）
  required?: boolean;              // 是否必需
  description?: string;            // 描述
  dependsOn?: string;              // 依赖的其他属性
}
```

### 3.3 核心功能模块

#### 3.3.1 组件面板（Component Palette）

**功能**：
- 展示所有可用的 Object、Control、Visual 标签
- 支持搜索和分类筛选
- 拖拽到画布区域

**实现**：
```typescript
// src/components/VisualEditor/ComponentPalette.tsx
import { useDraggable } from '@dnd-kit/core';

const ComponentPalette = () => {
  const components = useMemo(() => {
    // 从 Registry 或静态定义中获取所有组件元数据
    return getAllComponentMetas();
  }, []);

  return (
    <div className="component-palette">
      {components.map(meta => (
        <DraggableComponent key={meta.type} meta={meta} />
      ))}
    </div>
  );
};
```

#### 3.3.2 画布区域（Canvas Area）

**功能**：
- 接收拖拽的组件
- 显示组件树结构
- 支持组件选择、删除、复制、移动
- 支持嵌套和层级管理

**实现**：
```typescript
// src/components/VisualEditor/CanvasArea.tsx
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const CanvasArea = () => {
  const { rootNode, setRootNode } = useAtom(editorStateAtom);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // 处理拖拽结束逻辑
    // 1. 从组件面板拖到画布：创建新组件
    // 2. 画布内拖拽：移动组件位置
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ComponentTree node={rootNode} />
    </DndContext>
  );
};
```

#### 3.3.3 属性面板（Properties Panel）

**功能**：
- 显示选中组件的所有属性
- 支持属性编辑（文本、数字、布尔、选择等）
- 实时验证和错误提示
- 处理属性依赖关系（如 toName 需要引用已存在的 Object）

**实现**：
```typescript
// src/components/VisualEditor/PropertiesPanel.tsx
import { Form, Input, Select, Switch, ColorPicker } from 'antd';

const PropertiesPanel = () => {
  const [selectedNode] = useAtom(selectedNodeAtom);
  const [form] = Form.useForm();
  
  const componentMeta = getComponentMeta(selectedNode?.type);
  
  return (
    <Form form={form} onValuesChange={handleAttributeChange}>
      {componentMeta.attributes.map(attr => (
        <Form.Item
          key={attr.name}
          name={attr.name}
          label={attr.label}
          rules={getValidationRules(attr)}
        >
          {renderAttributeInput(attr)}
        </Form.Item>
      ))}
    </Form>
  );
};
```

#### 3.3.4 预览面板（Preview Panel）

**功能**：
- 实时显示生成的 XML
- 集成现有的 PreviewPanel 组件
- 支持导出 XML 配置

**实现**：
```typescript
// src/components/VisualEditor/PreviewPanel.tsx
import { PreviewPanel } from '../PreviewPanel';

const VisualPreviewPanel = () => {
  const [rootNode] = useAtom(editorStateAtom);
  const xmlConfig = useMemo(() => {
    return generateXMLFromNode(rootNode);
  }, [rootNode]);

  return (
    <div className="preview-panel">
      <CodeEditor value={xmlConfig} readOnly />
      <PreviewPanel config={xmlConfig} />
    </div>
  );
};
```

### 3.4 XML 转换逻辑

#### 3.4.1 JSON → XML

```typescript
// src/utils/xmlConverter.ts
export function generateXMLFromNode(node: ComponentNode): string {
  const attributes = Object.entries(node.attributes)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : '';
      }
      return `${key}="${escapeXML(String(value))}"`;
    })
    .filter(Boolean)
    .join(' ');

  const openTag = attributes 
    ? `<${node.type} ${attributes}>` 
    : `<${node.type}>`;
  
  const closeTag = `</${node.type}>`;
  
  if (node.children.length === 0) {
    return `${openTag}${closeTag}`;
  }

  const childrenXML = node.children
    .sort((a, b) => a.order - b.order)
    .map(child => generateXMLFromNode(child))
    .join('\n');

  return `${openTag}\n${indent(childrenXML)}\n${closeTag}`;
}
```

#### 3.4.2 XML → JSON

```typescript
// src/utils/xmlConverter.ts
import { parseString } from 'xml2js';

export function parseXMLToNode(xmlString: string): ComponentNode {
  return new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) reject(err);
      resolve(convertXMLObjectToNode(result));
    });
  });
}

function convertXMLObjectToNode(xmlObj: any, parentId?: string): ComponentNode {
  // 递归转换 XML 对象为 ComponentNode
  // 处理属性、子节点等
}
```

## 四、实现步骤

### 阶段一：基础框架搭建（1-2周）

1. **安装依赖**
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   npm install antd xml2js
   ```

2. **创建基础组件结构**
   - `VisualEditorApp.tsx` - 主应用组件
   - `ComponentPalette.tsx` - 组件面板
   - `CanvasArea.tsx` - 画布区域
   - `PropertiesPanel.tsx` - 属性面板
   - `VisualPreviewPanel.tsx` - 预览面板

3. **定义数据模型和 Atom**
   - `editorStateAtom` - 编辑器状态
   - `selectedNodeAtom` - 选中节点
   - `componentMetasAtom` - 组件元数据

4. **实现 XML ↔ JSON 转换**
   - `generateXMLFromNode` - JSON 转 XML
   - `parseXMLToNode` - XML 转 JSON

### 阶段二：拖拽功能实现（2-3周）

1. **组件面板拖拽**
   - 实现从组件面板拖拽到画布
   - 创建新组件节点

2. **画布内拖拽**
   - 支持组件位置调整
   - 支持嵌套和层级管理
   - 实现拖拽预览效果

3. **组件操作**
   - 选择、删除、复制、粘贴
   - 撤销/重做功能

### 阶段三：属性编辑功能（2周）

1. **属性面板实现**
   - 根据组件类型动态渲染属性表单
   - 支持各种属性类型（string, number, boolean, select, color）

2. **属性验证**
   - 必需属性检查
   - 属性值格式验证
   - 依赖关系处理（如 toName 引用）

3. **实时同步**
   - 属性修改实时更新到组件树
   - 实时生成 XML 并预览

### 阶段四：高级功能（2-3周）

1. **组件元数据定义**
   - 为所有 Label Studio 标签定义元数据
   - 包括属性定义、验证规则、依赖关系

2. **模板和示例**
   - 提供常用模板（图像标注、文本分类等）
   - 支持保存和加载模板

3. **导入/导出功能**
   - 支持从 XML 导入
   - 支持导出为 XML
   - 支持导出为 JSON（用于版本控制）

4. **优化和测试**
   - 性能优化
   - 单元测试和集成测试
   - 用户体验优化

## 五、技术细节

### 5.1 组件元数据定义示例

```typescript
// src/data/componentMetas.ts
export const componentMetas: ComponentMeta[] = [
  {
    type: 'Image',
    category: 'object',
    displayName: '图像',
    icon: ImageIcon,
    description: '用于显示图像数据',
    attributes: [
      {
        name: 'name',
        type: 'string',
        label: '名称',
        required: true,
        description: '图像对象的唯一标识'
      },
      {
        name: 'value',
        type: 'string',
        label: '数据源',
        required: true,
        description: '图像数据路径，如 $image'
      },
      {
        name: 'zoom',
        type: 'boolean',
        label: '允许缩放',
        defaultValue: false
      }
    ],
    allowedChildren: []
  },
  {
    type: 'RectangleLabels',
    category: 'control',
    displayName: '矩形标签',
    icon: RectangleIcon,
    description: '用于在图像上标注矩形区域',
    attributes: [
      {
        name: 'name',
        type: 'string',
        label: '名称',
        required: true
      },
      {
        name: 'toName',
        type: 'select',
        label: '关联对象',
        required: true,
        description: '选择要标注的图像对象',
        // 动态选项：从画布中已有的 Object 类型组件获取
        getOptions: (editorState) => {
          return getObjectComponents(editorState.rootNode)
            .map(obj => ({ label: obj.name, value: obj.name }));
        }
      },
      {
        name: 'choice',
        type: 'select',
        label: '选择模式',
        defaultValue: 'single',
        options: [
          { label: '单选', value: 'single' },
          { label: '多选', value: 'multiple' }
        ]
      }
    ],
    allowedChildren: ['Label'],
    requiredAttributes: ['name', 'toName']
  },
  // ... 更多组件定义
];
```

### 5.2 拖拽处理逻辑

```typescript
// src/hooks/useDragAndDrop.ts
import { useDroppable, useDraggable } from '@dnd-kit/core';

export function useComponentDrag(componentMeta: ComponentMeta) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `palette-${componentMeta.type}`,
    data: {
      type: 'palette-item',
      componentMeta
    }
  });

  return {
    ref: setNodeRef,
    listeners,
    attributes,
    style: transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined
  };
}

export function useCanvasDrop(nodeId: string) {
  const { setNodeRef, isOver } = useDroppable({
    id: `canvas-${nodeId}`,
    data: {
      type: 'canvas-node',
      nodeId
    }
  });

  return {
    ref: setNodeRef,
    isOver
  };
}
```

### 5.3 属性编辑联动

```typescript
// src/hooks/useAttributeEditor.ts
export function useAttributeEditor(nodeId: string) {
  const [editorState, setEditorState] = useAtom(editorStateAtom);
  const node = findNodeById(editorState.rootNode, nodeId);
  const componentMeta = getComponentMeta(node.type);

  const handleAttributeChange = (changedValues: Record<string, any>) => {
    setEditorState(prev => {
      const newNode = {
        ...node,
        attributes: {
          ...node.attributes,
          ...changedValues
        }
      };
      return updateNodeInTree(prev, nodeId, newNode);
    });
  };

  // 处理依赖关系（如 toName 需要引用已存在的 Object）
  const validateDependencies = (attrName: string, value: any) => {
    if (attrName === 'toName' && componentMeta.type.includes('Labels')) {
      const objectNodes = getObjectComponents(editorState.rootNode);
      if (!objectNodes.some(obj => obj.name === value)) {
        return '引用的对象不存在';
      }
    }
    return null;
  };

  return {
    node,
    componentMeta,
    handleAttributeChange,
    validateDependencies
  };
}
```

## 六、文件结构

```
web/apps/playground/src/
├── components/
│   ├── VisualEditor/
│   │   ├── VisualEditorApp.tsx          # 主应用
│   │   ├── ComponentPalette/
│   │   │   ├── ComponentPalette.tsx
│   │   │   ├── ComponentCard.tsx
│   │   │   └── index.ts
│   │   ├── CanvasArea/
│   │   │   ├── CanvasArea.tsx
│   │   │   ├── ComponentTree.tsx
│   │   │   ├── ComponentNode.tsx
│   │   │   └── index.ts
│   │   ├── PropertiesPanel/
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── AttributeEditor.tsx
│   │   │   └── index.ts
│   │   ├── VisualPreviewPanel/
│   │   │   ├── VisualPreviewPanel.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── ... (现有组件)
├── hooks/
│   ├── useDragAndDrop.ts
│   ├── useAttributeEditor.ts
│   ├── useComponentTree.ts
│   └── useXMLConverter.ts
├── utils/
│   ├── xmlConverter.ts              # XML ↔ JSON 转换
│   ├── componentTree.ts              # 组件树操作
│   └── validation.ts                 # 验证逻辑
├── data/
│   ├── componentMetas.ts             # 组件元数据定义
│   └── templates.ts                  # 预设模板
└── atoms/
    ├── visualEditorAtoms.ts          # 可视化编辑器相关 Atom
    └── ... (现有 atoms)
```

## 七、注意事项

### 7.1 性能优化
- 使用 `React.memo` 优化组件渲染
- 虚拟滚动处理大量组件
- 防抖处理 XML 生成和预览更新

### 7.2 用户体验
- 拖拽时的视觉反馈
- 错误提示和验证反馈
- 撤销/重做功能
- 键盘快捷键支持

### 7.3 兼容性
- 确保生成的 XML 与现有 Label Studio 兼容
- 支持导入现有 XML 配置
- 保持与现有 playground 的集成

### 7.4 扩展性
- 组件元数据易于扩展
- 支持自定义组件类型
- 插件化架构

## 八、参考资源

- [dnd-kit 官方文档](https://docs.dndkit.com/)
- [Ant Design 表单组件](https://ant.design/components/form-cn/)
- [xml2js 文档](https://github.com/Leonidas-from-XIV/node-xml2js)
- Label Studio 标签文档：`web/libs/editor/src/tags/`

## 九、时间估算

- **阶段一**：基础框架搭建 - 1-2周
- **阶段二**：拖拽功能实现 - 2-3周
- **阶段三**：属性编辑功能 - 2周
- **阶段四**：高级功能和优化 - 2-3周

**总计**：7-10周（约 2-2.5 个月）

## 十、后续优化方向

1. **AI 辅助**：根据数据自动推荐配置
2. **模板市场**：用户分享和下载模板
3. **版本管理**：配置版本控制和回滚
4. **协作功能**：多人协作编辑
5. **移动端适配**：支持移动设备编辑

