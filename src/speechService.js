import i18n from './i18n/i18n.js';

export const speechLanguageCodes = {
  Hindi: 'hi-IN', Punjabi: 'pa-IN', Marathi: 'mr-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Gujarati: 'gu-IN',
  'English (South Africa / Global)': 'en-ZA', 'English (South Africa)': 'en-ZA', English: 'en-IN', 'Portuguese (Brazil)': 'pt-BR', Russian: 'ru-RU',
  'Mandarin (China)': 'zh-CN', 'Zulu (South Africa)': 'zu-ZA',
};

const languageCodes = { English: 'en', 'English (South Africa / Global)': 'en', Hindi: 'hi', Punjabi: 'pa', Marathi: 'mr', Tamil: 'ta', Telugu: 'te', Gujarati: 'gu', 'Portuguese (Brazil)': 'pt-BR', Russian: 'ru', 'Mandarin (China)': 'zh-CN', 'English (South Africa)': 'en', 'Zulu (South Africa)': 'zu' };
const say = (language, key, values = {}) => i18n.t(`speech.${key}`, { ...values, lng: languageCodes[language] || language || 'en' });
const fill = (template, values = {}) => String(template || '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
const cropNames = field => (field.crops || (field.crop ? [field.crop] : [])).join(', ') || i18n.t('speech.yourCrop');

export function buildReadingQueue({ page, userName, date, fields = [], activeAlerts = [], notifications = [], language = 'English', diagnosis, diagnosticCrop, weather = {}, community = {} }) {
  const queue = [];
  const add = (id, key, values = {}) => { const text = say(language, key, values); if (text && text !== `speech.${key}`) queue.push({ id, text }); };
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const alerts = [...activeAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || new Date(b.timestamp) - new Date(a.timestamp));
  const moistureText = field => say(language, `moisture.${String(field.water || 'Moderate').toLowerCase()}`);
  const addAlert = alert => queue.push({ id: `alert-${alert.id}`, text: i18n.t(`alerts.${alert.messageKey}`, { ...(alert.messageValues || {}), lng: languageCodes[language] || language || 'en' }) });
  if (page === 'overview') {
    add('greeting', 'greeting', { name: userName || say(language, 'farmer'), date });
    alerts.forEach(addAlert);
    add('weather', 'weather', { temperature: weather.temperature || '28', condition: weather.condition || say(language, 'conditionPartlyCloudy') });
    add('rain', 'rain', { day: weather.rainDay || say(language, 'dayThursday'), amount: weather.rainAmount || '12' });
    add('irrigation', 'waterPlan', { plan: say(language, 'planAfterRain') });
    add('note-leaf', 'leafReminder'); add('note-water', 'waterReminder');
    fields.slice(0, 3).forEach(field => add(field.name, field.health < 70 ? 'needsAttention' : 'healthy', { fieldName: field.name, crops: cropNames(field), moisture: moistureText(field) }));
    add('farm-summary', 'summary', { count: fields.length, score: '78', saved: '18' });
    add('notifications', 'notifications', { count: notifications.length }); notifications.forEach(addAlert);
  } else if (page === 'fields') {
    add('fields-intro', 'fieldsIntro');
    fields.forEach(field => add(field.name, 'field', { fieldName: field.name, crops: cropNames(field), status: say(language, field.health < 70 ? 'attentionStatus' : 'healthyStatus'), moisture: moistureText(field) }));
  } else if (page === 'diagnostics') {
    if (diagnosis) add('diagnosis', 'diagnosisReady', { title: `${say(language, 'diagnosisTitle')}${diagnosticCrop ? ` in ${diagnosticCrop}` : ''}`, advice: diagnosis.advice || say(language, 'diagnosisAdvice') });
    else add('diagnosis-prompt', 'diagnosisPrompt', { crop: diagnosticCrop || '' });
  } else if (page === 'climate') {
    add('weather', 'weather', { temperature: weather.temperature || '28', condition: weather.condition || say(language, 'conditionPartlyCloudy') });
    add('rain', 'rain', { day: weather.rainDay || say(language, 'dayThursday'), amount: weather.rainAmount || '12' });
    add('irrigation', 'waterPlan', { plan: say(language, 'planAfterRain') }); add('water-reminder', 'waterReminder');
  } else if (page === 'network') add('network', 'networkIntro');
  else if (page === 'community') {
    const farmersById = Object.fromEntries((community.farmers || []).map(farmer => [farmer.id, farmer]));
    add('community-intro', 'communityIntro', { postCount: community.posts?.length || 0 });
    (community.posts || []).slice(0, 3).forEach(post => add(`community-post-${post.id}`, 'communityPost', { author: farmersById[post.authorId]?.name || say(language, 'farmer'), crops: (post.crops || []).join(', ') || say(language, 'crops') }));
    add('community-suggestions', 'communitySuggestions', { count: Math.min(5, community.farmers?.length || 0) }); add('community-ending', 'communityEnding');
  } else add('page', 'page', { page });
  add('ending', 'ending');
  return queue;
}

export function splitSpeechText(text) {
  return String(text).match(/[^.!?।。！？]+[.!?।。！？]?/gu)?.map(part => part.trim()).filter(Boolean) || [];
}

export function selectSpeechVoice(voices, language) {
  const locale = speechLanguageCodes[language] || 'en-IN';
  const prefix = locale.split('-')[0].toLowerCase();
  const matches = voices.filter(voice => voice.lang?.toLowerCase().startsWith(prefix));
  const voice = matches.find(item => /natural|neural|premium/i.test(item.name)) || matches.find(item => /female|woman|zira|samantha|heera|sara/i.test(item.name)) || matches[0];
  return { voice, locale, fallback: !voice };
}
