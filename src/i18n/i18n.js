import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

const codes = ['en', 'hi', 'pa', 'mr', 'ta', 'te', 'gu', 'pt-BR', 'ru', 'zh-CN', 'zu'];
const legacyNames = {
  English: 'en', Hindi: 'hi', Punjabi: 'pa', Marathi: 'mr', Tamil: 'ta', Telugu: 'te', Gujarati: 'gu',
  'Portuguese (Brazil)': 'pt-BR', Russian: 'ru', 'Mandarin (China)': 'zh-CN', 'English (South Africa)': 'en',
  'English (South Africa / Global)': 'en', 'Zulu (South Africa)': 'zu',
};
try {
  const stored = localStorage.getItem('fieldwise-language');
  if (stored && legacyNames[stored]) localStorage.setItem('fieldwise-language', legacyNames[stored]);
  if (!localStorage.getItem('fieldwise-language')) {
    const country = localStorage.getItem('fieldwise-country');
    const defaultLanguage = country === 'Brazil' ? 'pt-BR' : country === 'Russia' ? 'ru' : country === 'China' ? 'zh-CN' : country === 'South Africa' ? 'en' : 'pa';
    localStorage.setItem('fieldwise-language', defaultLanguage);
  }
} catch { /* The language selector still works when browser storage is disabled. */ }

const localeLoaders = {
  hi: () => import('./locales/hi.json'),
  pa: () => import('./locales/pa.json'),
  mr: () => import('./locales/mr.json'),
  ta: () => import('./locales/ta.json'),
  te: () => import('./locales/te.json'),
  gu: () => import('./locales/gu.json'),
  'pt-BR': () => import('./locales/pt.json'),
  ru: () => import('./locales/ru.json'),
  'zh-CN': () => import('./locales/zh.json'),
  zu: () => import('./locales/zu.json'),
};
i18n
  .use(LanguageDetector)
  .use(resourcesToBackend((language, _namespace) => {
    if (language === 'en') return Promise.resolve(en);
    const loader = localeLoaders[language];
    return loader ? loader() : Promise.reject(new Error(`No locale resource is configured for: ${language}`));
  }))
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    partialBundledLanguages: true,
    fallbackLng: 'en',
    supportedLngs: codes,
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage'], lookupLocalStorage: 'fieldwise-language', caches: ['localStorage'] },
    react: { useSuspense: false },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV ? (_languages, _namespace, key) => console.warn(`[i18n] Missing translation: ${key}`) : undefined,
  });

if (import.meta.env.DEV) {
  i18n.on('failedLoading', (language, namespace, message) => {
    console.error('[i18n] locale resource failed to load', { language, namespace, message });
  });
}

function applyDocumentLanguage(language) {
  if (!language) return;
  document.documentElement.lang = language;
  const fontFamily = {
    hi: 'Noto Sans Devanagari', mr: 'Noto Sans Devanagari', pa: 'Noto Sans Gurmukhi', ta: 'Noto Sans Tamil',
    te: 'Noto Sans Telugu', gu: 'Noto Sans Gujarati', zh: 'Noto Sans SC',
    ru: 'Noto Sans', pt: 'Noto Sans', en: 'Noto Sans', zu: 'Noto Sans',
  }[language.split('-')[0]];
  if (fontFamily && !document.querySelector(`link[data-fieldwise-font="${fontFamily}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily).replace(/%20/g, '+')}:wght@400;500;600;700&display=swap`;
    link.dataset.fieldwiseFont = fontFamily;
    document.head.append(link);
  }
}
i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage(i18n.resolvedLanguage || i18n.language || 'en');

export default i18n;
