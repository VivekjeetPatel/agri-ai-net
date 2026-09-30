// The selector mirrors the locale files configured in i18n.js. Keep one entry
// per supported locale so users can always reach all translations.
export const languageCatalog = {
  'English (South Africa / Global)': { code: 'en', native: 'English' },
  Hindi: { code: 'hi', native: 'हिन्दी' },
  Punjabi: { code: 'pa', native: 'ਪੰਜਾਬੀ' },
  Marathi: { code: 'mr', native: 'मराठी' },
  Tamil: { code: 'ta', native: 'தமிழ்' },
  Telugu: { code: 'te', native: 'తెలుగు' },
  Gujarati: { code: 'gu', native: 'ગુજરાતી' },
  'Portuguese (Brazil)': { code: 'pt-BR', native: 'Português (Brasil)' },
  Russian: { code: 'ru', native: 'Русский' },
  'Mandarin (China)': { code: 'zh-CN', native: '简体中文' },
  'Zulu (South Africa)': { code: 'zu', native: 'isiZulu' },
};

export const labelToLanguageCode = Object.fromEntries(
  Object.entries(languageCatalog).map(([label, language]) => [label, language.code]),
);

export const countryLanguages = {
  India: ['Hindi', 'Punjabi', 'Marathi', 'Tamil', 'Telugu', 'Gujarati'],
  Brazil: ['Portuguese (Brazil)'],
  Russia: ['Russian'],
  China: ['Mandarin (China)'],
  'South Africa': ['English (South Africa / Global)', 'Zulu (South Africa)'],
};

const supportedLanguageLabels = Object.keys(languageCatalog);

export function getLanguagesForCountry(country) {
  const localLanguages = countryLanguages[country] || ['English (South Africa / Global)'];
  const localCodes = new Set(localLanguages.map(label => labelToLanguageCode[label]));
  const networkLanguages = supportedLanguageLabels.filter(label => !localCodes.has(labelToLanguageCode[label]));
  return { localLanguages, networkLanguages };
}

export function languageCodeToLabel(code) {
  const normalized = String(code || 'en').toLowerCase();
  return Object.entries(languageCatalog).find(([, language]) => language.code.toLowerCase() === normalized)?.[0]
    || 'English (South Africa / Global)';
}
