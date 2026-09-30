import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Cloud, CloudSun, Droplets, Eye, EyeOff, FileImage, Globe2, HelpCircle, Info, Leaf, LogOut, MapPin, Menu, Moon, MoreHorizontal, Pause, Play, Plus, ScanLine, Search, Settings, ShieldCheck, SkipBack, SkipForward, Sprout, Sun, Thermometer, TriangleAlert, Upload, Users, Volume2, VolumeX, Wheat, Wind, X } from 'lucide-react';
import { getRememberedUsername, getSessionUser, isAuthenticated, login, logout, setRememberedUsername, signup } from './auth.js';
import { buildReadingQueue, speechLanguageCodes } from './speechService.js';
import i18n from './i18n/i18n.js';
import { useReadAloud } from './useReadAloud.js';
import CommunityPage from './community/CommunityPage.jsx';
import { communityData } from './community/communityService.js';
import { useDiagnosis } from './hooks/useDiagnosis.js';
import { DiagnosisResult, PhotoUploader } from './components/DiagnosisComponents.jsx';
import { getLanguageGlyph, SHOW_LANG_CODE } from './i18n/languageGlyphs.js';
import { countryLanguages, getLanguagesForCountry, languageCatalog, labelToLanguageCode, languageCodeToLabel } from './i18n/languageCatalog.js';

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { window.localStorage.setItem('fieldwise-theme', theme); } catch { /* Storage may be unavailable. */ }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1f2d26' : '#f6f7f2');
}

const initialFields = [
  { name: 'North Field', crops: ['Wheat'], area: 8.4, health: 87, statusKey: 'fields.statuses.healthy', color: 'green', ndvi: '.78', water: 'Good' },
  { name: 'River Bend', crops: ['Soybean'], area: 5.2, health: 62, statusKey: 'fields.statuses.attention', color: 'amber', ndvi: '.54', water: 'Moderate' },
  { name: 'Orchard East', crops: ['Tomato'], area: 2.1, health: 91, statusKey: 'fields.statuses.healthy', color: 'green', ndvi: '.84', water: 'Good' },
];
const cropOptions = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane', 'Mustard', 'Soybean', 'Tomato', 'Potato', 'Onion', 'Chickpea', 'Sunflower', 'Groundnut', 'Millet', 'Barley', 'Lentil', 'Pigeon pea', 'Sorghum', 'Tea', 'Coffee', 'Apple', 'Mango', 'Banana', 'Chili pepper', 'Cabbage', 'Cauliflower'];
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

function formatCropSummary(field, translate) {
  const crops = field.crops || [];
  if (!crops.length) return translate('fields.cropNotSet');
  const shown = crops.slice(0, 2).map(crop => translate(`crops.${crop}`, { defaultValue: crop })).join(', ');
  return crops.length > 2 ? `${shown} +${crops.length - 2}` : shown;
}
const nav = [{ id: 'overview', icon: Activity }, { id: 'diagnostics', icon: ScanLine }, { id: 'fields', icon: MapPin }, { id: 'climate', icon: CloudSun }, { id: 'community', icon: Users }, { id: 'network', icon: Globe2 }];
const pagePaths = { overview: '/', diagnostics: '/diagnostics', fields: '/fields', climate: '/climate', community: '/community', network: '/network', login: '/login' };
const pageFromLocation = () => Object.entries(pagePaths).find(([, path]) => path === window.location.pathname)?.[0] || 'overview';

class RouteErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error(`Route "${this.props.page}" failed to render.`, error, info); }
  render() {
    if (this.state.hasError) return <section className="route-error" role="alert"><div className="route-error-mark"><CircleAlert size={22}/></div><h2>{this.props.title}</h2><p>{this.props.description}</p><button className="primary-btn" onClick={this.props.onGoDashboard}>{this.props.button}</button></section>;
    return this.props.children;
  }
}


const alertData = [
  { id: 'storm-khanna', severity: 'critical', priority: 'high', messageKey: 'heavyRain', actionKey: 'actionForecast', timestamp: '2026-09-29T08:15:00+05:30', actionHref: '#climate' },
  { id: 'river-bend-moisture', severity: 'warning', priority: 'high', messageKey: 'lowMoisture', actionKey: 'actionField', timestamp: '2026-09-29T07:45:00+05:30', actionHref: '#fields' },
  { id: 'leaf-spot-river-bend', severity: 'warning', priority: 'high', messageKey: 'leafSpot', actionKey: 'actionDiagnosis', timestamp: '2026-09-29T06:30:00+05:30', actionHref: '#diagnostics' },
  { id: 'weekly-report', severity: 'info', priority: 'normal', messageKey: 'weeklyReport', actionKey: 'actionReport', timestamp: '2026-09-28T17:00:00+05:30', actionHref: '#fields' },
];

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
  const { t } = useTranslation();
  return <>
    {!speech.supported ? <div className="speech-support-message" role="status" aria-live="polite">{t('readAloud.unsupported')}</div> : <div className={`read-aloud-player ${speech.state !== 'idle' ? 'playing' : ''}`}>
      {showHint && speech.state === 'idle' && <div className="listen-hint">{t('readAloud.hint')}</div>}
      {speech.state === 'idle' ? <button className="listen-main" onClick={onListen} aria-label={t('readAloud.listenPage')} title={t('readAloud.listenPage')} aria-pressed="false"><Volume2 size={24}/><span>{t('readAloud.listen')}</span></button> : <div className="listen-controls" role="group" aria-label={t('readAloud.controls')}>
        <span className="listen-wave" aria-hidden="true"><i/><i/><i/></span>
        <button className="listen-control" onClick={speech.previous} aria-label={t('readAloud.previous')}><SkipBack size={18}/><span>{t('readAloud.previous')}</span></button>
        {speech.state === 'playing' ? <button className="listen-control primary" onClick={speech.pause} aria-label={t('readAloud.pause')}><Pause size={18}/><span>{t('readAloud.pause')}</span></button> : <button className="listen-control primary" onClick={speech.resume} aria-label={t('readAloud.resume')}><Play size={18}/><span>{t('readAloud.resume')}</span></button>}
        <button className="listen-control" onClick={speech.next} aria-label={t('readAloud.next')}><SkipForward size={18}/><span>{t('readAloud.next')}</span></button>
        <button className="listen-control" onClick={speech.stop} aria-label={t('readAloud.stop')}><VolumeX size={18}/><span>{t('readAloud.stop')}</span></button>
        <button className="listen-speed" onClick={speech.toggleSpeed} aria-label={t('readAloud.speedLabel',{speed:t(speech.speed === 'slow' ? 'readAloud.slow' : 'readAloud.normal')})}>{t(speech.speed === 'slow' ? 'readAloud.slow' : 'readAloud.normal')}</button>
      </div>}
      {speech.notice && <span className="speech-notice" role="status" aria-live="polite">{speech.notice}</span>}
      <span className="sr-only" aria-live="polite">{t(`speech.state.${speech.state}`)}</span>
    </div>}
  </>;
}

function SettingsModal({ autoReadCritical, onAutoReadChange, onClose }) {
  const { t } = useTranslation();
  return <div className="modal-backdrop" onClick={onClose}><section className="modal read-settings" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={event => event.stopPropagation()}>
    <button type="button" className="modal-close" onClick={onClose} aria-label={t('settings.close')}><X size={18}/></button><span className="modal-icon"><Settings size={19}/></span><h2 id="settings-title">{t('settings.title')}</h2><p>{t('settings.description')}</p>
    <label className="auto-read-setting"><input type="checkbox" checked={autoReadCritical} onChange={event => onAutoReadChange(event.target.checked)}/><span><b>{t('settings.autoRead')}</b><small>{t('settings.autoReadDescription')}</small></span></label>
    <button type="button" className="primary-btn modal-submit" onClick={onClose}>{t('common.done')}</button>
  </section></div>;
}

function App() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  }, [i18n.resolvedLanguage, t]);
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
  const language = languageCodeToLabel(i18n.resolvedLanguage || i18n.language || 'en', country);
  const changeLanguage = useCallback(value => {
    const code = languageCatalog[value]?.code || labelToLanguageCode[value] || value;
    return i18n.changeLanguage(code);
  }, [i18n]);
  const [fields, setFields] = useState(loadFields);
  const [communityNarration, setCommunityNarration] = useState(communityData);
  const handleCommunityDataChange = useCallback(data => setCommunityNarration(current => ({ ...current, ...data })), []);
  const [diagnosticCrop, setDiagnosticCrop] = useState(() => loadFields()[0]?.crops?.[0] || '');
  const diagnosisFlow = useDiagnosis();
  const { image, status: diagnosisStatus, result: diagnosisResult, error: diagnosisError, analysesUsed } = diagnosisFlow;
  const [diagnosisAlert, setDiagnosisAlert] = useState(null);
  const [savedDiagnosisNotes, setSavedDiagnosisNotes] = useState(() => { try { return JSON.parse(window.localStorage.getItem('fieldwise-diagnosis-notes') || '[]'); } catch { return []; } });
  const diagnosis = diagnosisResult ? { ...diagnosisResult, title: diagnosisResult.disease?.commonName || diagnosisResult.disease?.name || 'Uncertain result', confidence: `${Math.round(diagnosisResult.confidence * 100)}%`, advice: diagnosisResult.treatment?.[0] || diagnosisResult.description || 'Review the full guidance below.' } : null;
  const busy = diagnosisStatus === 'loading';
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
      window.localStorage.setItem('fieldwise-language', i18n.resolvedLanguage || i18n.language || 'en');
    } catch { /* Storage may be unavailable in private browsing contexts. */ }
  }, [country, language, i18n.language, i18n.resolvedLanguage]);
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
    if (!localLanguages.includes(language)) changeLanguage(localLanguages[0]);
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
  const analyze = (file) => diagnosisFlow.selectFile(file);
  const runDiagnosis = async () => {
    const result = await diagnosisFlow.analyze(i18n.resolvedLanguage || i18n.language || 'en');
    if (result?.severity && /high|severe|critical/i.test(String(result.severity)) && result.confidence >= 0.8) {
      setDiagnosisAlert({ id: `diagnosis-${Date.now()}`, severity: 'warning', priority: 'high', messageKey: 'diagnosisRisk', messageValues: { disease: result.disease?.name || t('diagnostics.cropDisease') }, actionKey: 'actionDiagnosis', timestamp: new Date().toISOString(), actionHref: '#diagnostics' });
    }
  };
  const saveDiagnosisNote = (fieldName) => {
    const note = { id: `diagnosis-note-${Date.now()}`, fieldName, crop: diagnosisResult?.crop || diagnosticCrop, title: diagnosisResult?.disease?.name, titleKey: diagnosisResult?.disease?.name ? null : 'diagnostics.healthyCheck', confidence: Math.round((diagnosisResult?.confidence || 0) * 100), createdAt: new Date().toISOString() };
    setSavedDiagnosisNotes(current => { const next = [note, ...current]; try { window.localStorage.setItem('fieldwise-diagnosis-notes', JSON.stringify(next)); } catch { /* Notes remain available for this session. */ } return next; });
    notify(t('diagnostics.savedToNotes'));
  };
  const addField = (data) => { setFields(current => [...current, normalizeField({ name: data.name, crops: data.crops, area: data.area, health: 80, statusKey: 'fields.statuses.healthy', color: 'green', ndvi: '.71', water: 'Good' })]); setShowFieldForm(false); notify(t('fields.fieldAdded')); };
  const selected = t(`sidebar.${page === 'diagnostics' ? 'diagnostics' : page === 'fields' ? 'fields' : page === 'climate' ? 'climate' : page === 'community' ? 'community' : page === 'network' ? 'network' : 'overview'}`);
  const availableCrops = [...new Set(fields.flatMap(field => field.crops || []))];
  const allAlerts = diagnosisAlert ? [...alertData, diagnosisAlert] : alertData;
  const activeAlerts = [...getActiveAlerts(), ...(diagnosisAlert ? [diagnosisAlert] : [])].filter(alert => !dismissedAlertIds.includes(alert.id));
  const speechQueue = useMemo(() => buildReadingQueue({
    page, userName: currentUser?.fullName?.split(/\s+/)[0], date: new Intl.DateTimeFormat(speechLanguageCodes[language] || 'en-IN', { dateStyle: 'long' }).format(new Date()),
    fields, activeAlerts: activeAlerts.map(alert => ({ ...alert, speechText: t(`alerts.${alert.messageKey}`, alert.messageValues) })), notifications: activeAlerts.map(alert => ({ ...alert, speechText: t(`alerts.${alert.messageKey}`, alert.messageValues) })),
    language, diagnosis, diagnosticCrop, community: page === 'community' ? communityNarration : undefined, weather: { temperature: 28, condition: t('speech.conditionPartlyCloudy'), rainDay: t('speech.dayThursday'), rainAmount: 12 },
  }), [page, currentUser, fields, activeAlerts, language, diagnosis, diagnosticCrop, communityNarration, t]);
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
      window.setTimeout(() => speech.start([{ id: `alert-${newAlert.id}`, text: t(`alerts.${newAlert.messageKey}`) }]), 350);
    }
    previousCriticalIdsRef.current = critical.map(alert => alert.id);
  }, [activeAlerts, autoReadCritical, language, speech.supported, speech.start]);
  const completeLogin = (user) => { setCurrentUser(user); setPage('overview'); };
  const handleLogout = () => { logout(); setCurrentUser(null); setPage('login'); setProfileMenuOpen(false); };
  if (!currentUser) return <AuthScreen language={language} country={country} theme={theme} onToggleTheme={toggleTheme} onLogin={completeLogin}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sprout size={19}/></span><span>fieldwise<span className="brand-dot">.</span></span><button className="icon-btn close-menu" onClick={() => setMenuOpen(false)} aria-label={t('header.closeMenu')}><X size={18}/></button></div>
      <div className="farm-switch"><span className="farm-avatar">S</span><span className="farm-copy"><b>Sundar Farms</b><small>{t('sidebar.farmerWorkspace')}</small></span><ChevronDown size={15}/></div>
      <div className="nav-label">{t('sidebar.workspace')}</div>
      <nav>{nav.map(item => <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); }} className={`nav-item ${page === item.id ? 'active' : ''}`}><item.icon size={18}/><span>{t(`sidebar.${item.id}`)}</span>{item.id === 'diagnostics' && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><HelpCircle size={17}/></div><b>{t('sidebar.needHelp')}</b><p>{t('sidebar.guidance')}</p><button onClick={() => notify(t('sidebar.supportSoon'))}>{t('sidebar.contact')} <ArrowRight size={14}/></button></div><button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings size={18}/><span>{t('sidebar.settings')}</span></button><div className="profile"><div className="profile-avatar">{userInitials}</div><div><b>{currentUser.fullName}</b><small>{currentUser.username === 'arjun' ? 'Punjab, India' : t(`countries.${country}`, { defaultValue: country })}</small></div><button className="profile-menu-trigger" aria-label={t('sidebar.accountMenu')} title={t('sidebar.accountMenu')} aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(!profileMenuOpen)}><MoreHorizontal size={19}/></button>{profileMenuOpen && <div className="profile-menu"><button onClick={handleLogout}><LogOut size={15}/> {t('sidebar.logout')}</button></div>}</div></div>
    </aside>
    {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
    <main className="main-area">{page === 'overview' && activeAlerts.length > 0 && <AlertRibbon alerts={activeAlerts} language={language} onDismiss={dismissAlert} onNavigate={navigateToAlert} currentReadItem={speech.currentItem}/>}<header className="topbar"><button className="icon-btn menu-toggle" onClick={() => setMenuOpen(true)} aria-label={t('header.openMenu')}><Menu size={20}/></button><div className="crumb">{t('header.workspace')} <ChevronRight size={14}/> <b>{selected}</b></div><div className="top-actions"><div className="weather-pill" data-read-id="weather"><CloudSun size={17}/><span>{t('weather.temperature', { value: 28 })}</span><i>{t('weather.partlyCloudy')}</i></div><span className="top-divider"/><div className="notifications-wrap" ref={notificationsRef}><button className="icon-btn notification" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={t('header.openNotifications')} title={t('header.openNotifications')} aria-haspopup="true" aria-expanded={notificationsOpen}><Bell size={18}/>{activeAlerts.length > 0 && <i/>}</button>{notificationsOpen && <div className="notification-dropdown" role="region" aria-label={t('header.allNotifications')}><div className="notification-heading"><b>{t('header.notifications')}</b><span>{t('header.updates', { count: allAlerts.length })}</span></div>{[...allAlerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(alert => <div className="notification-item" key={alert.id} data-read-id={`notification-${alert.id}`}><span className={`notification-severity ${alert.severity}`}/><div><b>{t(`alerts.${alert.messageKey}`, alert.messageValues)}</b><small>{alert.priority === 'high' ? t('header.highPriority') : t('header.farmUpdate')} · {new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'short' }).format(new Date(alert.timestamp))}</small><button onClick={() => navigateToAlert(alert.actionHref)}>{t(`alerts.${alert.actionKey}`)} <ArrowRight size={12}/></button></div></div>)}</div>}</div><select className="country-select" value={country} onChange={e => changeCountry(e.target.value)} aria-label={t('header.chooseRegion')}><option value="India">{t('countries.India')}</option><option value="Brazil">{t('countries.Brazil')}</option><option value="China">{t('countries.China')}</option><option value="Russia">{t('countries.Russia')}</option><option value="South Africa">{t('countries.South Africa')}</option></select><LanguageSelector country={country} language={language}/><button className="icon-btn theme-toggle" onClick={toggleTheme} title={t(theme === 'dark' ? 'header.switchLight' : 'header.switchDark')} aria-label={t(theme === 'dark' ? 'header.switchLight' : 'header.switchDark')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>{speech.supported && <button className={`icon-btn read-aloud-header ${speech.state !== 'idle' ? 'is-speaking' : ''}`} onClick={handleReadAloud} title={t('header.listen')} aria-label={speech.state !== 'idle' ? t('header.stopReading') : t('header.listen')} aria-pressed={speech.state !== 'idle'}>{speech.state === 'idle' ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>}</div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow"><Sun size={14}/> {new Intl.DateTimeFormat(i18n.resolvedLanguage, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())} <span className="eyebrow-dot">·</span> {t('dashboard.khanna').toLocaleUpperCase(i18n.resolvedLanguage)}</div><h1>{page === 'overview' ? t(`dashboard.${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}`, { name: currentUser.fullName.split(/\s+/)[0] }) : selected}<span className="wave">{page === 'overview' ? ' ☀' : ''}</span></h1><p>{page === 'overview' ? t('dashboard.todaySummary') : page === 'diagnostics' ? t('dashboard.diagnosticsIntro') : page === 'network' ? t('dashboard.networkIntro') : page === 'climate' ? t('dashboard.climateIntro') : t('dashboard.fieldsIntro')}</p></div><button className="date-button"><ChevronLeft size={16}/> {t('dashboard.thisWeek')} <ChevronDown size={14}/></button></div>
      <RouteErrorBoundary key={page} page={selected} title={t('error.title',{page:selected})} description={t('error.description')} button={t('error.goDashboard')} onGoDashboard={() => setPage('overview')}>
        {page === 'overview' && <Overview fields={fields} onAdd={() => setShowFieldForm(true)} onPage={setPage} diagnosisNotes={savedDiagnosisNotes} />}
        {page === 'diagnostics' && <Diagnostics image={image} diagnosis={diagnosisResult} status={diagnosisStatus} error={diagnosisError} analysesUsed={analysesUsed} inputRef={inputRef} onFile={analyze} onAnalyze={runDiagnosis} onDemo={diagnosisFlow.useDemo} onReset={diagnosisFlow.reset} onListen={() => speech.start([{ id: 'diagnosis', text: `${diagnosis?.title || 'Crop health result'}, ${diagnosis?.confidence || ''}. ${diagnosis?.description || ''} ${diagnosis?.treatment?.join('. ') || ''}` }])} onSave={saveDiagnosisNote} onHelp={() => notify('Agronomist support will be available soon.')} fields={fields} crops={availableCrops} selectedCrop={diagnosticCrop} onCropChange={setDiagnosticCrop} language={language} />}
        {page === 'fields' && <Fields fields={fields} onAdd={() => setShowFieldForm(true)} />}
        {page === 'climate' && <Climate />}
        {page === 'community' && <CommunityPage language={language} onDataChange={handleCommunityDataChange}/>}
        {page === 'network' && <Network country={country} />}
      </RouteErrorBoundary>
      <footer className="footer"><span><ShieldCheck size={14}/> {t('footer.privacy')}</span><span>FIELDWISE <i>·</i> {t('footer.brandDescriptor')}</span></footer>
      </div>
    </main>
    {showFieldForm && <AddFieldModal language={language} onClose={() => setShowFieldForm(false)} onSubmit={addField}/>}
    {settingsOpen && <SettingsModal autoReadCritical={autoReadCritical} onAutoReadChange={setAutoReadCritical} onClose={() => setSettingsOpen(false)}/>}
    <ReadAloudPlayer speech={speech} onListen={handleReadAloud} showHint={showListenHint} language={language}/>
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

function LanguageSelector({ country, language }) {
  const { t, i18n } = useTranslation();
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
  const activeCode = i18n.resolvedLanguage || i18n.language || 'en';
  const activeGlyph = getLanguageGlyph(activeCode);
  const activeLanguageName = t(`languages.${activeCode}`, { defaultValue: languageCodeToLabel(activeCode, country) });
  const activeGlyphCode = activeCode.split('-')[0].toLowerCase();
  const selectLanguage = async (item) => {
    const code = languageCatalog[item]?.code || labelToLanguageCode[item] || 'en';
    try {
      await i18n.changeLanguage(code);
      try { window.localStorage.setItem('fieldwise-language', code); } catch { /* Language persistence is optional. */ }
      if (import.meta.env.DEV) console.info('[i18n] language changed', { requested: code, resolved: i18n.resolvedLanguage || i18n.language });
    } catch (error) {
      if (import.meta.env.DEV) console.error('[i18n] language change failed', { requested: code, error });
    }
  };
  return <div className="language-selector" ref={rootRef}>
    <button className={`icon-btn language-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label={t('language.change', { name: activeLanguageName })} title={t('language.change', { name: activeLanguageName })} aria-haspopup="dialog" aria-expanded={open}>
      {activeGlyph ? <span key={activeCode} className="language-glyph" lang={activeCode}>{activeGlyph}{SHOW_LANG_CODE && <small>{activeGlyphCode.toUpperCase()}</small>}</span> : <Globe2 size={18}/>}
    </button>
    {open && <div className="language-dropdown" role="dialog" aria-label={t('language.choose')}>
      <div className="language-menu-heading"><b>{t('language.title')}</b><span>{t('language.current', { name: activeLanguageName })}</span></div>
      {[{ title: t('language.localHeading', { country: t(`countries.${country}`, { defaultValue: country }) }), languages: languageGroups.localLanguages }, { title: t('language.networkHeading'), languages: languageGroups.networkLanguages }].map(group => <div className="language-group" key={group.title}>
        <div className="language-group-title">{group.title}</div>
        {group.languages.map(item => { const code = labelToLanguageCode[item] || languageCatalog[item]?.code || 'en'; const native = languageCatalog[item]?.native || item; const translatedName = t(`languages.${code}`, { defaultValue: item }); const selectedLanguage = languageCodeToLabel(activeCode) === item; const label = native === translatedName ? native : `${native} · ${translatedName}`; return <button key={item} role="button" aria-pressed={selectedLanguage} className={`language-option ${selectedLanguage ? 'selected' : ''}`} onClick={async () => { await selectLanguage(item); setOpen(false); }}><span lang={code}>{label}</span>{selectedLanguage && <Check size={15}/>}</button>; })}
      </div>)}
    </div>}
  </div>;
}

function AuthScreen({ language, country, theme, onToggleTheme, onLogin }) {
  const { t } = useTranslation();
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
      setError(missing.includes('username') ? 'auth.usernameRequired' : 'auth.passwordRequired');
      if (missing.includes('password')) passwordRef.current?.focus();
      return;
    }
    const result = login(username, password);
    if (!result.ok) {
      if (result.error === 'invalid-credentials') {
        setError('auth.invalidCredentials');
        setInvalidFields(['username', 'password']);
        setPassword('');
        window.setTimeout(() => passwordRef.current?.focus(), 0);
      } else {
        setError('auth.sessionSaveError');
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
        required: 'auth.completeFields',
        'password-short': 'auth.passwordShort',
        'password-mismatch': 'auth.passwordMismatch',
        'username-taken': 'auth.usernameTaken',
        storage: 'auth.accountSaveError',
      };
      setError(messages[result.error] || 'auth.accountCreateError');
      return;
    }
    setRememberedUsername(username, remember);
    setLoading(true);
    window.setTimeout(() => onLogin(result.user), 600);
  };

  const passwordField = (id, label, value, setter, autocomplete, inputRef = null, fieldKey = id) => <label className="auth-label" htmlFor={id}>{label}<span className={`auth-password-wrap ${invalidFields.includes(fieldKey) ? 'invalid' : ''}`}><input id={id} ref={inputRef} type={showPassword ? 'text' : 'password'} autoComplete={autocomplete} value={value} onChange={update(setter)} aria-invalid={invalidFields.includes(fieldKey)} required/><button type="button" className="password-visibility" onClick={() => setShowPassword(!showPassword)} aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>;

  return <div className="auth-shell">
    <header className="auth-topbar"><a className="brand auth-brand" href="#login" onClick={event => event.preventDefault()}><span className="brand-mark"><Sprout size={19}/></span><span>fieldwise<span className="brand-dot">.</span></span></a><div className="auth-top-actions"><LanguageSelector country={country} language={language}/><button className="icon-btn theme-toggle" onClick={onToggleTheme} title={t(theme === 'dark' ? 'header.switchLight' : 'header.switchDark')} aria-label={t(theme === 'dark' ? 'header.switchLight' : 'header.switchDark')}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
    <main className="auth-main"><section className="auth-card">
      <div className="auth-heading"><span className="section-kicker">{t('auth.brandKicker')}</span><h1>{t(mode === 'login' ? 'auth.welcomeBack' : 'auth.joinTitle')}</h1><p>{t(mode === 'login' ? 'auth.loginIntro' : 'auth.signupIntro')}</p></div>
      <div className="auth-tabs" role="tablist" aria-label={t('auth.accountAccess')}><button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setInvalidFields([]); }}>{t('auth.loginTab')}</button><button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setInvalidFields([]); }}>{t('auth.signupTab')}</button></div>
      {error && <div className="auth-error" role="alert" aria-live="polite"><CircleAlert size={16}/><span>{t(error)}</span></div>}
      {mode === 'login' ? <form className="auth-form" onSubmit={handleLogin} noValidate>
        <label className="auth-label" htmlFor="login-username">{t('auth.username')}<input id="login-username" className={invalidFields.includes('username') ? 'invalid' : ''} type="text" autoComplete="username" value={username} onChange={update(setUsername)} aria-invalid={invalidFields.includes('username')} required/></label>
        {passwordField('login-password', t('auth.password'), password, setPassword, 'current-password', passwordRef, 'password')}
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/> <span>{t('auth.rememberMe')}</span></label>
        <button className="primary-btn auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner"/> {t('auth.loggingIn')}</> : t('auth.loginTab')}</button>
      </form> : <form className="auth-form" onSubmit={handleSignup} noValidate>
        <label className="auth-label" htmlFor="signup-fullname">{t('auth.fullName')}<input id="signup-fullname" className={invalidFields.includes('fullName') ? 'invalid' : ''} type="text" autoComplete="name" value={fullName} onChange={update(setFullName)} aria-invalid={invalidFields.includes('fullName')} required/></label>
        <label className="auth-label" htmlFor="signup-username">{t('auth.username')}<input id="signup-username" className={invalidFields.includes('username') ? 'invalid' : ''} type="text" autoComplete="username" value={username} onChange={update(setUsername)} aria-invalid={invalidFields.includes('username')} required/></label>
        {passwordField('signup-password', t('auth.password'), password, setPassword, 'new-password', null, 'password')}
        {passwordField('signup-confirm-password', t('auth.confirmPassword'), confirmPassword, setConfirmPassword, 'new-password', null, 'confirmPassword')}
        <label className="remember-row"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}/> <span>{t('auth.rememberMe')}</span></label>
        <button className="primary-btn auth-submit" type="submit" disabled={loading}>{loading ? <><span className="auth-spinner"/> {t('auth.creatingAccount')}</> : t('auth.createAccount')}</button>
      </form>}
      <div className="auth-note"><ShieldCheck size={14}/><span>{t('auth.privacyNote')}</span></div>
    </section></main>
  </div>;
}

function AlertRibbon({ alerts, language, onDismiss, onNavigate, currentReadItem }) {
  const { t } = useTranslation();
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
  const actionLabel = t(`alerts.${alert.actionKey}`);
  return <div className={`alert-ribbon ${alert.severity} ${leaving ? 'leaving' : ''}`} data-read-id={`alert-${alert.id}`} role={alert.severity === 'critical' ? 'alert' : 'status'} aria-live={alert.severity === 'critical' ? 'assertive' : 'polite'} aria-atomic="true">
    <Icon className="alert-ribbon-icon" size={18} aria-hidden="true"/>
    <span className="alert-ribbon-message">{t(`alerts.${alert.messageKey}`, alert.messageValues)}</span>
    <a className="alert-ribbon-action" href={alert.actionHref} onClick={event => { event.preventDefault(); onNavigate(alert.actionHref); }}>{actionLabel} <ArrowRight size={13}/></a>
    {alerts.length > 1 && <div className="alert-ribbon-pager"><span>{t('alerts.counter',{current:currentIndex+1,total:alerts.length})}</span><button onClick={() => setIndex((currentIndex - 1 + alerts.length) % alerts.length)} aria-label={t('alerts.previous')}><ArrowLeft size={14}/></button><button onClick={() => setIndex((currentIndex + 1) % alerts.length)} aria-label={t('alerts.next')}><ArrowRight size={14}/></button></div>}
    <button className="alert-ribbon-close" onClick={dismiss} aria-label={t('alerts.dismiss')} title={t('alerts.dismiss')}><X size={16}/></button>
  </div>;
}

function AddFieldModal({ language, onClose, onSubmit }) {
  const { t } = useTranslation();
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
    <button type="button" className="modal-close" onClick={onClose} aria-label={t('fields.closeAddDialog')}><X size={18}/></button><span className="modal-icon"><MapPin size={20}/></span><h2 id="add-field-title">{t('fields.addField')}</h2><p>{t('fields.addIntro')}</p>
    <label>{t('fields.fieldName')}<input className={attempted && !name.trim() ? 'invalid' : ''} value={name} onChange={event => setName(event.target.value)} placeholder={t('fields.fieldPlaceholder')} autoFocus aria-invalid={attempted && !name.trim()}/></label>
    <div className="form-row"><label>{t('fields.crop')}<CropMultiSelect value={crops} onChange={setCrops} options={cropOptions} max={5} language={language} invalid={attempted && crops.length === 0}/>{attempted && crops.length === 0 && <small className="field-error">{t('fields.cropRequired')}</small>}</label><label>{t('fields.areaHectares')}<input className={attempted && !(Number(area) > 0) ? 'invalid' : ''} type="number" min="0.1" step="0.1" value={area} onChange={event => setArea(event.target.value)} placeholder="2.5" aria-invalid={attempted && !(Number(area) > 0)}/>{attempted && !(Number(area) > 0) && <small className="field-error">{t('fields.areaPositive')}</small>}</label></div>
    {attempted && !name.trim() && <small className="field-error name-error">{t('fields.nameRequired')}</small>}
    <button className="primary-btn modal-submit" type="submit">{t('fields.addField')} <ArrowRight size={16}/></button>
  </form></div>;
}

function CropMultiSelect({ value, onChange, options, max = 5, language, invalid = false }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listId = `crop-options-${useId().replace(/:/g, '')}`;

  const exists = name => value.some(crop => crop.toLocaleLowerCase() === name.trim().toLocaleLowerCase());
  const translated = name => t(`crops.${name}`, { defaultValue: name });
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
    <div className="crop-chip-list">{value.map(crop => <span className="crop-chip" key={crop}>{t(`crops.${crop}`,{defaultValue:crop})}<button type="button" aria-label={t('fields.removeCrop',{crop:t(`crops.${crop}`,{defaultValue:crop})})} onClick={() => onChange(value.filter(item => item !== crop))}><X size={12}/></button></span>)}
      <input ref={inputRef} role="combobox" aria-label={t('fields.crops')} aria-autocomplete="list" aria-expanded={open && suggestions.length > 0 && value.length < max} aria-controls={listId} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} value={query} disabled={value.length >= max} placeholder={value.length ? t('fields.addAnotherCrop') : t('fields.cropPlaceholder')} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(-1); }} onKeyDown={onKeyDown}/>
    </div>
    {open && value.length < max && suggestions.length > 0 && <ul className="crop-suggestions" id={listId} role="listbox">{suggestions.slice(0, 8).map((option, index) => <li id={`${listId}-${index}`} key={`${option.name}-${index}`} role="option" aria-selected={activeIndex === index} className={activeIndex === index ? 'active' : ''} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>{option.custom ? <>{filtered.length === 0 ? <>{t('fields.noMatchesAdd')} </> : <>{t('fields.addCustomCrop')} </>}<b>“{option.name}”</b></> : <>{translated(option.name)}{translated(option.name) !== option.name && <small>{option.name}</small>}</>}</li>)}</ul>}
    {value.length >= max && <small className="crop-limit">{t('fields.cropLimit',{count:max})}</small>}
  </div>;
}

function Overview({ fields, onAdd, onPage, diagnosisNotes = [] }) {
  const { t, i18n } = useTranslation();
  const stats = [
    { label: t('overview.stats.activeFields'), value: String(fields.length).padStart(2,'0'), unit: t('overview.stats.fields'), delta: t('overview.stats.area', { area: fields.reduce((sum, field) => sum + field.area, 0).toFixed(1) }), icon: MapPin, tone: 'mint' },
    { label: t('overview.stats.farmHealth'), value: '78', unit: t('overview.stats.outOf100'), delta: <><ArrowUpRight size={14}/> {t('overview.stats.pointsMonth', { count: 4 })}</>, icon: Leaf, tone: 'lime' },
    { label: t('overview.stats.rainExpected'), value: '12', unit: t('overview.stats.mm'), delta: t('overview.stats.rainDays'), icon: Cloud, tone: 'blue' },
    { label: t('overview.stats.waterSaved'), value: '18', unit: '%', delta: t('overview.stats.vsUsual'), icon: Droplets, tone: 'peach' },
  ];
  const weekDates = Array.from({ length: 5 }, (_, index) => new Date(Date.now() + (index + 1) * 86400000));
  return <>
    <section className="stats-grid" data-read-id="farm-summary">{stats.map((stat,index) => <Stat key={index} {...stat}/>)}</section>
    <div className="main-grid">
      <section className="panel field-panel"><div className="panel-heading"><div><span className="section-kicker">{t('overview.fieldMonitor')}</span><h2>{t('overview.yourFields')} <span className="count-badge">{fields.length}</span></h2></div><button className="text-action" onClick={() => onPage('fields')}>{t('common.viewAll')} <ArrowRight size={15}/></button></div>
        <div className="field-list">{fields.slice(0,3).map((field,index)=><div className="field-row" key={field.name} data-read-id={`field-${field.name}`}><div className={`field-thumb thumb-${index%3}`}><span>{index===0?'↗':index===1?'◌':'⌁'}</span><small>{field.ndvi} NDVI</small></div><div className="field-info"><b>{field.name}</b><span title={(field.crops||[]).map(crop=>t(`crops.${crop}`,{defaultValue:crop})).join(', ')}>{formatCropSummary(field,t)} · {field.area} {t('common.hectaresShort')}</span><div className="field-meta"><span className={`status-dot ${field.color}`}/><span className={field.color}>{t(field.statusKey || (field.health < 70 ? 'fields.statuses.attention' : 'fields.statuses.healthy'))}</span><i>·</i><span>{t('fields.soilMoisture')} {t(`fields.water.${String(field.water).toLowerCase()}`)}</span></div></div><div className="health-wrap"><div className="health-number">{field.health}<small>%</small></div><div className="health-track"><span style={{width:`${field.health}%`}} className={field.health<70?'amber':''}/></div></div><button className="row-arrow" onClick={() => onPage('fields')} aria-label={t('common.openField',{name:field.name})}><ArrowRight size={17}/></button></div>)}</div><button className="add-field" onClick={onAdd}><Plus size={16}/> {t('fields.addField')}</button>
      </section>
      <section className="panel care-panel"><div className="panel-heading"><div><span className="section-kicker">{t('overview.todayPriorities')}</span><h2>{t('overview.fieldNotes')} <span className="note-count">{2 + diagnosisNotes.length}</span></h2></div><button className="more-btn" aria-label={t('common.moreOptions')}><MoreHorizontal size={19}/></button></div>
        <div className="care-note urgent" data-read-id="note-leaf"><span className="note-icon amber-icon"><Leaf size={17}/></span><div><div className="note-label">{t('overview.cropHealth')} <span>· {t('overview.hoursAgo',{count:2})}</span></div><b>{t('overview.checkFieldCrop',{field:'River Bend',crop:t('crops.Soybean')})}</b><p>{t('overview.leafSpotDetected')}</p><button onClick={() => onPage('diagnostics')}>{t('diagnostics.reviewDiagnosis')} <ArrowRight size={14}/></button></div></div>
        <div className="care-note" data-read-id="note-water"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><div className="note-label">{t('overview.irrigation')} <span>· {t('overview.today')}</span></div><b>{t('overview.waterFieldTomorrow',{field:'North Field'})}</b><p>{t('overview.moistureLowWeather')}</p><button onClick={() => onPage('climate')}>{t('climate.seeWaterPlan')} <ArrowRight size={14}/></button></div></div>
        {diagnosisNotes.slice(0,3).map(note=><div className="care-note" key={note.id}><span className="note-icon mint"><Leaf size={17}/></span><div><div className="note-label">{t('overview.cropHealth')} <span>· {t('overview.saved')}</span></div><b>{note.fieldName}: {note.crop ? t(`crops.${note.crop}`,{defaultValue:note.crop}) : t(note.titleKey || 'diagnostics.healthyCheck')}</b><p>{note.title || t(note.titleKey || 'diagnostics.healthyCheck')} · {t('diagnostics.confidencePercent',{count:note.confidence})}</p><button onClick={() => onPage('diagnostics')}>{t('diagnostics.openDiagnostics')} <ArrowRight size={14}/></button></div></div>)}
      </section>
    </div>
    <div className="lower-grid"><section className="panel trend-panel"><div className="panel-heading"><div><span className="section-kicker">{t('vegetation.satelliteObservation')}</span><h2>{t('vegetation.title')} <span className="ndvi-tag">NDVI</span></h2></div><button className="select-chip">{t('common.allFields')} <ChevronDown size={14}/></button></div><div className="chart-caption"><span><i className="legend-dot"/>{t('vegetation.thisSeason')}</span><span>{t('vegetation.fieldAverage')} <b>0.72</b> <em><ArrowUpRight size={13}/> 6.4%</em></span></div><div className="chart"><div className="ylabels"><span>.9</span><span>.7</span><span>.5</span><span>.3</span></div><div className="chart-main"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/><svg viewBox="0 0 640 150" preserveAspectRatio="none" role="img" aria-label={t('vegetation.chartAlt')}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--palette-72ae61)" stopOpacity=".19"/><stop offset="100%" stopColor="var(--palette-72ae61)" stopOpacity="0"/></linearGradient></defs><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20 L640,150 L0,150Z" fill="url(#chartFill)"/><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20" fill="none" stroke="var(--palette-6aa15b)" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/><circle cx="640" cy="20" r="5" fill="var(--surface)" stroke="var(--palette-6aa15b)" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="xlabels">{[1,8,15,22,29].map(day=><span key={day}>{new Intl.DateTimeFormat(i18n.resolvedLanguage,{month:'short'}).format(new Date(2026,8,day))} {day}</span>)}</div></div></div><div className="chart-foot"><span><i className="satellite-dot"/>{t('vegetation.lastSatellitePass',{time:t('vegetation.daysAgo',{count:2})})}</span><span>{t('common.sampleData')}</span></div></section>
      <section className="panel weather-panel"><div className="panel-heading"><div><span className="section-kicker">{t('dashboard.khanna').toLocaleUpperCase(i18n.resolvedLanguage)}</span><h2>{t('forecast.nextDays',{count:5})}</h2></div><button className="more-btn" aria-label={t('common.moreOptions')}><MoreHorizontal size={19}/></button></div><div className="weather-summary"><div><b>28°</b><span>{t('weather.partlyCloudy')}</span></div><CloudSun size={42} strokeWidth={1.4}/></div><div className="weather-stats"><span><Droplets size={15}/> 62% {t('weather.humidity')}</span><span><Wind size={15}/> 11 km/h {t('weather.wind')}</span></div><div className="forecast">{[['Tue','☀','29°','19°'],['Wed','🌤','27°','18°'],['Thu','🌧','24°','17°'],['Fri','🌦','25°','18°'],['Sat','☀','28°','19°']].map((day,index)=><div className="forecast-day" key={day[0]}><small>{new Intl.DateTimeFormat(i18n.resolvedLanguage,{weekday:'short'}).format(weekDates[index])}</small><span>{day[1]}</span><b>{day[2]}</b><i>{day[3]}</i></div>)}</div><div className="weather-advice"><span><Droplets size={15}/></span><p><b>{t('weather.rainLikely',{day:t('weather.weekday.thursday')})}</b> — {t('weather.holdIrrigation')}</p></div></section></div>
    <div className="privacy-strip"><ShieldCheck size={17}/><span><b>{t('overview.privacyTitle')}</b> {t('overview.privacyCopy')}</span><button onClick={() => onPage('network')}>{t('overview.aboutNetwork')} <ArrowRight size={14}/></button></div>
  </>;
}
function Stat({label,value,unit,delta,icon:Icon,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{unit}</small></div><div className="stat-delta">{delta}</div><div className={`stat-spark ${tone}`}><svg viewBox="0 0 90 30" preserveAspectRatio="none"><path d="M0 23 C12 22 14 19 24 21 S36 25 46 13 S60 16 67 11 S79 14 90 4" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg></div></div>; }
function Diagnostics({ image, diagnosis, status, error, analysesUsed, inputRef, onFile, onAnalyze, onDemo, onReset, onListen, onSave, onHelp, fields, crops, selectedCrop, onCropChange, language }) {
  const { t } = useTranslation();
  const choose = file => onFile(file);
  const options = fields.map(field => field.name);
  const apiLanguage = diagnosis?.apiLanguage === 'pt' ? 'pt-BR' : diagnosis?.apiLanguage === 'zh' ? 'zh-CN' : diagnosis?.apiLanguage || 'en';
  const languageLabel = t(`languages.${apiLanguage}`,{defaultValue:t('languages.en')});
  const apiLanguageNote = diagnosis?.languageFallback ? t('diagnostics.apiEnglishFallback',{language:languageLabel}) : diagnosis ? t('diagnostics.apiLanguage',{language:languageLabel}) : t('diagnostics.apiLanguagesAvailable');
  return <div className="feature-grid"><section className="panel feature-main" data-read-id={diagnosis ? 'diagnosis' : 'diagnosis-prompt'}>
    <div className="panel-heading"><div><span className="section-kicker">{t('diagnostics.aiCropCheck')}</span><h2>{t('diagnostics.photoDiagnosis')}</h2></div><span className="demo-badge">{diagnosis?.demo ? t('diagnostics.demoResult') : 'crop.health'}</span></div>
    <p className="feature-intro">{t('diagnostics.intro')}</p>
    {crops.length > 0 && <label className="diagnostic-crop">{t('diagnostics.cropForCheck')}<select value={selectedCrop || crops[0]} onChange={event => onCropChange(event.target.value)}>{crops.map(crop => <option key={crop}>{t(`crops.${crop}`,{defaultValue:crop})}</option>)}</select></label>}
    <PhotoUploader image={image} status={status} error={error} analysesUsed={analysesUsed} onChoose={choose} onChange={() => inputRef.current?.click()} onAnalyze={onAnalyze} onDemo={onDemo}/>
    {diagnosis && <DiagnosisResult result={{ ...diagnosis, fieldOptions: options }} demo={diagnosis.demo} onSave={onSave} onListen={onListen} onHelp={onHelp}/>}
    <div className="diagnosis-note"><ShieldCheck size={15}/><span>{t('diagnostics.disclaimer')} {apiLanguageNote}</span></div>
    <input ref={inputRef} className="diagnosis-file-input" type="file" accept="image/jpeg,image/png" capture="environment" onChange={event => { choose(event.target.files?.[0]); event.target.value = ''; }}/>
  </section><aside className="panel side-tips"><span className="section-kicker">{t('diagnostics.clearerCheck')}</span><h2>{t('diagnostics.photoTips')}</h2><div className="tip-item"><span>01</span><div><b>{t('diagnostics.tipCloseTitle')}</b><p>{t('diagnostics.tipCloseCopy')}</p></div></div><div className="tip-item"><span>02</span><div><b>{t('diagnostics.tipLightTitle')}</b><p>{t('diagnostics.tipLightCopy')}</p></div></div><div className="tip-item"><span>03</span><div><b>{t('diagnostics.tipSidesTitle')}</b><p>{t('diagnostics.tipSidesCopy')}</p></div></div><div className="tip-callout"><Leaf size={17}/><p>{t('diagnostics.tipCallout')}</p></div></aside></div>;
}
function Fields({fields,onAdd}) {
  const {t}=useTranslation();
  return <section className="panel full-panel" data-read-id="fields-intro"><div className="panel-heading"><div><span className="section-kicker">{t('fields.overview')}</span><h2>{t('fields.healthAtGlance')}</h2></div><button className="primary-btn" onClick={onAdd}><Plus size={16}/> {t('fields.addField')}</button></div><p className="feature-intro">{t('fields.sampleObservations')}</p><div className="table-head"><span>{t('fields.field')}</span><span>{t('fields.health')}</span><span>{t('fields.vegetationIndex')}</span><span>{t('fields.soilMoisture')}</span><span>{t('fields.tableStatus')}</span></div>{fields.map((field,index)=><div className="table-row" key={field.name} data-read-id={`field-${field.name}`}><div className="table-field"><span className={`table-thumb thumb-${index%3}`}><Wheat size={18}/></span><span><b>{field.name}</b><small title={(field.crops||[]).map(crop=>t(`crops.${crop}`,{defaultValue:crop})).join(', ')}>{formatCropSummary(field,t)} · {field.area} {t('common.hectaresShort')}</small></span></div><div className="table-health">{field.health}%</div><div>{field.ndvi} <span className="muted-text">NDVI</span></div><div>{t(`fields.water.${String(field.water).toLowerCase()}`)}</div><div><span className={`table-status ${field.color}`}><i/> {t(field.statusKey || (field.health < 70 ? 'fields.statuses.attention' : 'fields.statuses.healthy'))}</span></div></div>)}</section>;
}
function Climate() {
  const {t,i18n}=useTranslation();
  const forecast=[['today','☀','28°','dry'],['tuesday','☀','29°','dry'],['wednesday','🌤','27°','cloudy'],['thursday','🌧','24°','rain'],['friday','🌦','25°','lightRain'],['saturday','☀','28°','dry'],['sunday','☀','30°','dry']];
  return <div className="feature-grid climate-grid"><section className="panel feature-main"><div className="panel-heading"><div><span className="section-kicker">{t('climate.localConditions')} · {t('dashboard.khanna')}</span><h2>{t('climate.waterPlan')}</h2></div><span className="demo-badge">{t('climate.sampleForecast')}</span></div><div className="big-weather" data-read-id="weather"><CloudSun size={55} strokeWidth={1.3}/><div><b>28°</b><span>{t('weather.partlyCloudy')} · {t('weather.feelsLike',{value:30})}</span></div><div className="weather-location"><MapPin size={14}/> {t('countries.India')}</div></div><div className="week-strip">{forecast.map((day,index)=><div key={day[0]}><small>{index===0?t('forecast.today'):new Intl.DateTimeFormat(i18n.resolvedLanguage,{weekday:'short'}).format(new Date(Date.now()+(index)*86400000))}</small><span>{day[1]}</span><b>{day[2]}</b><i>{t(`climate.${day[3]}`)}</i></div>)}</div><div className="irrigation-card" data-read-id="irrigation"><div className="irrigation-icon"><Droplets size={20}/></div><div><span className="section-kicker">{t('climate.suggestedIrrigation')}</span><h3>{t('climate.waitAfterRain')}</h3><p>{t('climate.guidance')}</p></div><span className="recommend-tag">{t('common.sample')}</span></div></section><aside className="panel side-tips"><span className="section-kicker">{t('climate.fieldConditions')}</span><h2>{t('climate.whatToWatch')}</h2><div className="condition-row"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><b>{t('climate.soilMoisture')}</b><p>{t('fields.water.moderate')} · River Bend</p></div><span className="condition-tag">{t('climate.check')}</span></div><div className="condition-row"><span className="note-icon peach-icon"><Thermometer size={17}/></span><div><b>{t('climate.temperature')}</b><p>{t('climate.temperatureRange',{now:28,high:30})}</p></div></div><div className="condition-row"><span className="note-icon mint"><Wind size={17}/></span><div><b>{t('climate.wind')}</b><p>{t('climate.windSpeed')}</p></div></div><div className="tip-callout"><ShieldCheck size={17}/><p>{t('climate.sampleNotice')}</p></div></aside></div>;
}
function Network({country}) {
 const {t}=useTranslation();
 const nodes=[['India','IND','India'],['Brazil','BRA','Brazil'],['China','CHN','China'],['Russia','RUS','Russia'],['South Africa','ZAF','South Africa']];
 return <div className="network-layout"><section className="panel network-hero" data-read-id="network"><span className="network-orb"><Globe2 size={34}/></span><span className="section-kicker">{t('network.sovereignDesign')}</span><h2>{t('network.heroTitle')}</h2><p>{t('network.heroCopy')}</p><div className="network-stats"><div><b>05</b><span>{t('network.regions')}</span></div><div><b>01</b><span>{t('network.modelRegistry')}</span></div><div><b>0</b><span>{t('network.recordsShared')}</span></div></div></section><section className="panel network-detail"><div className="panel-heading"><div><span className="section-kicker">{t('network.regionalNodes')}</span><h2>{t('network.status')}</h2></div><span className="live-pill"><i/> {t('network.designPreview')}</span></div><p className="feature-intro">{t('network.exampleStatus')}</p>{nodes.map(([name,code,region],index)=><div className="node-row" key={code}><span className="country-flag">{['🇮🇳','🇧🇷','🇨🇳','🇷🇺','🇿🇦'][index]}</span><div><b>{t(`countries.${name}`)}</b><small>{t(`network.node.${region}`)}</small></div><span className={`node-status ${index===0?'node-active':''}`}><i/>{t(index===0?'network.active':'network.planned')}</span></div>)}<div className="network-callout"><ShieldCheck size={17}/><p><b>{t('network.sovereigntyTitle')}</b><br/>{t('network.sovereigntyCopy')}</p></div></section><div className="network-foot"><span>{t('network.currentRegion')}: <b>{t(`countries.${country}`,{defaultValue:country})}</b></span><span>{t('network.prototypeStatus')}</span></div></div>;
}

export default App;
