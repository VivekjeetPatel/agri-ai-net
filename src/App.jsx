import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Cloud, CloudSun, Droplets, Eye, EyeOff, FileImage, Globe2, HelpCircle, Info, Leaf, LogOut, MapPin, Menu, Moon, MoreHorizontal, Pause, Play, Plus, ScanLine, Search, Settings, ShieldCheck, SkipBack, SkipForward, Sprout, Sun, Thermometer, TriangleAlert, Upload, Users, Volume2, VolumeX, Wheat, Wind, X } from 'lucide-react';
import { getRememberedUsername, getSessionUser, isAuthenticated, login, logout, setRememberedUsername, signup } from './auth.js';
import { buildReadingQueue, getSpeechStateLabel, speechLanguageCodes, speechTemplates } from './speechService.js';
import { useReadAloud } from './useReadAloud.js';
import CommunityPage from './community/CommunityPage.jsx';
import { communityData } from './community/communityService.js';

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { window.localStorage.setItem('fieldwise-theme', theme); } catch { /* Storage may be unavailable. */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1f2d26' : '#f6f7f2');
}

const initialFields = [
  { name: 'North Field', crops: ['Wheat'], area: 8.4, health: 87, status: 'Healthy', color: 'green', ndvi: '.78', water: 'Good' },
  { name: 'River Bend', crops: ['Soybean'], area: 5.2, health: 62, status: 'Needs attention', color: 'amber', ndvi: '.54', water: 'Moderate' },
  { name: 'Orchard East', crops: ['Tomato'], area: 2.1, health: 91, status: 'Healthy', color: 'green', ndvi: '.84', water: 'Good' },
];
const cropOptions = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 'Soybean', 'Tomato', 'Potato', 'Onion', 'Chickpea', 'Sunflower', 'Groundnut', 'Millet', 'Barley', 'Lentil', 'Pigeon pea', 'Sorghum', 'Tea', 'Coffee', 'Apple', 'Mango', 'Banana', 'Chili pepper', 'Cabbage', 'Cauliflower'];
const cropTranslations = {
  Hindi: { Wheat: 'गेहूँ', Rice: 'चावल', Maize: 'मक्का', Cotton: 'कपास', Sugarcane: 'गन्ना', Mustard: 'सरसों', Soybean: 'सोयाबीन', Tomato: 'टमाटर', Potato: 'आलू', Onion: 'प्याज़', Chickpea: 'चना', Sunflower: 'सूरजमुखी' },
  Punjabi: { Wheat: 'ਕਣਕ', Rice: 'ਚੌਲ', Maize: 'ਮੱਕੀ', Cotton: 'ਕਪਾਹ', Sugarcane: 'ਗੰਨਾ', Mustard: 'ਸਰ੍ਹੋਂ', Soybean: 'ਸੋਇਆਬੀਨ', Tomato: 'ਟਮਾਟਰ', Potato: 'ਆਲੂ', Onion: 'ਪਿਆਜ਼', Chickpea: 'ਛੋਲੇ', Sunflower: 'ਸੂਰਜਮੁਖੀ' },
  Marathi: { Wheat: 'गहू', Rice: 'तांदूळ', Maize: 'मका', Cotton: 'कापूस', Sugarcane: 'ऊस', Mustard: 'मोहरी', Soybean: 'सोयाबीन', Tomato: 'टोमॅटो', Potato: 'बटाटा', Onion: 'कांदा', Chickpea: 'हरभरा', Sunflower: 'सूर्यफूल' },
  Tamil: { Wheat: 'கோதுமை', Rice: 'அரிசி', Maize: 'மக்காச்சோளம்', Cotton: 'பருத்தி', Sugarcane: 'கரும்பு', Mustard: 'கடுகு', Soybean: 'சோயாபீன்', Tomato: 'தக்காளி', Potato: 'உருளைக்கிழங்கு', Onion: 'வெங்காயம்', Chickpea: 'கொண்டைக்கடலை', Sunflower: 'சூரியகாந்தி' },
  Telugu: { Wheat: 'గోధుమ', Rice: 'వరి', Maize: 'మొక్కజొన్న', Cotton: 'పత్తి', Sugarcane: 'చెరకు', Mustard: 'ఆవాలు', Soybean: 'సోయాబీన్', Tomato: 'టమాటా', Potato: 'బంగాళాదుంప', Onion: 'ఉల్లిపాయ', Chickpea: 'శనగ', Sunflower: 'పొద్దుతిరుగుడు' },
  Gujarati: { Wheat: 'ઘઉં', Rice: 'ચોખા', Maize: 'મકાઈ', Cotton: 'કપાસ', Sugarcane: 'શેરડી', Mustard: 'રાઈ', Soybean: 'સોયાબીન', Tomato: 'ટામેટાં', Potato: 'બટાકા', Onion: 'ડુંગળી', Chickpea: 'ચણા', Sunflower: 'સૂર્યમુખી' },
  'Portuguese (Brazil)': { Wheat: 'Trigo', Rice: 'Arroz', Maize: 'Milho', Cotton: 'Algodão', Sugarcane: 'Cana-de-açúcar', Mustard: 'Mostarda', Soybean: 'Soja', Tomato: 'Tomate', Potato: 'Batata', Onion: 'Cebola', Chickpea: 'Grão-de-bico', Sunflower: 'Girassol' },
  Russian: { Wheat: 'Пшеница', Rice: 'Рис', Maize: 'Кукуруза', Cotton: 'Хлопок', Sugarcane: 'Сахарный тростник', Mustard: 'Горчица', Soybean: 'Соя', Tomato: 'Томат', Potato: 'Картофель', Onion: 'Лук', Chickpea: 'Нут', Sunflower: 'Подсолнечник' },
  'Mandarin (China)': { Wheat: '小麦', Rice: '水稻', Maize: '玉米', Cotton: '棉花', Sugarcane: '甘蔗', Mustard: '芥菜', Soybean: '大豆', Tomato: '番茄', Potato: '马铃薯', Onion: '洋葱', Chickpea: '鹰嘴豆', Sunflower: '向日葵' },
  'English (South Africa)': { Wheat: 'Wheat', Rice: 'Rice', Maize: 'Maize', Cotton: 'Cotton', Sugarcane: 'Sugarcane', Mustard: 'Mustard', Soybean: 'Soybean', Tomato: 'Tomato', Potato: 'Potato', Onion: 'Onion', Chickpea: 'Chickpea', Sunflower: 'Sunflower' },
  'Zulu (South Africa)': { Wheat: 'Ukolweni', Rice: 'Ilayisi', Maize: 'Ummbila', Cotton: 'Ukotini', Sugarcane: 'Umoba', Mustard: 'Isinaphi', Soybean: 'Ubhontshisi wesoya', Tomato: 'Utamatisi', Potato: 'Izambane', Onion: 'U-anyanisi', Chickpea: 'Ubhontshisi', Sunflower: 'Ubhekilanga' },
};

function normalizeField(field) {
  const { crop: legacyCrop, ...rest } = field;
  const legacyLabel = typeof legacyCrop === 'string' ? legacyCrop.split('·')[0].trim() : '';
  const legacyArea = typeof legacyCrop === 'string' ? Number(legacyCrop.match(/·\s*([\d.]+)/)?.[1]) : NaN;
  const crops = (Array.isArray(field.crops) ? field.crops : legacyLabel ? legacyLabel.split(',') : [])
    .map(name => String(name).trim()).filter(Boolean)
    .filter((name, index, all) => all.findIndex(other => other.toLocaleLowerCase() === name.toLocaleLowerCase()) === index);
  return { ...rest, crops, area: Number(field.area) > 0 ? Number(field.area) : Number.isFinite(legacyArea) ? legacyArea : 0 };
}

function loadFields() {
  try {
    const saved = JSON.parse(window.localStorage.getItem('fieldwise-fields') || 'null');
    if (Array.isArray(saved)) return saved.map(normalizeField);
  } catch { /* Fall back to the bundled demo fields. */ }
  return initialFields.map(normalizeField);
}

function formatCropSummary(field) {
  const crops = field.crops || [];
  if (!crops.length) return 'Crop not set';
  const shown = crops.slice(0, 2).join(', ');
  return crops.length > 2 ? `${shown} +${crops.length - 2}` : shown;
}
const nav = [{ id: 'overview', icon: Activity, label: 'Overview' }, { id: 'diagnostics', icon: ScanLine, label: 'Crop diagnostics' }, { id: 'fields', icon: MapPin, label: 'My fields' }, { id: 'climate', icon: CloudSun, label: 'Climate & irrigation' }, { id: 'community', icon: Users, label: 'Community' }, { id: 'network', icon: Globe2, label: 'BRICS network' }];
const pagePaths = { overview: '/', diagnostics: '/diagnostics', fields: '/fields', climate: '/climate', community: '/community', network: '/network', login: '/login' };
const pageFromLocation = () => Object.entries(pagePaths).find(([, path]) => path === window.location.pathname)?.[0] || 'overview';

class RouteErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(`Route "${this.props.page}" failed to render.`, error, info); }
  render() {
    if (this.state.hasError) return <section className="route-error" role="alert"><div className="route-error-mark"><CircleAlert size={22}/></div><h2>{this.props.page} is having trouble</h2><p>This page could not be loaded. Your other Fieldwise pages are still available.</p><button className="primary-btn" onClick={this.props.onGoDashboard}>Go back to dashboard</button></section>;
    return this.props.children;
  }
}

const countryLanguages = {
  India: ['Hindi', 'Punjabi', 'Marathi', 'Tamil', 'Telugu', 'Gujarati'],
  Brazil: ['Portuguese (Brazil)'],
  Russia: ['Russian', 'Tatar', 'Bashkir', 'Chechen', 'Chuvash', 'Avar', 'Yakut (Sakha)'],
  China: ['Mandarin (China)', 'Cantonese', 'Wu (Shanghainese)', 'Min Nan', 'Hakka', 'Tibetan', 'Uyghur', 'Mongolian'],
  'South Africa': ['English (South Africa)', 'Zulu (South Africa)', 'Xhosa', 'Afrikaans', 'Sepedi', 'Setswana', 'Sesotho', 'Xitsonga', 'siSwati', 'Tshivenda', 'isiNdebele'],
};

const getLanguagesForCountry = (country) => {
  const localLanguages = countryLanguages[country] || ['English'];
  const networkLanguages = [...new Set(Object.values(countryLanguages).flat())].filter(language => !localLanguages.includes(language));
  return { localHeading: `Local Languages – ${country}`, localLanguages, networkHeading: 'BRICS Network Languages', networkLanguages };
};

const alertData = [
  { id: 'storm-khanna', severity: 'critical', priority: 'high', messageKey: 'heavyRain', message: 'Heavy rain expected Thursday in Khanna. Delay irrigation.', timestamp: '2026-09-29T08:15:00+05:30', actionLabel: 'View forecast', actionHref: '#climate' },
  { id: 'river-bend-moisture', severity: 'warning', priority: 'high', messageKey: 'lowMoisture', message: 'Soil moisture is low in River Bend soybean. Check the field today.', timestamp: '2026-09-29T07:45:00+05:30', actionLabel: 'View field', actionHref: '#fields' },
  { id: 'leaf-spot-river-bend', severity: 'warning', priority: 'high', messageKey: 'leafSpot', message: 'Possible leaf spot found in your latest photo. Review the diagnosis.', timestamp: '2026-09-29T06:30:00+05:30', actionLabel: 'Review diagnosis', actionHref: '#diagnostics' },
  { id: 'weekly-report', severity: 'info', priority: 'normal', messageKey: 'weeklyReport', message: 'Your weekly farm health report is ready.', timestamp: '2026-09-28T17:00:00+05:30', actionLabel: 'View fields', actionHref: '#fields' },
];

const alertTranslations = {
  Hindi: { heavyRain: 'खन्ना में गुरुवार को भारी बारिश की संभावना है। सिंचाई टालें।', lowMoisture: 'रिवर बेंड के सोयाबीन खेत में मिट्टी की नमी कम है। आज खेत जाँचें।', leafSpot: 'आपकी नवीनतम तस्वीर में पत्ती धब्बा रोग के संकेत मिले हैं। निदान देखें।', weeklyReport: 'आपकी साप्ताहिक खेत स्वास्थ्य रिपोर्ट तैयार है।', forecast: 'पूर्वानुमान देखें', field: 'खेत देखें', diagnosis: 'निदान देखें', report: 'खेत देखें' },
  Punjabi: { heavyRain: 'ਖੰਨਾ ਵਿੱਚ ਵੀਰਵਾਰ ਨੂੰ ਭਾਰੀ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਸਿੰਚਾਈ ਮੁਲਤਵੀ ਕਰੋ।', lowMoisture: 'ਰਿਵਰ ਬੈਂਡ ਦੇ ਸੋਇਆਬੀਨ ਖੇਤ ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਨਮੀ ਘੱਟ ਹੈ। ਅੱਜ ਜਾਂਚੋ।', leafSpot: 'ਤੁਹਾਡੀ ਨਵੀਂ ਤਸਵੀਰ ਵਿੱਚ ਪੱਤਿਆਂ ਦੇ ਧੱਬੇ ਦੇ ਲੱਛਣ ਮਿਲੇ ਹਨ। ਜਾਂਚ ਵੇਖੋ।', weeklyReport: 'ਤੁਹਾਡੀ ਹਫ਼ਤਾਵਾਰੀ ਖੇਤ ਸਿਹਤ ਰਿਪੋਰਟ ਤਿਆਰ ਹੈ।', forecast: 'ਮੌਸਮ ਵੇਖੋ', field: 'ਖੇਤ ਵੇਖੋ', diagnosis: 'ਜਾਂਚ ਵੇਖੋ', report: 'ਖੇਤ ਵੇਖੋ' },
  Marathi: { heavyRain: 'खन्ना येथे गुरुवारी मुसळधार पावसाची शक्यता आहे. सिंचन पुढे ढकला.', lowMoisture: 'रिव्हर बेंड सोयाबीनच्या शेतातील मातीचा ओलावा कमी आहे. आज तपासा.', leafSpot: 'तुमच्या अलीकडील फोटोमध्ये पानांवरील ठिपक्यांची शक्यता दिसते. निदान पाहा.', weeklyReport: 'तुमचा साप्ताहिक शेत आरोग्य अहवाल तयार आहे.', forecast: 'हवामान पाहा', field: 'शेत पाहा', diagnosis: 'निदान पाहा', report: 'शेत पाहा' },
  Tamil: { heavyRain: 'கண்ணாவில் வியாழக்கிழமை கனமழை பெய்யலாம். பாசனத்தைத் தள்ளிவையுங்கள்.', lowMoisture: 'ரிவர் பெண்ட் சோயாபீன் வயலில் மண்ணின் ஈரப்பதம் குறைவாக உள்ளது. இன்று சரிபார்க்கவும்.', leafSpot: 'சமீபத்திய படத்தில் இலைப்புள்ளி அறிகுறிகள் இருக்கலாம். நோயறிதலைப் பார்க்கவும்.', weeklyReport: 'உங்கள் வாராந்திர பண்ணை நல அறிக்கை தயாராக உள்ளது.', forecast: 'வானிலைப் பாருங்கள்', field: 'வயலைப் பாருங்கள்', diagnosis: 'நோயறிதலைப் பாருங்கள்', report: 'வயல்களைப் பாருங்கள்' },
  Telugu: { heavyRain: 'ఖన్నాలో గురువారం భారీ వర్షం కురిసే అవకాశం ఉంది. నీటిపారుదలను వాయిదా వేయండి.', lowMoisture: 'రివర్ బెండ్ సోయాబీన్ పొలంలో నేల తేమ తక్కువగా ఉంది. ఈరోజు తనిఖీ చేయండి.', leafSpot: 'మీ తాజా ఫోటోలో ఆకు మచ్చ వ్యాధి లక్షణాలు ఉండవచ్చు. నిర్ధారణను చూడండి.', weeklyReport: 'మీ వారపు పంట ఆరోగ్య నివేదిక సిద్ధంగా ఉంది.', forecast: 'వాతావరణాన్ని చూడండి', field: 'పొలాన్ని చూడండి', diagnosis: 'నిర్ధారణను చూడండి', report: 'పొలాలను చూడండి' },
  Gujarati: { heavyRain: 'ખન્નામાં ગુરુવારે ભારે વરસાદની શક્યતા છે. સિંચાઈ મુલતવી રાખો.', lowMoisture: 'રિવર બેન્ડના સોયાબીન ખેતરમાં જમીનની ભેજ ઓછી છે. આજે તપાસો.', leafSpot: 'તમારા તાજેતરના ફોટામાં પાનના ટપકાંનાં લક્ષણો દેખાય છે. નિદાન જુઓ.', weeklyReport: 'તમારો સાપ્તાહિક ખેતર આરોગ્ય અહેવાલ તૈયાર છે.', forecast: 'આગાહી જુઓ', field: 'ખેતર જુઓ', diagnosis: 'નિદાન જુઓ', report: 'ખેતરો જુઓ' },
  'Portuguese (Brazil)': { heavyRain: 'Há previsão de chuva forte na quinta-feira em Khanna. Adie a irrigação.', lowMoisture: 'A umidade do solo está baixa na soja de River Bend. Verifique a área hoje.', leafSpot: 'Sua foto mais recente pode indicar mancha foliar. Revise o diagnóstico.', weeklyReport: 'Seu relatório semanal de saúde da fazenda está pronto.', forecast: 'Ver previsão', field: 'Ver talhão', diagnosis: 'Revisar diagnóstico', report: 'Ver talhões' },
  Russian: { heavyRain: 'В четверг в Кханне ожидаются сильные дожди. Отложите полив.', lowMoisture: 'Влажность почвы на соевом поле Ривер-Бенд низкая. Проверьте поле сегодня.', leafSpot: 'На последнем фото возможны признаки пятнистости листьев. Проверьте диагноз.', weeklyReport: 'Готов еженедельный отчёт о состоянии вашей фермы.', forecast: 'Прогноз погоды', field: 'Открыть поле', diagnosis: 'Проверить диагноз', report: 'Открыть поля' },
  'Mandarin (China)': { heavyRain: '卡纳周四预计有强降雨。请推迟灌溉。', lowMoisture: '河湾大豆田土壤水分偏低。请于今天检查田地。', leafSpot: '最新照片可能显示叶斑病迹象。请查看诊断结果。', weeklyReport: '您的每周农场健康报告已准备就绪。', forecast: '查看天气', field: '查看田地', diagnosis: '查看诊断', report: '查看田地' },
  'English (South Africa)': { heavyRain: 'Heavy rain expected Thursday in Khanna. Delay irrigation.', lowMoisture: 'Soil moisture is low in River Bend soybean. Check the field today.', leafSpot: 'Possible leaf spot found in your latest photo. Review the diagnosis.', weeklyReport: 'Your weekly farm health report is ready.', forecast: 'View forecast', field: 'View field', diagnosis: 'Review diagnosis', report: 'View fields' },
  'Zulu (South Africa)': { heavyRain: 'Kulindeleke imvula enkulu eKhanna ngoLwesine. Hlehlisa ukunisela.', lowMoisture: 'Umswakama womhlabathi uphansi ensimini yesoya eRiver Bend. Hlola insimu namuhla.', leafSpot: 'Isithombe sakho sakamuva singase sibonise amabala emaqabungeni. Buyekeza ukuhlolwa.', weeklyReport: 'Umbiko wakho wamasonto onke wezempilo yepulazi usulungile.', forecast: 'Buka isibikezelo', field: 'Buka insimu', diagnosis: 'Buyekeza ukuhlolwa', report: 'Buka amasimu' },
};

const alertLanguageFallbacks = {
  Tatar: 'Russian', Bashkir: 'Russian', Chechen: 'Russian', Chuvash: 'Russian', Avar: 'Russian', 'Yakut (Sakha)': 'Russian',
  Cantonese: 'Mandarin (China)', 'Wu (Shanghainese)': 'Mandarin (China)', 'Min Nan': 'Mandarin (China)', Hakka: 'Mandarin (China)', Tibetan: 'Mandarin (China)', Uyghur: 'Mandarin (China)', Mongolian: 'Mandarin (China)',
  Xhosa: 'English (South Africa)', Afrikaans: 'English (South Africa)', Sepedi: 'English (South Africa)', Setswana: 'English (South Africa)', Sesotho: 'English (South Africa)', Xitsonga: 'English (South Africa)', siSwati: 'English (South Africa)', Tshivenda: 'English (South Africa)', isiNdebele: 'English (South Africa)',
};

function getActiveAlerts() {
  const order = { critical: 0, warning: 1, info: 2 };
  return alertData.filter(alert => alert.priority === 'high').sort((a, b) => order[a.severity] - order[b.severity] || new Date(b.timestamp) - new Date(a.timestamp));
}

function readDismissedAlertIds() {
  const read = (storage, key) => { try { return JSON.parse(storage.getItem(key) || '[]'); } catch { return []; } };
  return [...new Set([
    ...read(window.localStorage, 'fieldwise-dismissed-alerts'),
    ...read(window.sessionStorage, 'fieldwise-dismissed-critical-alerts'),
  ])];
}

function translatedAlert(alert, language) { return alertTranslations[language]?.[alert.messageKey] || alertTranslations[alertLanguageFallbacks[language]]?.[alert.messageKey] || alert.message; }
function translatedAction(alert, language) {
  const key = alert.actionHref === '#climate' ? 'forecast' : alert.actionHref === '#diagnostics' ? 'diagnosis' : alert.id === 'weekly-report' ? 'report' : 'field';
  return alertTranslations[language]?.[key] || alertTranslations[alertLanguageFallbacks[language]]?.[key] || alert.actionLabel;
}

function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    context.resume?.();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.11, context.currentTime + .04);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .24);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .25);
    oscillator.onended = () => context.close();
  } catch { /* Chime is a convenience; speech remains available without it. */ }
}

function ReadAloudPlayer({ speech, onListen, showHint, language }) {
  return <>
    {!speech.supported ? <div className="speech-support-message" role="status" aria-live="polite">Voice is not supported in this browser.</div> : <div className={`read-aloud-player ${speech.state !== 'idle' ? 'playing' : ''}`}>
      {showHint && speech.state === 'idle' && <div className="listen-hint">Tap here to listen to your farm updates.</div>}
      {speech.state === 'idle' ? <button className="listen-main" onClick={onListen} aria-label="Listen to this page" title="Listen to this page" aria-pressed="false"><Volume2 size={24}/><span>Listen</span></button> : <div className="listen-controls" role="group" aria-label="Read aloud controls">
        <span className="listen-wave" aria-hidden="true"><i/><i/><i/></span>
        <button className="listen-control" onClick={speech.previous} aria-label="Previous item"><SkipBack size={18}/><span>Previous</span></button>
        {speech.state === 'playing' ? <button className="listen-control primary" onClick={speech.pause} aria-label="Pause reading"><Pause size={18}/><span>Pause</span></button> : <button className="listen-control primary" onClick={speech.resume} aria-label="Resume reading"><Play size={18}/><span>Resume</span></button>}
        <button className="listen-control" onClick={speech.next} aria-label="Next item"><SkipForward size={18}/><span>Next</span></button>
        <button className="listen-control" onClick={speech.stop} aria-label="Stop reading"><VolumeX size={18}/><span>Stop</span></button>
        <button className="listen-speed" onClick={speech.toggleSpeed} aria-label={`Speech speed: ${speech.speed}. Change speed`}>{speech.speed === 'slow' ? 'Slow' : 'Normal'}</button>
      </div>}
      {speech.notice && <span className="speech-notice" role="status" aria-live="polite">{speech.notice}</span>}
      <span className="sr-only" aria-live="polite">{getSpeechStateLabel(language, speech.state)}</span>
    </div>}
  </>;
}

function SettingsModal({ autoReadCritical, onAutoReadChange, onClose }) {
  return <div className="modal-backdrop" onClick={onClose}><section className="modal read-settings" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={event => event.stopPropagation()}>
    <button type="button" className="modal-close" onClick={onClose} aria-label="Close settings"><X size={18}/></button><span className="modal-icon"><Settings size={19}/></span><h2 id="settings-title">Settings</h2><p>Choose how Fieldwise shares important updates.</p>
    <label className="auto-read-setting"><input type="checkbox" checked={autoReadCritical} onChange={event => onAutoReadChange(event.target.checked)}/><span><b>Read urgent alerts automatically</b><small>Play a short chime and read new critical alerts aloud.</small></span></label>
    <button type="button" className="primary-btn modal-submit" onClick={onClose}>Done</button>
  </section></div>;
}

function App() {
  const [currentUser, setCurrentUser] = useState(getSessionUser);
  const [page, setPageState] = useState(() => isAuthenticated() ? pageFromLocation() : 'login');
  const setPage = useCallback(nextPage => {
    setPageState(nextPage);
    const path = pagePaths[nextPage];
    if (path && window.location.pathname !== path) window.history.pushState({}, '', `${path}${window.location.search}${window.location.hash}`);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoReadCritical, setAutoReadCritical] = useState(() => { try { return window.localStorage.getItem('fieldwise-auto-read-critical') === 'true'; } catch { return false; } });
  const [showListenHint, setShowListenHint] = useState(() => { try { return window.localStorage.getItem('fieldwise-read-aloud-hint') !== '1'; } catch { return false; } });
  const hasInteractedRef = useRef(false);
  const previousCriticalIdsRef = useRef([]);
  const [country, setCountry] = useState(() => {
    try { const saved = window.localStorage.getItem('fieldwise-country'); return countryLanguages[saved] ? saved : 'India'; }
    catch { return 'India'; }
  });
  const [theme, setThemeState] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [dismissedAlertIds, setDismissedAlertIds] = useState(readDismissedAlertIds);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    try {
      const savedCountry = window.localStorage.getItem('fieldwise-country');
      const savedLanguage = window.localStorage.getItem('fieldwise-language');
      const initialCountry = countryLanguages[savedCountry] ? savedCountry : 'India';
      const allLanguages = [...new Set(Object.values(countryLanguages).flat())];
      return allLanguages.includes(savedLanguage) ? savedLanguage : getLanguagesForCountry(initialCountry).localLanguages[0];
    } catch { return 'Punjabi'; }
  });
  const [fields, setFields] = useState(loadFields);
  const [communityNarration, setCommunityNarration] = useState(communityData);
  const handleCommunityDataChange = useCallback(data => setCommunityNarration(current => ({ ...current, ...data })), []);
  const [diagnosticCrop, setDiagnosticCrop] = useState(() => loadFields()[0]?.crops?.[0] || '');
  const [image, setImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const notificationsRef = useRef(null);
  useEffect(() => {
    const onPopState = () => setPageState(isAuthenticated() ? pageFromLocation() : 'login');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem('fieldwise-country', country);
      window.localStorage.setItem('fieldwise-language', language);
    } catch { /* Storage may be unavailable in private browsing contexts. */ }
  }, [country, language]);
  useEffect(() => {
    try { window.localStorage.setItem('fieldwise-fields', JSON.stringify(fields.map(normalizeField))); }
    catch { /* Local field persistence is optional in restricted browsers. */ }
  }, [fields]);
  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);
  const changeCountry = (nextCountry) => {
    const { localLanguages } = getLanguagesForCountry(nextCountry);
    if (!localLanguages.includes(language)) setLanguage(localLanguages[0]);
    setCountry(nextCountry);
  };
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setThemeState(nextTheme);
  };
  const dismissAlert = (alert) => {
    setDismissedAlertIds(ids => [...new Set([...ids, alert.id])]);
    try {
      const storage = alert.severity === 'critical' ? window.sessionStorage : window.localStorage;
      const key = alert.severity === 'critical' ? 'fieldwise-dismissed-critical-alerts' : 'fieldwise-dismissed-alerts';
      const ids = JSON.parse(storage.getItem(key) || '[]');
      storage.setItem(key, JSON.stringify([...new Set([...ids, alert.id])]));
    } catch { /* Keep the alert dismissed for this render when storage is unavailable. */ }
  };
  const navigateToAlert = (href) => { setPage(href.replace('#', '')); setNotificationsOpen(false); };
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const analyze = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.');
    setImage(URL.createObjectURL(file)); setDiagnosis(null); setBusy(true);
    setTimeout(() => { setBusy(false); setDiagnosis({ title: `Possible leaf spot${diagnosticCrop ? ` in ${diagnosticCrop}` : ''}`, confidence: '87%', advice: 'Remove heavily affected leaves and avoid overhead watering. Check again in 3–4 days.' }); }, 1100);
  };
  const addField = (data) => { setFields(current => [...current, normalizeField({ name: data.name, crops: data.crops, area: data.area, health: 80, status: 'Healthy', color: 'green', ndvi: '.71', water: 'Good' })]); setShowFieldForm(false); notify('Field added to your farm.'); };
  const selected = nav.find(x => x.id === page)?.label || 'Overview';
  const availableCrops = [...new Set(fields.flatMap(field => field.crops || []))];
  const activeAlerts = getActiveAlerts().filter(alert => !dismissedAlertIds.includes(alert.id));
  const speechQueue = useMemo(() => buildReadingQueue({
    page, userName: currentUser?.fullName?.split(/\s+/)[0], date: new Intl.DateTimeFormat(speechLanguageCodes[language] || 'en-IN', { dateStyle: 'long' }).format(new Date()),
    fields, activeAlerts: activeAlerts.map(alert => ({ ...alert, speechText: translatedAlert(alert, language) })), notifications: activeAlerts.map(alert => ({ ...alert, speechText: translatedAlert(alert, language) })),
    language, diagnosis, diagnosticCrop, community: page === 'community' ? communityNarration : undefined, weather: { temperature: 28, condition: speechTemplates[language]?.conditionPartlyCloudy || speechTemplates.English.conditionPartlyCloudy, rainDay: speechTemplates[language]?.dayThursday || 'Thursday', rainAmount: 12 },
  }), [page, currentUser, fields, activeAlerts, language, diagnosis, diagnosticCrop, communityNarration]);
  const speech = useReadAloud({ queue: speechQueue, language });
  const handleReadAloud = () => {
    try { window.localStorage.setItem('fieldwise-read-aloud-hint', '1'); } catch { /* Hint preference is optional. */ }
    setShowListenHint(false);
    speech.toggle();
  };
  const userInitials = currentUser?.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '';
  useEffect(() => {
    if (currentUser && page === 'login') setPage('overview');
    else if (!currentUser && page !== 'login') setPage('login');
  }, [currentUser, page]);
  useEffect(() => { speech.stop(); }, [page, speech.stop]);
  useEffect(() => {
    if (speech.currentItem?.startsWith('notification-')) setNotificationsOpen(true);
    else if (notificationsOpen) setNotificationsOpen(false);
  }, [speech.currentItem, notificationsOpen]);
  useEffect(() => {
    if (speech.currentItem) {
      const targets = [...document.querySelectorAll('[data-read-id]')];
      targets.forEach(target => target.classList.toggle('read-aloud-current', target.getAttribute('data-read-id') === speech.currentItem));
      const target = targets.find(element => element.getAttribute('data-read-id') === speech.currentItem);
      target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    } else document.querySelectorAll('.read-aloud-current').forEach(element => element.classList.remove('read-aloud-current'));
  }, [speech.currentItem]);
  useEffect(() => {
    if (!showListenHint || !currentUser) return undefined;
    try { window.localStorage.setItem('fieldwise-read-aloud-hint', '1'); } catch { /* Hint preference is optional. */ }
    const timer = window.setTimeout(() => setShowListenHint(false), 9000);
    return () => window.clearTimeout(timer);
  }, [showListenHint, currentUser]);
  useEffect(() => {
    try { window.localStorage.setItem('fieldwise-auto-read-critical', String(autoReadCritical)); } catch { /* Preference is optional. */ }
  }, [autoReadCritical]);
  useEffect(() => {
    const rememberInteraction = () => { hasInteractedRef.current = true; };
    window.addEventListener('pointerdown', rememberInteraction, { once: true });
    window.addEventListener('keydown', rememberInteraction, { once: true });
    return () => { window.removeEventListener('pointerdown', rememberInteraction); window.removeEventListener('keydown', rememberInteraction); };
  }, []);
  useEffect(() => {
    const critical = activeAlerts.filter(alert => alert.severity === 'critical');
    const newAlert = critical.find(alert => !previousCriticalIdsRef.current.includes(alert.id));
    if (newAlert && autoReadCritical && hasInteractedRef.current && speech.supported) {
      playAlertChime();
      window.setTimeout(() => speech.start([{ id: `alert-${newAlert.id}`, text: translatedAlert(newAlert, language) }]), 350);
    }
    previousCriticalIdsRef.current = critical.map(alert => alert.id);
  }, [activeAlerts, autoReadCritical, language, speech.supported, speech.start]);
  const completeLogin = (user) => { setCurrentUser(user); setPage('overview'); };
  const handleLogout = () => { logout(); setCurrentUser(null); setPage('login'); setProfileMenuOpen(false); };
  if (!currentUser) return <AuthScreen language={language} country={country} onLanguageChange={setLanguage} theme={theme} onToggleTheme={toggleTheme} onLogin={completeLogin}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sprout size={19}/></span><span>fieldwise<span className="brand-dot">.</span></span><button className="icon-btn close-menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <div className="farm-switch"><span className="farm-avatar">S</span><span className="farm-copy"><b>Sundar Farms</b><small>Farmer workspace</small></span><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); }} className={`nav-item ${page === item.id ? 'active' : ''}`}><item.icon size={18}/><span>{item.label}</span>{item.id === 'diagnostics' && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><HelpCircle size={17}/></div><b>Need a hand?</b><p>Get guidance from a local agronomist.</p><button onClick={() => notify('Agronomist support will be available soon.')}>Contact support <ArrowRight size={14}/></button></div><button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings size={18}/><span>Settings</span></button><div className="profile"><div className="profile-avatar">{userInitials}</div><div><b>{currentUser.fullName}</b><small>{currentUser.username === 'arjun' ? 'Punjab, India' : country}</small></div><button className="profile-menu-trigger" aria-label="Open account menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(!profileMenuOpen)}><MoreHorizontal size={19}/></button>{profileMenuOpen && <div className="profile-menu"><button onClick={handleLogout}><LogOut size={15}/> Log out</button></div>}</div></div>
    </aside>
    {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
    <main className="main-area">{page === 'overview' && activeAlerts.length > 0 && <AlertRibbon alerts={activeAlerts} language={language} onDismiss={dismissAlert} onNavigate={navigateToAlert} currentReadItem={speech.currentItem}/>}<header className="topbar"><button className="icon-btn menu-toggle" onClick={() => setMenuOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{selected}</b></div><div className="top-actions"><div className="weather-pill" data-read-id="weather"><CloudSun size={17}/><span>28°</span><i>Partly cloudy</i></div><span className="top-divider"/><div className="notifications-wrap" ref={notificationsRef}><button className="icon-btn notification" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Open notifications" aria-haspopup="true" aria-expanded={notificationsOpen}><Bell size={18}/>{activeAlerts.length > 0 && <i/>}</button>{notificationsOpen && <div className="notification-dropdown" role="region" aria-label="All notifications"><div className="notification-heading"><b>Notifications</b><span>{alertData.length} updates</span></div>{[...alertData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(alert => <div className="notification-item" key={alert.id} data-read-id={`notification-${alert.id}`}><span className={`notification-severity ${alert.severity}`}/><div><b>{translatedAlert(alert, language)}</b><small>{alert.priority === 'high' ? 'High priority' : 'Farm update'} · {new Date(alert.timestamp).toLocaleDateString()}</small><button onClick={() => navigateToAlert(alert.actionHref)}>{translatedAction(alert, language)} <ArrowRight size={12}/></button></div></div>)}</div>}</div><select className="country-select" value={country} onChange={e => changeCountry(e.target.value)} aria-label="Choose region"><option>India</option><option>Brazil</option><option>China</option><option>Russia</option><option>South Africa</option></select><LanguageSelector country={country} language={language} onLanguageChange={setLanguage}/><button className="icon-btn theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>{speech.supported && <button className={`icon-btn read-aloud-header ${speech.state !== 'idle' ? 'is-speaking' : ''}`} onClick={handleReadAloud} title="Listen to this page" aria-label={speech.state !== 'idle' ? 'Stop reading aloud' : 'Listen to this page'} aria-pressed={speech.state !== 'idle'}>{speech.state === 'idle' ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>}</div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow"><Sun size={14}/> MONDAY, 29 SEPTEMBER 2026 <span className="eyebrow-dot">·</span> KHANNA, PUNJAB</div><h1>{page === 'overview' ? 'Good morning, Arjun' : selected}<span className="wave">{page === 'overview' ? ' ☀' : ''}</span></h1><p>{page === 'overview' ? 'Here’s what’s happening across your farm today.' : page === 'diagnostics' ? 'Check crop health with a quick photo from your field.' : page === 'network' ? 'A shared learning network built on locally governed farm data.' : page === 'climate' ? 'Plan ahead with local weather and crop-specific water guidance.' : 'A clear view of crop health across your fields.'}</p></div><button className="date-button"><ChevronLeft size={16}/> This week <ChevronDown size={14}/></button></div>
      <RouteErrorBoundary key={page} page={selected} onGoDashboard={() => setPage('overview')}>
        {page === 'overview' && <Overview fields={fields} onAdd={() => setShowFieldForm(true)} onPage={setPage} />}
        {page === 'diagnostics' && <Diagnostics image={image} diagnosis={diagnosis} busy={busy} inputRef={inputRef} onFile={analyze} crops={availableCrops} selectedCrop={diagnosticCrop} onCropChange={setDiagnosticCrop} />}
        {page === 'fields' && <Fields fields={fields} onAdd={() => setShowFieldForm(true)} />}
        {page === 'climate' && <Climate />}
        {page === 'community' && <CommunityPage language={language} onDataChange={handleCommunityDataChange}/>}
        {page === 'network' && <Network country={country} />}
      </RouteErrorBoundary>
      <footer className="footer"><span><ShieldCheck size={14}/> Your farm data stays under your control</span><span>FIELDWISE <i>·</i> FARM INTELLIGENCE</span></footer>
      </div>
    </main>
    {showFieldForm && <AddFieldModal language={language} onClose={() => setShowFieldForm(false)} onSubmit={addField}/>}
    {settingsOpen && <SettingsModal autoReadCritical={autoReadCritical} onAutoReadChange={setAutoReadCritical} onClose={() => setSettingsOpen(false)}/>}
    <ReadAloudPlayer speech={speech} onListen={handleReadAloud} showHint={showListenHint} language={language}/>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function LanguageSelector({ country, language, onLanguageChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    const closeOnOutsideClick = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape); };
  }, []);
  const languageGroups = getLanguagesForCountry(country);
  return <div className="language-selector" ref={rootRef}>
    <button className={`icon-btn language-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label={`Choose language. Current language: ${language}`} title={`Language: ${language}`} aria-haspopup="menu" aria-expanded={open}>
      <Globe2 size={18}/>
    </button>
    {open && <div className="language-dropdown" role="menu" aria-label="Choose language">
      <div className="language-menu-heading"><b>Language</b><span>Current: {language}</span></div>
      {[{ title: languageGroups.localHeading, languages: languageGroups.localLanguages }, { title: languageGroups.networkHeading, languages: languageGroups.networkLanguages }].map(group => <div className="language-group" key={group.title}>
        <div className="language-group-title">{group.title}</div>
        {group.languages.map(item => <button key={item} role="menuitemradio" aria-checked={language === item} className={`language-option ${language === item ? 'selected' : ''}`} onClick={() => { onLanguageChange(item); setOpen(false); }}><span>{item}</span>{language === item && <Check size={15}/>}</button>)}
      </div>)}
    </div>}
  </div>;
}

function AuthScreen({ language, country, onLanguageChange, theme, onToggleTheme, onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState(getRememberedUsername());
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const passwordRef = useRef(null);
  const update = (setter) => event => { setter(event.target.value); setError(''); setInvalidFields([]); };

  const handleLogin = event => {
    event.preventDefault();
    setError('');
    const missing = [];
    if (!username.trim()) missing.push('username');
    if (!password) missing.push('password');
    if (missing.length) {
      setInvalidFields(missing);
      setError(missing.includes('username') ? 'Please enter your username' : 'Please enter your password');
      if (missing.includes('password')) passwordRef.current?.focus();
      return;
    }
    const result = login(username, password);
    if (!result.ok) {
      if (result.error === 'invalid-credentials') {
        setError('Incorrect username or password. Please retype and try again.');
        setInvalidFields(['username', 'password']);
        setPassword('');
        window.setTimeout(() => passwordRef.current?.focus(), 0);
      } else {
        setError('Unable to save the demo session in this browser.');
      }
      return;
    }
    setRememberedUsername(username, remember);
    setLoading(true);
    window.setTimeout(() => onLogin(result.user), 600);
  };

  const handleSignup = event => {
    event.preventDefault();
    setError('');
    const result = signup({ fullName, username, password, confirmPassword });
    if (!result.ok) {
      const empty = [];
      if (!fullName.trim()) empty.push('fullName');
      if (!username.trim()) empty.push('username');
      if (!password) empty.push('password');
      if (!confirmPassword) empty.push('confirmPassword');
      setInvalidFields(empty.length ? empty : result.error === 'username-taken' ? ['username'] : result.error === 'password-mismatch' ? ['password', 'confirmPassword'] : result.error === 'password-short' ? ['password'] : []);
      const messages = {
        required: 'Please complete all fields.',
        'password-short': 'Password must be at least 8 characters.',
        'password-mismatch': 'Passwords do not match. Please retype.',
        'username-taken': 'This username is already taken.',
        storage: 'Unable to save the demo account in this browser.',
      };
      setError(messages[result.error] || 'Unable to create this account.');
      return;
    }
    setRememberedUsername(username, remember);
    setLoading(true);
    window.setTimeout(() => onLogin(result.user), 600);
  };

  const passwordField = (id, label, value, setter, autocomplete, inputRef = null, fieldKey = id) => <label className="auth-label" htmlFor={id}>{label}<span className={`auth-password-wrap ${invalidFields.includes(fieldKey) ? 'invalid' : ''}`}><input id={id} ref={inputRef} type={showPassword ? 'text' : 'password'} autoComplete={autocomplete} value={value} onChange={update(setter)} aria-invalid={invalidFields.includes(fieldKey)} required/><button type="button" className="password-visibility" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>;

  return <div className="auth-shell">
    <header className="auth-topbar"><a className="brand auth-brand" href="#login" onClick={event => event.preventDefault()}><span className="brand-mark"><Sprout size={19}/></span><span>fieldwise<span className="brand-dot">.</span></span></a><div className="auth-top-actions"><LanguageSelector country={country} language={language} onLanguageChange={onLanguageChange}/><button className="icon-btn theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
    <main className="auth-main"><section className="auth-card">
      <div className="auth-heading"><span className="section-kicker">FARM INTELLIGENCE</span><h1>{mode === 'login' ? 'Welcome back' : 'Join Fieldwise'}</h1><p>{mode === 'login' ? 'Sign in to see what’s happening across your farm.' : 'Create your farmer account to get started.'}</p></div>
      <div className="auth-tabs" role="tablist" aria-label="Account access"><button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setInvalidFields([]); }}>Log in</button><button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setInvalidFields([]); }}>Sign up</button></div>
      {error && <div className="auth-error" role="alert" aria-live="polite"><CircleAlert size={16}/><span>{error}</span></div>}
      {mode === 'login' ? <form className="auth-form" onSubmit={handleLogin} noValidate>
        <label className="auth-label" htmlFor="login-username">Username<input id="login-username" className={invalidFields.includes('username') ? 'invalid' : ''} type="text" autoComplete="username" value={username} onChange={update(setUsername)} aria-invalid={invalidFields.includes('username')} required/></label>
        {passwordField('login-password', 'Password', password, setPassword, 'current-password', passwordRef, 'password')}
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/> <span>Remember me</span></label>
        <button className="primary-btn auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner"/> Logging in…</> : 'Log in'}</button>
      </form> : <form className="auth-form" onSubmit={handleSignup} noValidate>
        <label className="auth-label" htmlFor="signup-fullname">Full name<input id="signup-fullname" className={invalidFields.includes('fullName') ? 'invalid' : ''} type="text" autoComplete="name" value={fullName} onChange={update(setFullName)} aria-invalid={invalidFields.includes('fullName')} required/></label>
        <label className="auth-label" htmlFor="signup-username">Username<input id="signup-username" className={invalidFields.includes('username') ? 'invalid' : ''} type="text" autoComplete="username" value={username} onChange={update(setUsername)} aria-invalid={invalidFields.includes('username')} required/></label>
        {passwordField('signup-password', 'Password', password, setPassword, 'new-password', null, 'password')}
        {passwordField('signup-confirm-password', 'Confirm password', confirmPassword, setConfirmPassword, 'new-password', null, 'confirmPassword')}
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/> <span>Remember me</span></label>
        <button className="primary-btn auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner"/> Creating account…</> : 'Create account'}</button>
      </form>}
      <div className="auth-note"><ShieldCheck size={14}/><span>Your farm information stays under your control.</span></div>
    </section></main>
  </div>;
}

function AlertRibbon({ alerts, language, onDismiss, onNavigate, currentReadItem }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const exitTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(exitTimer.current), []);
  useEffect(() => {
    const id = currentReadItem?.startsWith('alert-') ? currentReadItem.slice(6) : null;
    if (id) { const found = alerts.findIndex(item => item.id === id); if (found >= 0) setIndex(found); }
  }, [currentReadItem, alerts.length]);
  if (!alerts.length) return null;
  const currentIndex = index % alerts.length;
  const alert = alerts[currentIndex];
  const Icon = alert.severity === 'critical' ? TriangleAlert : alert.severity === 'warning' ? CircleAlert : Info;
  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    exitTimer.current = window.setTimeout(() => { onDismiss(alert); setLeaving(false); }, 200);
  };
  const actionLabel = translatedAction(alert, language);
  return <div className={`alert-ribbon ${alert.severity} ${leaving ? 'leaving' : ''}`} data-read-id={`alert-${alert.id}`} role={alert.severity === 'critical' ? 'alert' : 'status'} aria-live={alert.severity === 'critical' ? 'assertive' : 'polite'} aria-atomic="true">
    <Icon className="alert-ribbon-icon" size={18} aria-hidden="true"/>
    <span className="alert-ribbon-message">{translatedAlert(alert, language)}</span>
    <a className="alert-ribbon-action" href={alert.actionHref} onClick={event => { event.preventDefault(); onNavigate(alert.actionHref); }}>{actionLabel} <ArrowRight size={13}/></a>
    {alerts.length > 1 && <div className="alert-ribbon-pager"><span>{currentIndex + 1} of {alerts.length}</span><button onClick={() => setIndex((currentIndex - 1 + alerts.length) % alerts.length)} aria-label="Previous alert"><ArrowLeft size={14}/></button><button onClick={() => setIndex((currentIndex + 1) % alerts.length)} aria-label="Next alert"><ArrowRight size={14}/></button></div>}
    <button className="alert-ribbon-close" onClick={dismiss} aria-label="Dismiss alert" title="Dismiss alert"><X size={16}/></button>
  </div>;
}

function AddFieldModal({ language, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [crops, setCrops] = useState([]);
  const [area, setArea] = useState('');
  const [attempted, setAttempted] = useState(false);
  const save = event => {
    event.preventDefault();
    setAttempted(true);
    if (!name.trim() || crops.length === 0 || !(Number(area) > 0)) return;
    onSubmit({ name: name.trim(), crops, area: Number(area) });
  };
  return <div className="modal-backdrop" onClick={onClose}><form className="modal" role="dialog" aria-modal="true" aria-labelledby="add-field-title" noValidate onSubmit={save} onClick={event => event.stopPropagation()}>
    <button type="button" className="modal-close" onClick={onClose} aria-label="Close add field dialog"><X size={18}/></button><span className="modal-icon"><MapPin size={20}/></span><h2 id="add-field-title">Add a field</h2><p>Start tracking crop health and local conditions.</p>
    <label>Field name<input className={attempted && !name.trim() ? 'invalid' : ''} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. West Meadow" autoFocus aria-invalid={attempted && !name.trim()}/></label>
    <div className="form-row"><label>Crop<CropMultiSelect value={crops} onChange={setCrops} options={cropOptions} max={5} language={language} invalid={attempted && crops.length === 0}/>{attempted && crops.length === 0 && <small className="field-error">Please add at least one crop</small>}</label><label>Area (hectares)<input className={attempted && !(Number(area) > 0) ? 'invalid' : ''} type="number" min="0.1" step="0.1" value={area} onChange={event => setArea(event.target.value)} placeholder="2.5" aria-invalid={attempted && !(Number(area) > 0)}/>{attempted && !(Number(area) > 0) && <small className="field-error">Please enter a positive area.</small>}</label></div>
    {attempted && !name.trim() && <small className="field-error name-error">Please enter a field name.</small>}
    <button className="primary-btn modal-submit" type="submit">Add field <ArrowRight size={16}/></button>
  </form></div>;
}

function CropMultiSelect({ value, onChange, options, max = 5, language, invalid = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listId = `crop-options-${useId().replace(/:/g, '')}`;
  const t = cropTranslations[language] || {};
  const exists = name => value.some(crop => crop.toLocaleLowerCase() === name.trim().toLocaleLowerCase());
  const translated = name => t[name] || name;
  const availableOptions = options.map(option => typeof option === 'string' ? { name: option } : option).filter(option => option?.name);
  const filtered = availableOptions.filter(option => !exists(option.name) && `${option.name} ${translated(option.name)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const exactOption = availableOptions.some(option => option.name.toLocaleLowerCase() === query.trim().toLocaleLowerCase() || translated(option.name).toLocaleLowerCase() === query.trim().toLocaleLowerCase());
  const suggestions = query.trim() && !exactOption && !exists(query) ? [...filtered, { name: query.trim(), custom: true }] : filtered;
  const add = name => {
    const crop = String(name || '').trim().replace(/,+$/, '').trim();
    if (!crop) return;
    if (value.length >= max || exists(crop)) { setQuery(''); setActiveIndex(-1); return; }
    const canonical = options.find(option => option.toLocaleLowerCase() === crop.toLocaleLowerCase() || translated(option).toLocaleLowerCase() === crop.toLocaleLowerCase()) || crop;
    onChange([...value, canonical]);
    setQuery(''); setActiveIndex(-1); setOpen(false); inputRef.current?.focus();
  };
  const choose = option => add(option.name);
  const onKeyDown = event => {
    if (event.key === 'ArrowDown' && suggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex(index => (index + 1) % suggestions.length); }
    else if (event.key === 'ArrowUp' && suggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex(index => (index <= 0 ? suggestions.length - 1 : index - 1)); }
    else if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); }
    else if (event.key === 'Backspace' && !query && value.length) { event.preventDefault(); onChange(value.slice(0, -1)); }
    else if (event.key === ',' || event.key === 'Enter') {
      if (event.key === 'Enter' && !query.trim() && activeIndex < 0) return;
      event.preventDefault();
      if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) choose(suggestions[activeIndex]);
      else add(query);
    }
  };
  return <div className={`crop-select ${invalid ? 'invalid' : ''}`}>
    <div className="crop-chip-list">{value.map(crop => <span className="crop-chip" key={crop}>{crop}<button type="button" aria-label={`Remove ${crop}`} onClick={() => onChange(value.filter(item => item !== crop))}><X size={12}/></button></span>)}
      <input ref={inputRef} role="combobox" aria-label="Crops" aria-autocomplete="list" aria-expanded={open && suggestions.length > 0 && value.length < max} aria-controls={listId} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} value={query} disabled={value.length >= max} placeholder={value.length ? 'Add another crop' : 'e.g. Wheat, Mustard'} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={onKeyDown}/>
    </div>
    {open && value.length < max && suggestions.length > 0 && <ul className="crop-suggestions" id={listId} role="listbox">{suggestions.slice(0, 8).map((option, index) => <li id={`${listId}-${index}`} key={`${option.name}-${index}`} role="option" aria-selected={activeIndex === index} className={activeIndex === index ? 'active' : ''} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>{option.custom ? <>{filtered.length === 0 ? <>No matches. Press Enter to add </> : <>Add </>}<b>“{option.name}”</b></> : <>{translated(option.name)}{translated(option.name) !== option.name && <small>{option.name}</small>}</>}</li>)}</ul>}
    {value.length >= max && <small className="crop-limit">You can add up to {max} crops</small>}
  </div>;
}

function Overview({ fields, onAdd, onPage }) { return <>
  <section className="stats-grid" data-read-id="farm-summary"><Stat label="Active fields" value={String(fields.length).padStart(2,'0')} unit="fields" delta="Across 15.7 hectares" icon={MapPin} tone="mint"/><Stat label="Farm health" value="78" unit="/ 100" delta={<><ArrowUpRight size={14}/> 4 pts this month</>} icon={Leaf} tone="lime"/><Stat label="Rain expected" value="12" unit="mm" delta="Thursday · next 7 days" icon={Cloud} tone="blue"/><Stat label="Water saved" value="18" unit="%" delta="Vs. your usual schedule" icon={Droplets} tone="peach"/></section>
  <div className="main-grid"><section className="panel field-panel"><div className="panel-heading"><div><span className="section-kicker">FIELD MONITOR</span><h2>Your fields <span className="count-badge">{fields.length}</span></h2></div><button className="text-action" onClick={() => onPage('fields')}>View all <ArrowRight size={15}/></button></div><div className="field-list">{fields.slice(0,3).map((f,i)=><div className="field-row" key={f.name} data-read-id={`field-${f.name}`}><div className={`field-thumb thumb-${i%3}`}><span>{i===0?'↗':i===1?'◌':'⌁'}</span><small>{f.ndvi} NDVI</small></div><div className="field-info"><b>{f.name}</b><span title={(f.crops||[]).join(', ')}>{formatCropSummary(f)} · {f.area} ha</span><div className="field-meta"><span className={`status-dot ${f.color}`}/><span className={f.color}>{f.status}</span><i>·</i><span>Soil moisture {f.water.toLowerCase()}</span></div></div><div className="health-wrap"><div className="health-number">{f.health}<small>%</small></div><div className="health-track"><span style={{width:`${f.health}%`}} className={f.health<70?'amber':''}/></div></div><button className="row-arrow" onClick={() => onPage('fields')}><ArrowRight size={17}/></button></div>)}</div><button className="add-field" onClick={onAdd}><Plus size={16}/> Add a field</button></section>
  <section className="panel care-panel"><div className="panel-heading"><div><span className="section-kicker">TODAY’S PRIORITIES</span><h2>Field notes <span className="note-count">2</span></h2></div><button className="more-btn"><MoreHorizontal size={19}/></button></div><div className="care-note urgent" data-read-id="note-leaf"><span className="note-icon amber-icon"><Leaf size={17}/></span><div><div className="note-label">CROP HEALTH <span>· 2 HOURS AGO</span></div><b>Check River Bend soybean</b><p>Possible leaf spot detected in your latest field photo.</p><button onClick={() => onPage('diagnostics')}>Review diagnosis <ArrowRight size={14}/></button></div></div><div className="care-note" data-read-id="note-water"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><div className="note-label">IRRIGATION <span>· TODAY</span></div><b>Water North Field tomorrow</b><p>Soil moisture is trending low ahead of warmer weather.</p><button onClick={() => onPage('climate')}>See water plan <ArrowRight size={14}/></button></div></div></section></div>
  <div className="lower-grid"><section className="panel trend-panel"><div className="panel-heading"><div><span className="section-kicker">SATELLITE OBSERVATION</span><h2>Vegetation health <span className="ndvi-tag">NDVI</span></h2></div><button className="select-chip">All fields <ChevronDown size={14}/></button></div><div className="chart-caption"><span><i className="legend-dot"/>This season</span><span>Field average <b>0.72</b> <em><ArrowUpRight size={13}/> 6.4%</em></span></div><div className="chart"><div className="ylabels"><span>.9</span><span>.7</span><span>.5</span><span>.3</span></div><div className="chart-main"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/><svg viewBox="0 0 640 150" preserveAspectRatio="none" role="img" aria-label="Vegetation health rose steadily over the past five weeks"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--palette-72ae61)" stopOpacity=".19"/><stop offset="100%" stopColor="var(--palette-72ae61)" stopOpacity="0"/></linearGradient></defs><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20 L640,150 L0,150Z" fill="url(#chartFill)"/><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20" fill="none" stroke="var(--palette-6aa15b)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/><circle cx="640" cy="20" r="5" fill="var(--surface)" stroke="var(--palette-6aa15b)" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="xlabels"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span></div></div></div><div className="chart-foot"><span><i className="satellite-dot"/>Last satellite pass: 2 days ago</span><span>Sample data</span></div></section>
  <section className="panel weather-panel"><div className="panel-heading"><div><span className="section-kicker">KHANNA, PUNJAB</span><h2>Next 5 days</h2></div><button className="more-btn"><MoreHorizontal size={19}/></button></div><div className="weather-summary"><div><b>28°</b><span>Partly cloudy</span></div><CloudSun size={42} strokeWidth={1.4}/></div><div className="weather-stats"><span><Droplets size={15}/> 62% humidity</span><span><Wind size={15}/> 11 km/h wind</span></div><div className="forecast">{[['TUE','☀','29°','19°'],['WED','🌤','27°','18°'],['THU','🌧','24°','17°'],['FRI','🌦','25°','18°'],['SAT','☀','28°','19°']].map(d=><div className="forecast-day" key={d[0]}><small>{d[0]}</small><span>{d[1]}</span><b>{d[2]}</b><i>{d[3]}</i></div>)}</div><div className="weather-advice"><span><Droplets size={15}/></span><p><b>Rain likely Thursday</b> — consider holding irrigation until after the shower.</p></div></section></div>
  <div className="privacy-strip"><ShieldCheck size={17}/><span><b>Built for your land, wherever it is.</b> Field insights adapt to your region and local growing practices.</span><button onClick={() => onPage('network')}>About the network <ArrowRight size={14}/></button></div>
  </>; }
function Stat({label,value,unit,delta,icon:Icon,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{unit}</small></div><div className="stat-delta">{delta}</div><div className={`stat-spark ${tone}`}><svg viewBox="0 0 90 30" preserveAspectRatio="none"><path d="M0 23 C12 22 14 19 24 21 S36 25 46 13 S60 16 67 11 S79 14 90 4" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg></div></div>; }
function Diagnostics({image,diagnosis,busy,inputRef,onFile,crops,selectedCrop,onCropChange}) { return <div className="feature-grid"><section className="panel feature-main" data-read-id={diagnosis ? "diagnosis" : "diagnosis-prompt"}><div className="panel-heading"><div><span className="section-kicker">AI CROP CHECK</span><h2>Photo diagnosis</h2></div><span className="demo-badge">DEMO ANALYSIS</span></div><p className="feature-intro">Take a clear photo of the affected leaf. We’ll check for common crop health signals and suggest what to do next.</p>{crops.length>1&&<label className="diagnostic-crop">Crop for this check<select value={selectedCrop||crops[0]} onChange={event=>onCropChange(event.target.value)}>{crops.map(crop=><option key={crop} value={crop}>{crop}</option>)}</select></label>}<div className={`upload-zone ${image?'has-image':''}`} onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();onFile(e.dataTransfer.files?.[0]);}}>{image?<img src={image} alt="Selected crop for analysis"/>:<><span className="upload-icon"><FileImage size={25}/></span><b>Drop a leaf photo here</b><span>or browse files from your device</span><button className="outline-btn"><Upload size={15}/> Choose photo</button><small>JPG or PNG · up to 10 MB</small></>}<input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>onFile(e.target.files?.[0])}/></div>{busy&&<div className="result-card loading"><div className="spinner"/><div><b>Checking your photo…</b><p>Demo analysis in progress</p></div></div>}{diagnosis&&<div className="result-card"><span className="result-check"><Check size={18}/></span><div className="result-copy"><div className="result-overline">POSSIBLE MATCH <span>DEMO</span></div><b>{diagnosis.title}</b><p>{diagnosis.advice}</p></div><div className="confidence"><b>{diagnosis.confidence}</b><small>confidence</small></div></div>}<div className="diagnosis-note"><ShieldCheck size={15}/><span>This demo result is for illustration only. Confirm diagnoses with a local agronomist before treatment.</span></div></section><aside className="panel side-tips"><span className="section-kicker">FOR A CLEARER CHECK</span><h2>Photo tips</h2><div className="tip-item"><span>01</span><div><b>Get close</b><p>Fill the frame with the affected leaf.</p></div></div><div className="tip-item"><span>02</span><div><b>Use natural light</b><p>Avoid shadows and direct glare.</p></div></div><div className="tip-item"><span>03</span><div><b>Show both sides</b><p>Include the leaf surface and underside.</p></div></div><div className="tip-callout"><Leaf size={17}/><p>Some symptoms look alike. Local expertise helps you choose the right next step.</p></div></aside></div>; }
function Fields({fields,onAdd}) { return <section className="panel full-panel" data-read-id="fields-intro"><div className="panel-heading"><div><span className="section-kicker">FARM OVERVIEW</span><h2>Field health at a glance</h2></div><button className="primary-btn" onClick={onAdd}><Plus size={16}/> Add field</button></div><p className="feature-intro">Sample field observations are shown for this MVP.</p><div className="table-head"><span>FIELD</span><span>HEALTH</span><span>VEGETATION INDEX</span><span>SOIL MOISTURE</span><span>STATUS</span></div>{fields.map((f,i)=><div className="table-row" key={f.name} data-read-id={`field-${f.name}`}><div className="table-field"><span className={`table-thumb thumb-${i%3}`}><Wheat size={18}/></span><span><b>{f.name}</b><small title={(f.crops||[]).join(', ')}>{formatCropSummary(f)} · {f.area} ha</small></span></div><div className="table-health">{f.health}%</div><div>{f.ndvi} <span className="muted-text">NDVI</span></div><div>{f.water}</div><div><span className={`table-status ${f.color}`}><i/> {f.status}</span></div></div>)}</section>; }
function Climate() { return <div className="feature-grid climate-grid"><section className="panel feature-main"><div className="panel-heading"><div><span className="section-kicker">LOCAL CONDITIONS · KHANNA</span><h2>Water plan</h2></div><span className="demo-badge">SAMPLE FORECAST</span></div><div className="big-weather" data-read-id="weather"><CloudSun size={55} strokeWidth={1.3}/><div><b>28°</b><span>Partly cloudy · Feels like 30°</span></div><div className="weather-location"><MapPin size={14}/> Punjab, India</div></div><div className="week-strip">{[['Today','☀','28°','Dry'],['Tue','☀','29°','Dry'],['Wed','🌤','27°','Cloudy'],['Thu','🌧','24°','12 mm rain'],['Fri','🌦','25°','Light rain'],['Sat','☀','28°','Dry'],['Sun','☀','30°','Dry']].map(x=><div key={x[0]}><small>{x[0]}</small><span>{x[1]}</span><b>{x[2]}</b><i>{x[3]}</i></div>)}</div><div className="irrigation-card" data-read-id="irrigation"><div className="irrigation-icon"><Droplets size={20}/></div><div><span className="section-kicker">SUGGESTED IRRIGATION</span><h3>Wait until after Thursday’s rain</h3><p>Sample guidance: check soil moisture again Friday morning before irrigating North Field.</p></div><span className="recommend-tag">SAMPLE</span></div></section><aside className="panel side-tips"><span className="section-kicker">FIELD CONDITIONS</span><h2>What to watch</h2><div className="condition-row"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><b>Soil moisture</b><p>Moderate · River Bend</p></div><span className="condition-tag">CHECK</span></div><div className="condition-row"><span className="note-icon peach-icon"><Thermometer size={17}/></span><div><b>Temperature</b><p>28° now · 30° high</p></div></div><div className="condition-row"><span className="note-icon mint"><Wind size={17}/></span><div><b>Wind</b><p>11 km/h · Light breeze</p></div></div><div className="tip-callout"><ShieldCheck size={17}/><p>Forecast and irrigation values are sample data. Connect a local weather provider for live advice.</p></div></aside></div>; }
function Network({country}) { return <div className="network-layout"><section className="panel network-hero" data-read-id="network"><span className="network-orb"><Globe2 size={34}/></span><span className="section-kicker">SOVEREIGN BY DESIGN</span><h2>Local knowledge.<br/><em>Shared progress.</em></h2><p>Fieldwise is designed to let participating regions improve agricultural models together while keeping raw farm data within local boundaries.</p><div className="network-stats"><div><b>05</b><span>Participating regions</span></div><div><b>01</b><span>Shared model registry</span></div><div><b>0</b><span>Raw farm records shared</span></div></div></section><section className="panel network-detail"><div className="panel-heading"><div><span className="section-kicker">REGIONAL NODES</span><h2>Network status</h2></div><span className="live-pill"><i/> DESIGN PREVIEW</span></div><p className="feature-intro">Example deployment status. No live federated training is connected in this MVP.</p>{[['India','IND','Punjab node · local data boundary','Active'],['Brazil','BRA','Cerrado node · local data boundary','Planned'],['China','CHN','Regional node · local data boundary','Planned'],['Russia','RUS','Regional node · local data boundary','Planned'],['South Africa','ZAF','Regional node · local data boundary','Planned']].map((r,i)=><div className="node-row" key={r[0]}><span className="country-flag">{['🇮🇳','🇧🇷','🇨🇳','🇷🇺','🇿🇦'][i]}</span><div><b>{r[0]}</b><small>{r[2]}</small></div><span className={`node-status ${i===0?'node-active':''}`}><i/>{r[3]}</span></div>)}<div className="network-callout"><ShieldCheck size={17}/><p><b>Designed for data sovereignty</b><br/>In a production system, only reviewed model updates would leave a regional node. Farmer records remain local.</p></div></section><div className="network-foot"><span>Current region: <b>{country}</b></span><span>Prototype status · Model exchange not connected</span></div></div>; }

export default App;
