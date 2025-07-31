// src/react-i18next.d.ts
import 'react-i18next';
// 导入你的默认命名空间（通常是 translation）的 JSON 文件类型
import translation from './locales/en/translations.ts';

// 声明模块来扩展 react-i18next 的类型
declare module 'react-i18next' {
  // 扩展 CustomTypeOptions 接口
  interface CustomTypeOptions {
    // 定义默认命名空间
    defaultNS: 'translation';
    // 定义资源类型，让 ts 知道我们的翻译键
    resources: {
      translation: typeof translation;
    };
  }
}
