export const languageGlyphs = {
  en: 'A', hi: 'अ', pa: 'ੳ', mr: 'अ', ta: 'அ', te: 'అ', gu: 'અ',
  pt: 'A', ru: 'А', zh: '中', zu: 'A',
};

export const SHOW_LANG_CODE = false;

export function getLanguageGlyph(langCode) {
  const baseCode = String(langCode || '').split('-')[0].toLowerCase();
  return languageGlyphs[baseCode] || null;
}
