import React, { useState } from 'react';
import { AlertTriangle, Check, FileImage, Leaf, LoaderCircle, Mic2, ShieldCheck, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PhotoUploader({ image, status, error, analysesUsed, onChoose, onChange, onAnalyze, onDemo }) {
  const { t } = useTranslation();
  return <>
    <div className={`upload-zone diagnosis-upload ${image ? 'has-image' : ''} ${status === 'loading' ? 'is-scanning' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onChoose(event.dataTransfer.files?.[0]); }}>
      {image ? <><img src={image} alt={t('diagnostics.selectedLeafAlt')}/>{status === 'loading' && <div className="scan-overlay" aria-hidden="true"><i/></div>}</> : <><span className="upload-icon"><FileImage size={25}/></span><b>{t('diagnostics.dropLeaf')}</b><span>{t('diagnostics.orBrowse')}</span></>}
      <input type="file" accept="image/jpeg,image/png" capture="environment" hidden onChange={event => { onChoose(event.target.files?.[0]); event.target.value = ''; }}/>
      {!image && <label className="outline-btn"><Upload size={15}/> {t('diagnostics.choosePhoto')}<input type="file" accept="image/jpeg,image/png" capture="environment" hidden onChange={event => { onChoose(event.target.files?.[0]); event.target.value = ''; }}/></label>}
      {image && <div className="photo-actions"><button className="outline-btn" type="button" onClick={onChange}>{t('diagnostics.changePhoto')}</button><button className="primary-btn" type="button" onClick={onAnalyze} disabled={status === 'loading'}>{status === 'loading' ? <><LoaderCircle size={14} className="diagnosis-spinner"/> {t('diagnostics.checking')}</> : t('diagnostics.analyse')}</button></div>}
      {!image && <small>{t('diagnostics.fileLimit')}</small>}
    </div>
    <div className="diagnosis-status" aria-live="polite" role="status">{status === 'loading' && t('diagnostics.checkingCrop')}{error && <span className="diagnosis-error"><AlertTriangle size={14}/>{t(error)}</span>}</div>
    {error && <div className="diagnosis-fallback"><span>{t('diagnostics.demoAvailable')}</span><button className="text-action" type="button" onClick={onDemo}>{t('diagnostics.showDemo')}</button></div>}
    <div className="analysis-count">{t('diagnostics.analysesUsed',{count:analysesUsed})}</div>
  </>;
}

export function ConfidenceMeter({ value = 0 }) {
  const { t } = useTranslation();
  const percent = Math.round(value * 100);
  const level = percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low';
  return <div className={`diagnosis-confidence ${level}`} aria-label={t('diagnostics.confidencePercent',{count:percent})}><div><b>{percent}%</b><small>{t('diagnostics.confidence')}</small></div><span><i style={{ width: `${percent}%` }}/></span></div>;
}

export function LowConfidenceNotice({ onHelp }) {
  const { t } = useTranslation();
  return <div className="low-confidence"><AlertTriangle size={18}/><div><b>{t('diagnostics.uncertainTitle')}</b><p>{t('diagnostics.uncertainCopy')}</p><button type="button" className="text-action" onClick={onHelp}>{t('diagnostics.contactAgronomist')}</button></div></div>;
}

export function TreatmentTabs({ result }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState('treatment');
  const sections = [
    ['treatment', t('diagnostics.treatment'), result.treatment || []],
    ['prevention', t('diagnostics.prevention'), result.prevention || []],
    ['spray', t('diagnostics.sprayGuidance'), result.spray || []],
  ].filter(([, , items]) => items.length);
  if (!sections.length) return <p className="no-treatment">{t('diagnostics.noTreatment')}</p>;
  const selected = sections.find(([key]) => key === tab) || sections[0];
  return <div className="treatment-tabs"><div role="tablist" aria-label={t('diagnostics.treatmentGuidance')}>{sections.map(([key, label]) => <button key={key} role="tab" aria-selected={selected[0] === key} onClick={() => setTab(key)}>{label}</button>)}</div><ul>{selected[2].map((item, index) => <li key={`${selected[0]}-${index}`}>{item}</li>)}</ul></div>;
}

export function DiagnosisResult({ result, demo, onSave, onListen, onHelp }) {
  const { t } = useTranslation();
  if (!result) return null;
  const uncertain = result.confidence < 0.4 || !result.disease;
  return <section className="diagnosis-result" aria-live="polite">
    <div className="diagnosis-result-head"><span className={`result-check ${result.healthy ? '' : 'diagnosis-mark'}`}>{result.healthy ? <Check size={18}/> : <Leaf size={17}/>}</span><div><div className="result-overline">{result.healthy ? t('diagnostics.healthyCrop') : t('diagnostics.cropHealthResult')} <span>{demo ? t('diagnostics.demoResult') : 'crop.health'}</span></div><h3>{result.healthy ? t('diagnostics.looksHealthy') : result.disease?.commonName || result.disease?.name || t('diagnostics.uncertain')}</h3>{result.disease?.scientificName && result.disease.scientificName !== result.disease.commonName && <small className="scientific-name">{result.disease.scientificName}</small>}<p className="affected-crop">{t('diagnostics.detectedCrop')}: <b>{result.crop || t('diagnostics.notIdentified')}</b></p></div><ConfidenceMeter value={result.confidence}/></div>
    {uncertain && <LowConfidenceNotice onHelp={onHelp}/>}
    {result.description && <div className="diagnosis-section"><h4>{t('diagnostics.description')}</h4><p>{result.description}</p></div>}
    {result.alternatives?.length > 0 && <details className="diagnosis-alternatives"><summary>{t('diagnostics.otherPossibilities',{count:result.alternatives.length})}</summary><ul>{result.alternatives.map(item => <li key={item.name}>{item.name}<span>{Math.round(item.probability * 100)}%</span></li>)}</ul></details>}
    <div className="diagnosis-section"><h4>{t('diagnostics.treatmentPlan')}</h4><TreatmentTabs result={result}/></div>
    <div className="diagnosis-result-actions"><button className="outline-btn" type="button" onClick={onListen}><Mic2 size={14}/> {t('common.listen')}</button><label className="diagnosis-save">{t('diagnostics.saveToNotes')}<select aria-label={t('diagnostics.chooseFieldToSave')} defaultValue="" onChange={event => { if (event.target.value) onSave(event.target.value); event.target.value = ''; }}><option value="" disabled>{t('diagnostics.chooseField')}</option>{result.fieldOptions?.map(name => <option key={name}>{name}</option>)}</select></label></div>
    <div className="diagnosis-disclaimer"><ShieldCheck size={15}/>{t('diagnostics.disclaimer')}</div>
  </section>;
}
