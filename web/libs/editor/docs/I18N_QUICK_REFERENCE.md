# i18n Quick Reference Guide

## Quick Start

### 1. Using in Components (Hook)

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
};
```

### 2. Using in Non-Component Code

```tsx
import i18n from 'i18next';

const label = i18n.t('key');
```

### 3. Using with HTML Content

```tsx
import { Trans } from 'react-i18next';

<Trans i18nKey="key_with_html" />
```

## File Structure

```
web/libs/editor/src/i18n/
├── index.ts                    # i18n initialization
├── LanguageSwitcher.tsx        # Language selector component
├── react-i18next.d.ts          # TypeScript types
└── locales/
    ├── en/
    │   └── translations.ts     # English translations
    └── zh/
        └── translations.ts     # Chinese translations
```

## Adding New Translations

### Step 1: Add to Translation Files

**English (`locales/en/translations.ts`):**
```typescript
const EN_TRANSLATIONS = {
  my_new_key: "My New Text",
  // ... other keys
};
```

**Chinese (`locales/zh/translations.ts`):**
```typescript
const ZH_TRANSLATIONS = {
  my_new_key: "我的新文本",
  // ... other keys
};
```

### Step 2: Use in Components

```tsx
const { t } = useTranslation();
<div>{t('my_new_key')}</div>
```

## Common Patterns

### With Variables (Interpolation)

**Translation:**
```typescript
{
  welcome: "Welcome, {name}!"
}
```

**Usage:**
```tsx
t('welcome', { name: 'John' })
// Output: "Welcome, John!"
```

### Conditional Text

```tsx
const message = isActive 
  ? i18n.t('active_message') 
  : i18n.t('inactive_message');
```

### In Modal/Confirm

```tsx
confirm({
  title: i18n.t('confirm_title'),
  content: i18n.t('confirm_message'),
  okText: i18n.t('ok'),
  cancelText: i18n.t('cancel'),
});
```

### In Tooltips

```tsx
<Tooltip title={i18n.t('tooltip_text')}>
  <Button />
</Tooltip>
```

## Best Practices

### ✅ DO

```tsx
// Use semantic key names
t('delete_annotation')

// Organize by feature
const SETTINGS = {
  enable_hotkeys: "Enable Hotkeys",
  show_labels: "Show Labels"
};

// Use variables for dynamic content
t('time_ago', { time: '5 minutes' })

// Use Trans for HTML content
<Trans i18nKey="message_with_html" />
```

### ❌ DON'T

```tsx
// Don't use meaningless keys
t('text1')

// Don't hard-code text
<button>Delete</button>

// Don't forget to handle both languages
// Always add translations to both en and zh files

// Don't use t() for HTML content
t('message_with_html')  // HTML tags will be escaped
```

## Translation Key Naming Conventions

### Pattern: `feature_action_context`

```typescript
{
  // Feature: annotation, action: delete, context: title
  annotation_delete_title: "Delete Annotation",
  
  // Feature: annotation, action: delete, context: description
  annotation_delete_desc: "Are you sure?",
  
  // Feature: region, action: show, context: all
  region_show_all: "Show All Regions",
}
```

### Common Prefixes

- `enable_*` - Settings/toggles
- `show_*` - Display options
- `*_title` - Dialog/modal titles
- `*_desc` - Descriptions
- `*_info` - Information messages
- `*_error` - Error messages

## Adding a New Language

### 1. Create Translation File

```bash
mkdir -p web/libs/editor/src/i18n/locales/fr
touch web/libs/editor/src/i18n/locales/fr/translations.ts
```

### 2. Add Translations

```typescript
// locales/fr/translations.ts
const FR_TRANSLATIONS = {
  settings: "Paramètres",
  delete: "Supprimer",
  // ... copy all keys from EN
};

export default FR_TRANSLATIONS;
```

### 3. Update Configuration

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

### 4. Update Language Switcher

```typescript
// LanguageSwitcher.tsx
const languages = [
  { code: 'en', lang: 'English' },
  { code: 'zh', lang: '简体中文' },
  { code: 'fr', lang: 'Français' },
];
```

## Troubleshooting

### Issue: Translation key shows instead of text

**Check:**
1. Key exists in translation file
2. Current language matches file
3. No typos in key name

**Debug:**
```typescript
console.log(i18n.t('your_key'));
console.log(i18n.language);
```

### Issue: Language switch doesn't update UI

**Solution:** Use `useTranslation()` hook instead of direct `i18n.t()`

```tsx
// ❌ Won't update
const Component = () => {
  const label = i18n.t('label');
  return <div>{label}</div>;
};

// ✅ Will update
const Component = () => {
  const { t } = useTranslation();
  return <div>{t('label')}</div>;
};
```

### Issue: HTML tags display as text

**Solution:** Use `<Trans>` component

```tsx
// ❌ HTML escaped
<div>{t('message_with_html')}</div>

// ✅ HTML rendered
<div><Trans i18nKey="message_with_html" /></div>
```

## Translation Checklist

Before committing translation changes:

- [ ] All keys exist in both `en` and `zh` translation files
- [ ] Key names are semantic and descriptive
- [ ] Variables (like `{name}`) are consistent across languages
- [ ] HTML tags are consistent across languages
- [ ] No hard-coded text strings in components
- [ ] Tested language switching
- [ ] Translation is accurate and natural
- [ ] Length doesn't break UI layout

## Common Translation Keys Reference

### Actions
```typescript
delete, cancel, submit, update, save, reset, 
undo, redo, skip, edit, add, create, copy
```

### Status
```typescript
draft, submitted, saved, skipped, accepted, 
rejected, updated, created, started
```

### UI Elements
```typescript
settings, general, hotkeys, layout, regions, 
labels, comments, annotations, relations
```

### Messages
```typescript
pls_confirm_del, no_changes_made, are_sure,
yes, no, confirm, proceed, cancel_edit
```

### Time/User
```typescript
time_ago, by_name, created, started, updated
```

## API Quick Reference

### useTranslation Hook

```typescript
const { t, i18n } = useTranslation();

t(key: string, options?: object): string
i18n.language: string
i18n.changeLanguage(lng: string): Promise
```

### Trans Component

```tsx
<Trans 
  i18nKey="translation_key"
  values={{ variable: value }}
  components={{ bold: <strong /> }}
/>
```

### Direct i18n Access

```typescript
i18n.t(key: string, options?: object): string
i18n.changeLanguage(lng: string): Promise
i18n.language: string
i18n.languages: string[]
```

## Configuration Overview

```typescript
// i18n/index.ts
i18n.init({
  supportedLngs: ['en', 'zh'],      // Supported languages
  fallbackLng: 'en',                // Default language
  defaultNS: 'translation',         // Default namespace
  
  detection: {
    order: [                        // Detection order
      'queryString',                // ?lng=en
      'cookie',                     // Cookie
      'localStorage',               // localStorage
      'navigator',                  // Browser setting
      'htmlTag'                     // <html lang="">
    ],
    caches: ['cookie'],             // Cache location
  },
  
  react: {
    useSuspense: true,              // Use React Suspense
  },
  
  interpolation: {
    escapeValue: false,             // React handles XSS
  },
});
```

## Examples by Use Case

### Button Labels

```tsx
<Button>{t('delete')}</Button>
<Button>{t('submit')}</Button>
<Button>{t('cancel')}</Button>
```

### Form Labels

```tsx
<label>{t('start')}</label>
<label>{t('end')}</label>
<label>{t('duration')}</label>
```

### Tooltips

```tsx
<Tooltip title={t('delete_annotation')}>
  <IconButton />
</Tooltip>
```

### Modal Dialogs

```tsx
Modal.confirm({
  title: i18n.t('confirm_title'),
  content: i18n.t('confirm_message'),
  okText: i18n.t('ok'),
  cancelText: i18n.t('cancel'),
});
```

### Error Messages

```tsx
{error && <div className="error">{t('error_message')}</div>}
```

### Dynamic Lists

```tsx
const items = [
  { key: 'option1', label: t('option1') },
  { key: 'option2', label: t('option2') },
];
```

### With Variables

```tsx
// Simple variable
t('welcome', { name: username })

// Multiple variables
t('region_selected', { num: count })

// Time formatting
t('time_ago', { time: formatTime(date) })
```

## Resources

- **Full Documentation:** [I18N_IMPLEMENTATION_GUIDE.md](./I18N_IMPLEMENTATION_GUIDE.md)
- **i18next Docs:** https://www.i18next.com/
- **react-i18next Docs:** https://react.i18next.com/
- **Source Code:** `web/libs/editor/src/i18n/`

---

**For detailed information, examples, and best practices, see the [complete i18n guide](./I18N_IMPLEMENTATION_GUIDE.md).**
