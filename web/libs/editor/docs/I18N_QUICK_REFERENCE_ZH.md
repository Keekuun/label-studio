# i18n 快速参考指南

## 快速开始

### 1. 在组件中使用（Hook）

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
};
```

### 2. 在非组件代码中使用

```tsx
import i18n from 'i18next';

const label = i18n.t('key');
```

### 3. 使用HTML内容

```tsx
import { Trans } from 'react-i18next';

<Trans i18nKey="key_with_html" />
```

## 文件结构

```
web/libs/editor/src/i18n/
├── index.ts                    # i18n 初始化
├── LanguageSwitcher.tsx        # 语言选择器组件
├── react-i18next.d.ts          # TypeScript 类型
└── locales/
    ├── en/
    │   └── translations.ts     # 英文翻译
    └── zh/
        └── translations.ts     # 中文翻译
```

## 添加新翻译

### 步骤 1: 添加到翻译文件

**英文 (`locales/en/translations.ts`):**
```typescript
const EN_TRANSLATIONS = {
  my_new_key: "My New Text",
  // ... 其他键
};
```

**中文 (`locales/zh/translations.ts`):**
```typescript
const ZH_TRANSLATIONS = {
  my_new_key: "我的新文本",
  // ... 其他键
};
```

### 步骤 2: 在组件中使用

```tsx
const { t } = useTranslation();
<div>{t('my_new_key')}</div>
```

## 常见模式

### 带变量（插值）

**翻译:**
```typescript
{
  welcome: "欢迎, {name}!"
}
```

**用法:**
```tsx
t('welcome', { name: 'John' })
// 输出: "欢迎, John!"
```

### 条件文本

```tsx
const message = isActive 
  ? i18n.t('active_message') 
  : i18n.t('inactive_message');
```

### 在模态框/确认框中使用

```tsx
confirm({
  title: i18n.t('confirm_title'),
  content: i18n.t('confirm_message'),
  okText: i18n.t('ok'),
  cancelText: i18n.t('cancel'),
});
```

### 在工具提示中使用

```tsx
<Tooltip title={i18n.t('tooltip_text')}>
  <Button />
</Tooltip>
```

## 最佳实践

### ✅ 应该这样做

```tsx
// 使用语义化的键名
t('delete_annotation')

// 按功能组织
const SETTINGS = {
  enable_hotkeys: "启用快捷键",
  show_labels: "显示标签"
};

// 对动态内容使用变量
t('time_ago', { time: '5分钟前' })

// 对HTML内容使用Trans组件
<Trans i18nKey="message_with_html" />
```

### ❌ 不要这样做

```tsx
// 不要使用无意义的键名
t('text1')

// 不要硬编码文本
<button>Delete</button>

// 不要忘记处理两种语言
// 始终在en和zh文件中添加翻译

// 不要在HTML内容中使用t()
t('message_with_html')  // HTML标签会被转义
```

## 翻译键命名约定

### 模式: `功能_动作_上下文`

```typescript
{
  // 功能: annotation, 动作: delete, 上下文: title
  annotation_delete_title: "删除标注",
  
  // 功能: annotation, 动作: delete, 上下文: desc
  annotation_delete_desc: "您确定吗？",
  
  // 功能: region, 动作: show, 上下文: all
  region_show_all: "显示所有区域",
}
```

### 常见前缀

- `enable_*` - 设置/开关
- `show_*` - 显示选项
- `*_title` - 对话框/模态框标题
- `*_desc` - 描述
- `*_info` - 信息消息
- `*_error` - 错误消息

## 添加新语言

### 1. 创建翻译文件

```bash
mkdir -p web/libs/editor/src/i18n/locales/fr
touch web/libs/editor/src/i18n/locales/fr/translations.ts
```

### 2. 添加翻译

```typescript
// locales/fr/translations.ts
const FR_TRANSLATIONS = {
  settings: "Paramètres",
  delete: "Supprimer",
  // ... 从EN复制所有键
};

export default FR_TRANSLATIONS;
```

### 3. 更新配置

```typescript
// i18n/index.ts
import FR from './locales/fr/translations';

i18n.init({
  supportedLngs: ['en', 'zh', 'fr'],
  resources: {
    en: { translation: EN },
    zh: { translation: ZH },
    fr: { translation: FR },
  },
});
```

### 4. 更新语言切换器

```typescript
// LanguageSwitcher.tsx
const languages = [
  { code: 'en', lang: 'English' },
  { code: 'zh', lang: '简体中文' },
  { code: 'fr', lang: 'Français' },
];
```

## 故障排除

### 问题: 显示翻译键而不是文本

**检查:**
1. 键是否存在于翻译文件中
2. 当前语言是否与文件匹配
3. 键名是否有拼写错误

**调试:**
```typescript
console.log(i18n.t('your_key'));
console.log(i18n.language);
```

### 问题: 语言切换不更新UI

**解决方案:** 使用 `useTranslation()` hook 而不是直接使用 `i18n.t()`

```tsx
// ❌ 不会更新
const Component = () => {
  const label = i18n.t('label');
  return <div>{label}</div>;
};

// ✅ 会更新
const Component = () => {
  const { t } = useTranslation();
  return <div>{t('label')}</div>;
};
```

### 问题: HTML标签显示为文本

**解决方案:** 使用 `<Trans>` 组件

```tsx
// ❌ HTML被转义
<div>{t('message_with_html')}</div>

// ✅ HTML被渲染
<div><Trans i18nKey="message_with_html" /></div>
```

## 翻译检查清单

在提交翻译更改之前:

- [ ] 所有键都存在于 `en` 和 `zh` 翻译文件中
- [ ] 键名具有语义且描述性强
- [ ] 变量（如 `{name}`）在各种语言中保持一致
- [ ] HTML标签在各种语言中保持一致
- [ ] 组件中没有硬编码的文本字符串
- [ ] 测试了语言切换
- [ ] 翻译准确且自然
- [ ] 长度不会破坏UI布局

## 常见翻译键参考

### 操作
```typescript
delete, cancel, submit, update, save, reset, 
undo, redo, skip, edit, add, create, copy
```

### 状态
```typescript
draft, submitted, saved, skipped, accepted, 
rejected, updated, created, started
```

### UI元素
```typescript
settings, general, hotkeys, layout, regions, 
labels, comments, annotations, relations
```

### 消息
```typescript
pls_confirm_del, no_changes_made, are_sure,
yes, no, confirm, proceed, cancel_edit
```

### 时间/用户
```typescript
time_ago, by_name, created, started, updated
```

## API快速参考

### useTranslation Hook

```typescript
const { t, i18n } = useTranslation();

t(key: string, options?: object): string
i18n.language: string
i18n.changeLanguage(lng: string): Promise
```

### Trans 组件

```tsx
<Trans 
  i18nKey="translation_key"
  values={{ variable: value }}
  components={{ bold: <strong /> }}
/>
```

### 直接访问 i18n

```typescript
i18n.t(key: string, options?: object): string
i18n.changeLanguage(lng: string): Promise
i18n.language: string
i18n.languages: string[]
```

## 配置概览

```typescript
// i18n/index.ts
i18n.init({
  supportedLngs: ['en', 'zh'],      // 支持的语言
  fallbackLng: 'en',                // 默认语言
  defaultNS: 'translation',         // 默认命名空间
  
  detection: {
    order: [                        // 检测顺序
      'queryString',                // ?lng=en
      'cookie',                     // Cookie
      'localStorage',               // localStorage
      'navigator',                  // 浏览器设置
      'htmlTag'                     // <html lang="">
    ],
    caches: ['cookie'],             // 缓存位置
  },
  
  react: {
    useSuspense: true,              // 使用React Suspense
  },
  
  interpolation: {
    escapeValue: false,             // React处理XSS
  },
});
```

## 按用例分类的示例

### 按钮标签

```tsx
<Button>{t('delete')}</Button>
<Button>{t('submit')}</Button>
<Button>{t('cancel')}</Button>
```

### 表单标签

```tsx
<label>{t('start')}</label>
<label>{t('end')}</label>
<label>{t('duration')}</label>
```

### 工具提示

```tsx
<Tooltip title={t('delete_annotation')}>
  <IconButton />
</Tooltip>
```

### 模态对话框

```tsx
Modal.confirm({
  title: i18n.t('confirm_title'),
  content: i18n.t('confirm_message'),
  okText: i18n.t('ok'),
  cancelText: i18n.t('cancel'),
});
```

### 错误消息

```tsx
{error && <div className="error">{t('error_message')}</div>}
```

### 动态列表

```tsx
const items = [
  { key: 'option1', label: t('option1') },
  { key: 'option2', label: t('option2') },
];
```

### 带变量

```tsx
// 简单变量
t('welcome', { name: username })

// 多个变量
t('region_selected', { num: count })

// 时间格式化
t('time_ago', { time: formatTime(date) })
```

## 资源

- **完整文档:** [I18N_IMPLEMENTATION_GUIDE.md](./I18N_IMPLEMENTATION_GUIDE.md)
- **i18next 文档:** https://www.i18next.com/
- **react-i18next 文档:** https://react.i18next.com/
- **源代码:** `web/libs/editor/src/i18n/`

---

**有关详细信息、示例和最佳实践，请参阅[完整的i18n指南](./I18N_IMPLEMENTATION_GUIDE.md)。**