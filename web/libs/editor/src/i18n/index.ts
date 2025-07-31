import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ZH from './locales/zh/translations'
import EN from './locales/en/translations'

i18n
  // 注入 language-detector 插件，自动检测语言
  .use(LanguageDetector)
  // 注入 initReactI18next 实例，将 i18n 实例传递给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    // 支持的语言列表
    supportedLngs: ['en', 'zh'],

    // 默认语言
    fallbackLng: 'en',

    // 指定默认语言，直接覆盖detection
    // lng: 'zh',

    // 默认的命名空间（通常一个应用有一个 'translation' 就够了）
    ns: 'translation',
    defaultNS: 'translation',

    // 配置 language-detector
    detection: {
      // 检测顺序
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      // 缓存用户选择的语言到哪里
      caches: ['cookie'],
    },

    resources: {
      zh: {
        translation: ZH
      },
      en: {
        translation: EN
      },
    },

    // react-i18next 的特定配置
    react: {
      // 由于翻译文件是懒加载的，需要 Suspense
      useSuspense: true,
    },

    // 关闭插值转义，因为 React 默认已经防御了 XSS
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
