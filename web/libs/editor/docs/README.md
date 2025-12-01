# Label Studio Frontend

Label Studio Frontend (LSF) is a crucial module of the Label Studio ecosystem, pivotal in driving the entire annotation flow. It's a front-end-only module, combining a user interface for annotation creation with a data layer that standardizes the annotation format. Every manual annotation in Label Studio has been crafted using LSF, making it integral to the system.

## 目录结构

```
libs/editor/
├── src/                    # 源代码目录
│   ├── components/        # UI 组件
│   ├── tags/              # 标注标签组件
│   ├── regions/           # 区域管理
│   ├── stores/            # MobX State Tree 状态管理
│   ├── tools/             # 标注工具
│   ├── utils/             # 工具函数
│   ├── lib/               # 核心库
│   ├── standalone.js      # UMD 构建入口
│   ├── index.js           # 主入口文件
│   └── LabelStudio.tsx    # 核心 LabelStudio 类
├── public/                # 静态资源
├── tests/                 # 测试文件
└── dist/                  # 构建输出（在 web/dist/libs/editor-umd/）
```

## 开发流程

### 前置准备

1. **安装依赖**
   ```bash
   # 在项目根目录执行
   cd web
   yarn install --frozen-lockfile
   ```

2. **环境要求**
   - Node.js >= 16
   - Yarn >= 1.22

### 开发模式

#### 方式一：持续构建模式（推荐用于集成开发）

适用于在完整的 Label Studio 环境中开发和测试：

```bash
# 在 web 目录下执行
cd web
yarn lsf:watch
```

**说明**：
- 持续监听文件变化并自动重新构建
- 构建输出到 `web/dist/libs/editor`
- 需要配合 Django 后端使用（通常运行在 `http://localhost:8080`）
- 修改代码后会自动重新构建，刷新浏览器即可看到效果

#### 方式二：独立运行模式（推荐用于功能开发）

适用于独立开发和调试 editor 功能：

```bash
# 在 web 目录下执行
cd web
yarn lsf:serve
```

**说明**：
- 启动独立的开发服务器，访问 `http://localhost:3000`
- 支持热模块替换（HMR），修改代码后自动刷新
- 可以独立测试 editor 功能，无需启动完整后端
- 适合开发新的标注功能或调试 UI 组件

### 构建生产版本（UMD 格式）

用于将 editor 打包成 UMD 格式，嵌入到管理端或其他应用中：

```bash
# 在 web 目录下执行
cd web
yarn lse:build
```

**构建输出**：
- 输出目录：`web/dist/libs/editor-umd/`
- 主要文件：
  - `main.js` - 主 JavaScript 文件（包含所有代码）
  - `main.css` - 样式文件
  - `styles/` - 样式资源目录
  - 各种 SVG 图标和资源文件

**使用方式**：

在管理端 HTML 中引入：

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/main.css">
</head>
<body>
  <div id="label-studio-root"></div>
  
  <script src="path/to/main.js"></script>
  <script>
    // 使用 LabelStudio
    const ls = new window.LabelStudio('label-studio-root', {
      config: `
        <View>
          <Image name="image" value="$image"/>
          <RectangleLabels name="label" toName="image">
            <Label value="Person" background="red"/>
            <Label value="Car" background="blue"/>
          </RectangleLabels>
        </View>
      `,
      task: {
        data: {
          image: 'https://example.com/image.jpg'
        }
      }
    });
  </script>
</body>
</html>
```

### 测试

#### 单元测试

```bash
# 在 web 目录下执行
cd web
yarn lsf:unit
```

#### 集成测试

```bash
# 1. 先启动独立服务器
yarn lsf:serve

# 2. 在另一个终端运行集成测试
yarn lsf:integration

# 或使用 UI 模式（便于调试）
yarn lsf:integration:ui
```

#### 端到端测试

```bash
# 需要先启动完整的 Label Studio 环境（通常运行在 http://localhost:8080）
yarn lsf:e2e
```

## 核心文件说明

### 入口文件

- **`src/standalone.js`**: UMD 构建的入口文件，导入样式和主入口
- **`src/index.js`**: 主入口文件，导出 `LabelStudio` 类到 `window.LabelStudio`
- **`src/LabelStudio.tsx`**: 核心 `LabelStudio` 类实现，提供编辑器的主要 API

### 关键组件

- **`src/components/App/App.jsx`**: 主应用组件
- **`src/Component.jsx`**: React 组件封装
- **`src/configureStore.js`**: 配置 MobX State Tree store
- **`src/defaultOptions.js`**: 默认配置选项

### 技术栈

- **React 18.3.1** + **TypeScript** - UI 框架
- **MobX State Tree** - 状态管理
- **Konva** - 画布渲染（用于图像/视频标注）
- **Ant Design 4.3.3** - UI 组件库
- **Webpack** - 构建工具

## 常见问题

### 1. 修改代码后没有效果

**问题**：修改了 `web/libs/editor/src/` 下的代码，但看不到变化

**解决方案**：
- 确保运行了 `yarn lsf:watch` 或 `yarn lsf:serve`
- 检查构建是否有错误（查看终端输出）
- 清除浏览器缓存并硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）
- 如果使用 `pip install label-studio` 安装的版本，需要以开发模式启动（见项目根目录 README.md）

### 2. 构建 UMD 格式失败

**问题**：执行 `yarn lse:build` 时出错

**解决方案**：
- 确保在 `web` 目录下执行命令
- 检查 Node.js 和 Yarn 版本是否符合要求
- 尝试删除 `node_modules` 和 `yarn.lock`，重新安装依赖
- 检查是否有语法错误或类型错误

### 3. 样式不生效

**问题**：构建后的样式文件缺失或样式不正确

**解决方案**：
- 确保引入了 `main.css` 文件
- 检查 CSS 前缀配置（默认使用 `lsf-` 前缀）
- 查看浏览器控制台是否有资源加载错误
- 确认样式文件路径正确

### 4. 在管理端中无法使用

**问题**：在管理端引入后，`window.LabelStudio` 未定义

**解决方案**：
- 确认 `main.js` 文件已正确加载（查看网络请求）
- 检查是否有 JavaScript 错误（查看浏览器控制台）
- 确认文件加载顺序：先加载 CSS，再加载 JS
- 检查是否有其他脚本冲突

## 自定义组件开发

Editor 支持开发自定义组件来扩展功能。详细的开发指南请参考：

📖 **[自定义组件开发指南](DEVELOPING_COMPONENTS.md)**

该文档包含：
- 组件开发步骤（Model、View、注册）
- 完整示例代码（Markdown 组件）
- 常用 Mixins 说明
- 开发注意事项和最佳实践
- 测试方法和常见问题

## XML 配置渲染原理

了解 XML 配置如何转换为 React 组件的完整流程和原理：

📖 **[XML 配置到 React 组件渲染原理](XML_TO_REACT_RENDERING.md)**

该文档详细说明：
- XML 解析和配置转换过程
- MobX State Tree 模型实例化
- Registry 机制和组件查找
- React 组件渲染流程
- 数据绑定和响应式更新
- 完整示例和调试技巧

## 开发最佳实践

1. **代码修改流程**：
   - 修改 `src/` 目录下的源代码
   - 运行 `yarn lsf:watch` 或 `yarn lsf:serve` 查看效果
   - 测试通过后，运行 `yarn lse:build` 构建生产版本
   - 将构建产物复制到管理端

2. **代码规范**：
   - 使用 TypeScript 编写新代码
   - 遵循项目现有的代码风格
   - 运行 `yarn lint` 检查代码规范

3. **测试**：
   - 新功能开发时编写单元测试
   - 重要功能修改后运行集成测试
   - 发布前运行完整的测试套件

## 相关命令速查

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `yarn lsf:watch` | 持续构建 editor | 在完整环境中开发 |
| `yarn lsf:serve` | 独立运行 editor | 独立开发和调试 |
| `yarn lse:build` | 构建 UMD 格式 | 打包用于嵌入 |
| `yarn lsf:unit` | 运行单元测试 | 代码质量检查 |
| `yarn lsf:integration` | 运行集成测试 | 功能验证 |
| `yarn lsf:e2e` | 运行端到端测试 | 完整流程测试 |

## 注意事项

⚠️ **重要提示**：
- 所有命令必须在 `web` 目录或其子目录下执行
- 修改代码后需要重新构建才能看到效果（开发模式下自动构建）
- UMD 构建产物较大，建议在生产环境使用压缩版本
- 嵌入到其他应用时，注意处理样式隔离和命名空间冲突

<img src="https://github.com/HumanSignal/label-studio/blob/develop/images/opossum_looking.png?raw=true" title="Hey everyone!" height="140" width="140" />
