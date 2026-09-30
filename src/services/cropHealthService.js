const API_BASE = '/api/crop-health';
const supportedLanguages = new Set(['en', 'de', 'cs', 'es', 'fr', 'it', 'nl', 'pl', 'sv', 'zh', 'da', 'tr', 'hi', 'ar', 'pt', 'ko']);
const sessionCache = new Map();

export function getCropHealthLanguage(language) {
  const names = { Hindi: 'hi', 'Portuguese (Brazil)': 'pt', 'Mandarin (China)': 'zh' };
  const code = names[language] || String(language || 'en').split('-')[0].toLowerCase();
  return supportedLanguages.has(code) ? code : 'en';
}

async function imageToBase64(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { dataUrl };
}

async function hashData(dataUrl) {
  const bytes = new TextEncoder().encode(dataUrl);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function text(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return value.text || value.value || '';
  return '';
}

function list(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => typeof item === 'string' ? item : item?.text || item?.name || '').filter(Boolean);
}

function normalizeSuggestion(suggestion) {
  const commonNames = suggestion?.details?.common_names;
  return {
    name: suggestion?.name || '',
    scientificName: suggestion?.scientific_name || '',
    commonName: Array.isArray(commonNames) ? commonNames[0] || '' : '',
    probability: Number(suggestion?.probability) || 0,
    description: text(suggestion?.details?.description),
    treatment: suggestion?.details?.treatment || null,
    severity: suggestion?.details?.severity || null,
    detailsLanguage: suggestion?.details?.language || '',
  };
}

export function normalizeCropHealthResponse(payload) {
  const result = payload?.result || {};
  const crops = (result.crop?.suggestions || []).map(normalizeSuggestion);
  const diseases = (result.disease?.suggestions || []).map(normalizeSuggestion);
  const top = diseases[0];
  const crop = crops[0]?.name || '';
  const healthy = Boolean(top && /healthy|no disease|no pest/i.test(top.name));
  const treatment = top?.treatment || {};
  return {
    crop,
    disease: top ? { name: top.name, commonName: top.commonName, scientificName: top.scientificName, detailsLanguage: top.detailsLanguage } : null,
    confidence: top?.probability || 0,
    description: top?.description || '',
    treatment: list(treatment.biological).concat(list(treatment.chemical)),
    prevention: list(treatment.prevention),
    spray: list(treatment.chemical),
    alternatives: diseases.slice(1, 4).map(({ name, probability }) => ({ name, probability })),
    healthy,
    severity: top?.severity || null,
    rawFields: Object.keys(payload || {}),
  };
}

function apiError(status) {
  const code = status === 400 ? 'diagnostics.errors.badImage'
    : status === 401 || status === 403 ? 'diagnostics.errors.unauthorized'
      : status === 404 ? 'diagnostics.errors.notFound'
        : status === 402 || status === 429 ? 'diagnostics.errors.rateLimit'
          : status >= 500 ? 'diagnostics.errors.service'
            : 'diagnostics.errors.unexpected';
  const error = new Error(code);
  error.code = code;
  error.status = status;
  return error;
}

export async function analyzeImage(file, { language = 'English' } = {}) {
  const { dataUrl } = await imageToBase64(file);
  const hash = await hashData(dataUrl);
  if (sessionCache.has(hash)) return { ...sessionCache.get(hash), cached: true };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  try {
    const apiLanguage = getCropHealthLanguage(language);
    const params = new URLSearchParams({ details: 'description,treatment,severity,common_names', language: apiLanguage });
    const requestUrl = `${API_BASE}/identification?${params}`;
    const requestBody = JSON.stringify({ images: [dataUrl], similar_images: true });
    if (import.meta.env.DEV) console.debug('[crop.health] request', { method: 'POST', url: requestUrl });
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
      signal: controller.signal,
    });
    const responseText = await response.text();
    let payload;
    try { payload = responseText ? JSON.parse(responseText) : null; }
    catch { payload = responseText; }
    if (import.meta.env.DEV) console.debug('[crop.health] response', { status: response.status, body: payload });
    if (import.meta.env.DEV && response.status === 401) console.warn('[crop.health] 401 Unauthorized: verify CROP_HEALTH_API_KEY in .env.local and restart Vite. The browser does not send this key.');
    if (!response.ok) throw apiError(response.status);
    if (!payload || typeof payload !== 'object') { const error = new Error('diagnostics.errors.unreadable'); error.code = 'diagnostics.errors.unreadable'; throw error; }
    const normalized = normalizeCropHealthResponse(payload);
    normalized.apiLanguage = apiLanguage;
    const returnedLanguage = normalized.disease?.detailsLanguage;
    normalized.languageFallback = Boolean(returnedLanguage && returnedLanguage.toLowerCase() !== apiLanguage);
    normalized.cached = false;
    sessionCache.set(hash, normalized);
    try {
      const count = Number(window.localStorage.getItem('fieldwise-crop-health-analysis-count') || 0);
      window.localStorage.setItem('fieldwise-crop-health-analysis-count', String(count + 1));
      normalized.analysesUsed = count + 1;
    } catch { normalized.analysesUsed = null; }
    return normalized;
  } catch (error) {
    if (error.name === 'AbortError') { const translatedError = new Error('diagnostics.errors.timeout'); translatedError.code = 'diagnostics.errors.timeout'; throw translatedError; }
    if (error instanceof TypeError) { const translatedError = new Error('diagnostics.errors.connection'); translatedError.code = 'diagnostics.errors.connection'; throw translatedError; }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
