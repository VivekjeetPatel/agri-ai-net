import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, Cloud, CloudSun, Droplets, FileImage, Globe2, HelpCircle, Leaf, MapPin, Menu, MoreHorizontal, Plus, ScanLine, Search, Settings, ShieldCheck, Sprout, Sun, Thermometer, Upload, Wheat, Wind, X } from 'lucide-react';

const initialFields = [
  { name: 'North Field', crop: 'Wheat · 8.4 ha', health: 87, status: 'Healthy', color: 'green', ndvi: '.78', water: 'Good' },
  { name: 'River Bend', crop: 'Soybean · 5.2 ha', health: 62, status: 'Needs attention', color: 'amber', ndvi: '.54', water: 'Moderate' },
  { name: 'Orchard East', crop: 'Tomato · 2.1 ha', health: 91, status: 'Healthy', color: 'green', ndvi: '.84', water: 'Good' },
];
const nav = [{ id: 'overview', icon: Activity, label: 'Overview' }, { id: 'diagnostics', icon: ScanLine, label: 'Crop diagnostics' }, { id: 'fields', icon: MapPin, label: 'My fields' }, { id: 'climate', icon: CloudSun, label: 'Climate & irrigation' }, { id: 'network', icon: Globe2, label: 'BRICS network' }];

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

function App() {
  const [page, setPage] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [country, setCountry] = useState(() => {
    try { const saved = window.localStorage.getItem('fieldwise-country'); return countryLanguages[saved] ? saved : 'India'; }
    catch { return 'India'; }
  });
  const [language, setLanguage] = useState(() => {
    try {
      const savedCountry = window.localStorage.getItem('fieldwise-country');
      const savedLanguage = window.localStorage.getItem('fieldwise-language');
      const initialCountry = countryLanguages[savedCountry] ? savedCountry : 'India';
      const allLanguages = [...new Set(Object.values(countryLanguages).flat())];
      return allLanguages.includes(savedLanguage) ? savedLanguage : getLanguagesForCountry(initialCountry).localLanguages[0];
    } catch { return 'Punjabi'; }
  });
  const [fields, setFields] = useState(initialFields);
  const [image, setImage] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    try {
      window.localStorage.setItem('fieldwise-country', country);
      window.localStorage.setItem('fieldwise-language', language);
    } catch { /* Storage may be unavailable in private browsing contexts. */ }
  }, [country, language]);
  const changeCountry = (nextCountry) => {
    const { localLanguages } = getLanguagesForCountry(nextCountry);
    if (!localLanguages.includes(language)) setLanguage(localLanguages[0]);
    setCountry(nextCountry);
  };
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const analyze = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.');
    setImage(URL.createObjectURL(file)); setDiagnosis(null); setBusy(true);
    setTimeout(() => { setBusy(false); setDiagnosis({ title: 'Possible leaf spot', confidence: '87%', advice: 'Remove heavily affected leaves and avoid overhead watering. Check again in 3–4 days.' }); }, 1100);
  };
  const addField = (e) => { e.preventDefault(); const d = new FormData(e.currentTarget); const name = d.get('name')?.trim(); if (!name) return; setFields([...fields, { name, crop: `${d.get('crop') || 'Mixed crop'} · ${d.get('area') || '1.0'} ha`, health: 80, status: 'Healthy', color: 'green', ndvi: '.71', water: 'Good' }]); setShowFieldForm(false); notify('Field added to your farm.'); };
  const selected = nav.find(x => x.id === page)?.label || 'Overview';
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sprout size={19}/></span><span>fieldwise<span className="brand-dot">.</span></span><button className="icon-btn close-menu" onClick={() => setMenuOpen(false)}><X size={18}/></button></div>
      <div className="farm-switch"><span className="farm-avatar">S</span><span className="farm-copy"><b>Sundar Farms</b><small>Farmer workspace</small></span><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} onClick={() => { setPage(item.id); setMenuOpen(false); }} className={`nav-item ${page === item.id ? 'active' : ''}`}><item.icon size={18}/><span>{item.label}</span>{item.id === 'diagnostics' && <span className="nav-count">2</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><HelpCircle size={17}/></div><b>Need a hand?</b><p>Get guidance from a local agronomist.</p><button onClick={() => notify('Agronomist support will be available soon.')}>Contact support <ArrowRight size={14}/></button></div><button className="nav-item" onClick={() => notify('Settings are coming soon.')}><Settings size={18}/><span>Settings</span></button><div className="profile"><div className="profile-avatar">AS</div><div><b>Arjun Singh</b><small>Punjab, India</small></div><MoreHorizontal size={19}/></div></div>
    </aside>
    {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}
    <main className="main-area"><header className="topbar"><button className="icon-btn menu-toggle" onClick={() => setMenuOpen(true)}><Menu size={20}/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{selected}</b></div><div className="top-actions"><div className="weather-pill"><CloudSun size={17}/><span>28°</span><i>Partly cloudy</i></div><span className="top-divider"/><button className="icon-btn notification" onClick={() => notify('You’re all caught up.')}><Bell size={18}/><i/></button><select className="country-select" value={country} onChange={e => changeCountry(e.target.value)} aria-label="Choose region"><option>India</option><option>Brazil</option><option>China</option><option>Russia</option><option>South Africa</option></select><LanguageSelector country={country} language={language} onLanguageChange={setLanguage}/></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow"><Sun size={14}/> MONDAY, 29 SEPTEMBER 2026 <span className="eyebrow-dot">·</span> KHANNA, PUNJAB</div><h1>{page === 'overview' ? 'Good morning, Arjun' : selected}<span className="wave">{page === 'overview' ? ' ☀' : ''}</span></h1><p>{page === 'overview' ? 'Here’s what’s happening across your farm today.' : page === 'diagnostics' ? 'Check crop health with a quick photo from your field.' : page === 'network' ? 'A shared learning network built on locally governed farm data.' : page === 'climate' ? 'Plan ahead with local weather and crop-specific water guidance.' : 'A clear view of crop health across your fields.'}</p></div><button className="date-button"><ChevronLeft size={16}/> This week <ChevronDown size={14}/></button></div>
      {page === 'overview' && <Overview fields={fields} onAdd={() => setShowFieldForm(true)} onPage={setPage} />}
      {page === 'diagnostics' && <Diagnostics image={image} diagnosis={diagnosis} busy={busy} inputRef={inputRef} onFile={analyze} />}
      {page === 'fields' && <Fields fields={fields} onAdd={() => setShowFieldForm(true)} />}
      {page === 'climate' && <Climate />}
      {page === 'network' && <Network country={country} />}
      <footer className="footer"><span><ShieldCheck size={14}/> Your farm data stays under your control</span><span>FIELDWISE <i>·</i> FARM INTELLIGENCE</span></footer>
      </div>
    </main>
    {showFieldForm && <div className="modal-backdrop" onClick={() => setShowFieldForm(false)}><form className="modal" onSubmit={addField} onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowFieldForm(false)}><X size={18}/></button><span className="modal-icon"><MapPin size={20}/></span><h2>Add a field</h2><p>Start tracking crop health and local conditions.</p><label>Field name<input name="name" placeholder="e.g. West Meadow" required autoFocus/></label><div className="form-row"><label>Crop<input name="crop" placeholder="e.g. Wheat"/></label><label>Area (hectares)<input name="area" type="number" min="0.1" step="0.1" placeholder="2.5"/></label></div><button className="primary-btn modal-submit" type="submit">Add field <ArrowRight size={16}/></button></form></div>}
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

function Overview({ fields, onAdd, onPage }) { return <>
  <section className="stats-grid"><Stat label="Active fields" value={String(fields.length).padStart(2,'0')} unit="fields" delta="Across 15.7 hectares" icon={MapPin} tone="mint"/><Stat label="Farm health" value="78" unit="/ 100" delta={<><ArrowUpRight size={14}/> 4 pts this month</>} icon={Leaf} tone="lime"/><Stat label="Rain expected" value="12" unit="mm" delta="Thursday · next 7 days" icon={Cloud} tone="blue"/><Stat label="Water saved" value="18" unit="%" delta="Vs. your usual schedule" icon={Droplets} tone="peach"/></section>
  <div className="main-grid"><section className="panel field-panel"><div className="panel-heading"><div><span className="section-kicker">FIELD MONITOR</span><h2>Your fields <span className="count-badge">{fields.length}</span></h2></div><button className="text-action" onClick={() => onPage('fields')}>View all <ArrowRight size={15}/></button></div><div className="field-list">{fields.slice(0,3).map((f,i)=><div className="field-row" key={f.name}><div className={`field-thumb thumb-${i%3}`}><span>{i===0?'↗':i===1?'◌':'⌁'}</span><small>{f.ndvi} NDVI</small></div><div className="field-info"><b>{f.name}</b><span>{f.crop}</span><div className="field-meta"><span className={`status-dot ${f.color}`}/><span className={f.color}>{f.status}</span><i>·</i><span>Soil moisture {f.water.toLowerCase()}</span></div></div><div className="health-wrap"><div className="health-number">{f.health}<small>%</small></div><div className="health-track"><span style={{width:`${f.health}%`}} className={f.health<70?'amber':''}/></div></div><button className="row-arrow" onClick={() => onPage('fields')}><ArrowRight size={17}/></button></div>)}</div><button className="add-field" onClick={onAdd}><Plus size={16}/> Add a field</button></section>
  <section className="panel care-panel"><div className="panel-heading"><div><span className="section-kicker">TODAY’S PRIORITIES</span><h2>Field notes <span className="note-count">2</span></h2></div><button className="more-btn"><MoreHorizontal size={19}/></button></div><div className="care-note urgent"><span className="note-icon amber-icon"><Leaf size={17}/></span><div><div className="note-label">CROP HEALTH <span>· 2 HOURS AGO</span></div><b>Check River Bend soybean</b><p>Possible leaf spot detected in your latest field photo.</p><button onClick={() => onPage('diagnostics')}>Review diagnosis <ArrowRight size={14}/></button></div></div><div className="care-note"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><div className="note-label">IRRIGATION <span>· TODAY</span></div><b>Water North Field tomorrow</b><p>Soil moisture is trending low ahead of warmer weather.</p><button onClick={() => onPage('climate')}>See water plan <ArrowRight size={14}/></button></div></div></section></div>
  <div className="lower-grid"><section className="panel trend-panel"><div className="panel-heading"><div><span className="section-kicker">SATELLITE OBSERVATION</span><h2>Vegetation health <span className="ndvi-tag">NDVI</span></h2></div><button className="select-chip">All fields <ChevronDown size={14}/></button></div><div className="chart-caption"><span><i className="legend-dot"/>This season</span><span>Field average <b>0.72</b> <em><ArrowUpRight size={13}/> 6.4%</em></span></div><div className="chart"><div className="ylabels"><span>.9</span><span>.7</span><span>.5</span><span>.3</span></div><div className="chart-main"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="gridline g4"/><svg viewBox="0 0 640 150" preserveAspectRatio="none" role="img" aria-label="Vegetation health rose steadily over the past five weeks"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#72ae61" stopOpacity=".19"/><stop offset="100%" stopColor="#72ae61" stopOpacity="0"/></linearGradient></defs><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20 L640,150 L0,150Z" fill="url(#chartFill)"/><path d="M0,100 C34,95 55,102 80,86 S130,80 160,83 S207,65 240,72 S295,79 320,56 S377,65 400,49 S458,58 480,37 S538,47 560,34 S608,35 640,20" fill="none" stroke="#6aa15b" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round"/><circle cx="640" cy="20" r="5" fill="#fff" stroke="#6aa15b" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg><div className="xlabels"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span></div></div></div><div className="chart-foot"><span><i className="satellite-dot"/>Last satellite pass: 2 days ago</span><span>Sample data</span></div></section>
  <section className="panel weather-panel"><div className="panel-heading"><div><span className="section-kicker">KHANNA, PUNJAB</span><h2>Next 5 days</h2></div><button className="more-btn"><MoreHorizontal size={19}/></button></div><div className="weather-summary"><div><b>28°</b><span>Partly cloudy</span></div><CloudSun size={42} strokeWidth={1.4}/></div><div className="weather-stats"><span><Droplets size={15}/> 62% humidity</span><span><Wind size={15}/> 11 km/h wind</span></div><div className="forecast">{[['TUE','☀','29°','19°'],['WED','🌤','27°','18°'],['THU','🌧','24°','17°'],['FRI','🌦','25°','18°'],['SAT','☀','28°','19°']].map(d=><div className="forecast-day" key={d[0]}><small>{d[0]}</small><span>{d[1]}</span><b>{d[2]}</b><i>{d[3]}</i></div>)}</div><div className="weather-advice"><span><Droplets size={15}/></span><p><b>Rain likely Thursday</b> — consider holding irrigation until after the shower.</p></div></section></div>
  <div className="privacy-strip"><ShieldCheck size={17}/><span><b>Built for your land, wherever it is.</b> Field insights adapt to your region and local growing practices.</span><button onClick={() => onPage('network')}>About the network <ArrowRight size={14}/></button></div>
  </>; }
function Stat({label,value,unit,delta,icon:Icon,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}<small>{unit}</small></div><div className="stat-delta">{delta}</div><div className={`stat-spark ${tone}`}><svg viewBox="0 0 90 30" preserveAspectRatio="none"><path d="M0 23 C12 22 14 19 24 21 S36 25 46 13 S60 16 67 11 S79 14 90 4" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg></div></div>; }
function Diagnostics({image,diagnosis,busy,inputRef,onFile}) { return <div className="feature-grid"><section className="panel feature-main"><div className="panel-heading"><div><span className="section-kicker">AI CROP CHECK</span><h2>Photo diagnosis</h2></div><span className="demo-badge">DEMO ANALYSIS</span></div><p className="feature-intro">Take a clear photo of the affected leaf. We’ll check for common crop health signals and suggest what to do next.</p><div className={`upload-zone ${image?'has-image':''}`} onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();onFile(e.dataTransfer.files?.[0]);}}>{image?<img src={image} alt="Selected crop for analysis"/>:<><span className="upload-icon"><FileImage size={25}/></span><b>Drop a leaf photo here</b><span>or browse files from your device</span><button className="outline-btn"><Upload size={15}/> Choose photo</button><small>JPG or PNG · up to 10 MB</small></>}<input ref={inputRef} type="file" accept="image/*" hidden onChange={e=>onFile(e.target.files?.[0])}/></div>{busy&&<div className="result-card loading"><div className="spinner"/><div><b>Checking your photo…</b><p>Demo analysis in progress</p></div></div>}{diagnosis&&<div className="result-card"><span className="result-check"><Check size={18}/></span><div className="result-copy"><div className="result-overline">POSSIBLE MATCH <span>DEMO</span></div><b>{diagnosis.title}</b><p>{diagnosis.advice}</p></div><div className="confidence"><b>{diagnosis.confidence}</b><small>confidence</small></div></div>}<div className="diagnosis-note"><ShieldCheck size={15}/><span>This demo result is for illustration only. Confirm diagnoses with a local agronomist before treatment.</span></div></section><aside className="panel side-tips"><span className="section-kicker">FOR A CLEARER CHECK</span><h2>Photo tips</h2><div className="tip-item"><span>01</span><div><b>Get close</b><p>Fill the frame with the affected leaf.</p></div></div><div className="tip-item"><span>02</span><div><b>Use natural light</b><p>Avoid shadows and direct glare.</p></div></div><div className="tip-item"><span>03</span><div><b>Show both sides</b><p>Include the leaf surface and underside.</p></div></div><div className="tip-callout"><Leaf size={17}/><p>Some symptoms look alike. Local expertise helps you choose the right next step.</p></div></aside></div>; }
function Fields({fields,onAdd}) { return <section className="panel full-panel"><div className="panel-heading"><div><span className="section-kicker">FARM OVERVIEW</span><h2>Field health at a glance</h2></div><button className="primary-btn" onClick={onAdd}><Plus size={16}/> Add field</button></div><p className="feature-intro">Sample field observations are shown for this MVP.</p><div className="table-head"><span>FIELD</span><span>HEALTH</span><span>VEGETATION INDEX</span><span>SOIL MOISTURE</span><span>STATUS</span></div>{fields.map((f,i)=><div className="table-row" key={f.name}><div className="table-field"><span className={`table-thumb thumb-${i%3}`}><Wheat size={18}/></span><span><b>{f.name}</b><small>{f.crop}</small></span></div><div className="table-health">{f.health}%</div><div>{f.ndvi} <span className="muted-text">NDVI</span></div><div>{f.water}</div><div><span className={`table-status ${f.color}`}><i/> {f.status}</span></div></div>)}</section>; }
function Climate() { return <div className="feature-grid climate-grid"><section className="panel feature-main"><div className="panel-heading"><div><span className="section-kicker">LOCAL CONDITIONS · KHANNA</span><h2>Water plan</h2></div><span className="demo-badge">SAMPLE FORECAST</span></div><div className="big-weather"><CloudSun size={55} strokeWidth={1.3}/><div><b>28°</b><span>Partly cloudy · Feels like 30°</span></div><div className="weather-location"><MapPin size={14}/> Punjab, India</div></div><div className="week-strip">{[['Today','☀','28°','Dry'],['Tue','☀','29°','Dry'],['Wed','🌤','27°','Cloudy'],['Thu','🌧','24°','12 mm rain'],['Fri','🌦','25°','Light rain'],['Sat','☀','28°','Dry'],['Sun','☀','30°','Dry']].map(x=><div key={x[0]}><small>{x[0]}</small><span>{x[1]}</span><b>{x[2]}</b><i>{x[3]}</i></div>)}</div><div className="irrigation-card"><div className="irrigation-icon"><Droplets size={20}/></div><div><span className="section-kicker">SUGGESTED IRRIGATION</span><h3>Wait until after Thursday’s rain</h3><p>Sample guidance: check soil moisture again Friday morning before irrigating North Field.</p></div><span className="recommend-tag">SAMPLE</span></div></section><aside className="panel side-tips"><span className="section-kicker">FIELD CONDITIONS</span><h2>What to watch</h2><div className="condition-row"><span className="note-icon blue-icon"><Droplets size={17}/></span><div><b>Soil moisture</b><p>Moderate · River Bend</p></div><span className="condition-tag">CHECK</span></div><div className="condition-row"><span className="note-icon peach-icon"><Thermometer size={17}/></span><div><b>Temperature</b><p>28° now · 30° high</p></div></div><div className="condition-row"><span className="note-icon mint"><Wind size={17}/></span><div><b>Wind</b><p>11 km/h · Light breeze</p></div></div><div className="tip-callout"><ShieldCheck size={17}/><p>Forecast and irrigation values are sample data. Connect a local weather provider for live advice.</p></div></aside></div>; }
function Network({country}) { return <div className="network-layout"><section className="panel network-hero"><span className="network-orb"><Globe2 size={34}/></span><span className="section-kicker">SOVEREIGN BY DESIGN</span><h2>Local knowledge.<br/><em>Shared progress.</em></h2><p>Fieldwise is designed to let participating regions improve agricultural models together while keeping raw farm data within local boundaries.</p><div className="network-stats"><div><b>05</b><span>Participating regions</span></div><div><b>01</b><span>Shared model registry</span></div><div><b>0</b><span>Raw farm records shared</span></div></div></section><section className="panel network-detail"><div className="panel-heading"><div><span className="section-kicker">REGIONAL NODES</span><h2>Network status</h2></div><span className="live-pill"><i/> DESIGN PREVIEW</span></div><p className="feature-intro">Example deployment status. No live federated training is connected in this MVP.</p>{[['India','IND','Punjab node · local data boundary','Active'],['Brazil','BRA','Cerrado node · local data boundary','Planned'],['China','CHN','Regional node · local data boundary','Planned'],['Russia','RUS','Regional node · local data boundary','Planned'],['South Africa','ZAF','Regional node · local data boundary','Planned']].map((r,i)=><div className="node-row" key={r[0]}><span className="country-flag">{['🇮🇳','🇧🇷','🇨🇳','🇷🇺','🇿🇦'][i]}</span><div><b>{r[0]}</b><small>{r[2]}</small></div><span className={`node-status ${i===0?'node-active':''}`}><i/>{r[3]}</span></div>)}<div className="network-callout"><ShieldCheck size={17}/><p><b>Designed for data sovereignty</b><br/>In a production system, only reviewed model updates would leave a regional node. Farmer records remain local.</p></div></section><div className="network-foot"><span>Current region: <b>{country}</b></span><span>Prototype status · Model exchange not connected</span></div></div>; }

export default App;
