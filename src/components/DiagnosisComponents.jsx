import React, { useState } from 'react';
import { AlertTriangle, Check, FileImage, Leaf, LoaderCircle, Mic2, ShieldCheck, Upload } from 'lucide-react';

export function PhotoUploader({ image, status, error, analysesUsed, onChoose, onChange, onAnalyze, onDemo }) {
  return <>
    <div className={`upload-zone diagnosis-upload ${image ? 'has-image' : ''} ${status === 'loading' ? 'is-scanning' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onChoose(event.dataTransfer.files?.[0]); }}>
      {image ? <><img src={image} alt="Selected crop leaf for disease analysis"/>{status === 'loading' && <div className="scan-overlay" aria-hidden="true"><i/></div>}</> : <><span className="upload-icon"><FileImage size={25}/></span><b>Drop a leaf photo here</b><span>or browse files from your device</span></>}
      <input type="file" accept="image/jpeg,image/png" capture="environment" hidden onChange={event => { onChoose(event.target.files?.[0]); event.target.value = ''; }}/>
      {!image && <label className="outline-btn"><Upload size={15}/> Choose photo<input type="file" accept="image/jpeg,image/png" capture="environment" hidden onChange={event => { onChoose(event.target.files?.[0]); event.target.value = ''; }}/></label>}
      {image && <div className="photo-actions"><button className="outline-btn" type="button" onClick={onChange}>Change photo</button><button className="primary-btn" type="button" onClick={onAnalyze} disabled={status === 'loading'}>{status === 'loading' ? <><LoaderCircle size={14} className="diagnosis-spinner"/> Checking…</> : 'Analyse'}</button></div>}
      {!image && <small>JPG or PNG · up to 10 MB · Camera supported</small>}
    </div>
    <div className="diagnosis-status" aria-live="polite" role="status">{status === 'loading' && 'Checking your crop…'}{error && <span className="diagnosis-error"><AlertTriangle size={14}/>{error}</span>}</div>
    {error && <div className="diagnosis-fallback"><span>Demo analysis remains available.</span><button className="text-action" type="button" onClick={onDemo}>Show demo result</button></div>}
    <div className="analysis-count">{analysesUsed} analyses used</div>
  </>;
}

export function ConfidenceMeter({ value = 0 }) {
  const percent = Math.round(value * 100);
  const level = percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low';
  return <div className={`diagnosis-confidence ${level}`} aria-label={`${percent}% confidence`}><div><b>{percent}%</b><small>confidence</small></div><span><i style={{ width: `${percent}%` }}/></span></div>;
}

export function LowConfidenceNotice({ onHelp }) {
  return <div className="low-confidence"><AlertTriangle size={18}/><div><b>We are not sure. Try a clearer photo of the affected leaf.</b><p>Make sure the leaf is in focus and fills most of the frame.</p><button type="button" className="text-action" onClick={onHelp}>Contact a local agronomist</button></div></div>;
}

export function TreatmentTabs({ result }) {
  const [tab, setTab] = useState('treatment');
  const sections = [
    ['treatment', 'Treatment', result.treatment || []],
    ['prevention', 'Prevention', result.prevention || []],
    ['spray', 'Spray guidance', result.spray || []],
  ].filter(([, , items]) => items.length);
  if (!sections.length) return <p className="no-treatment">No treatment details were returned for this result.</p>;
  const selected = sections.find(([key]) => key === tab) || sections[0];
  return <div className="treatment-tabs"><div role="tablist" aria-label="Treatment guidance">{sections.map(([key, label]) => <button key={key} role="tab" aria-selected={selected[0] === key} onClick={() => setTab(key)}>{label}</button>)}</div><ul>{selected[2].map((item, index) => <li key={`${selected[0]}-${index}`}>{item}</li>)}</ul></div>;
}

export function DiagnosisResult({ result, demo, onSave, onListen, onHelp }) {
  if (!result) return null;
  const uncertain = result.confidence < 0.4 || !result.disease;
  return <section className="diagnosis-result" aria-live="polite">
    <div className="diagnosis-result-head"><span className={`result-check ${result.healthy ? '' : 'diagnosis-mark'}`}>{result.healthy ? <Check size={18}/> : <Leaf size={17}/>}</span><div><div className="result-overline">{result.healthy ? 'HEALTHY CROP' : 'CROP HEALTH RESULT'} <span>{demo ? 'DEMO RESULT' : 'CROP.HEALTH'}</span></div><h3>{result.healthy ? 'Your crop looks healthy' : result.disease?.commonName || result.disease?.name || 'Uncertain result'}</h3>{result.disease?.scientificName && result.disease.scientificName !== result.disease.commonName && <small className="scientific-name">{result.disease.scientificName}</small>}<p className="affected-crop">Detected crop: <b>{result.crop || 'Not identified'}</b></p></div><ConfidenceMeter value={result.confidence}/></div>
    {uncertain && <LowConfidenceNotice onHelp={onHelp}/>}
    {result.description && <div className="diagnosis-section"><h4>Description</h4><p>{result.description}</p></div>}
    {result.alternatives?.length > 0 && <details className="diagnosis-alternatives"><summary>Other possibilities ({result.alternatives.length})</summary><ul>{result.alternatives.map(item => <li key={item.name}>{item.name}<span>{Math.round(item.probability * 100)}%</span></li>)}</ul></details>}
    <div className="diagnosis-section"><h4>Treatment plan</h4><TreatmentTabs result={result}/></div>
    <div className="diagnosis-result-actions"><button className="outline-btn" type="button" onClick={onListen}><Mic2 size={14}/> Listen</button><label className="diagnosis-save">Save to field notes<select aria-label="Choose a field to save this diagnosis" defaultValue="" onChange={event => { if (event.target.value) onSave(event.target.value); event.target.value = ''; }}><option value="" disabled>Choose field…</option>{result.fieldOptions?.map(name => <option key={name}>{name}</option>)}</select></label></div>
    <div className="diagnosis-disclaimer"><ShieldCheck size={15}/>This result is for guidance. Confirm diagnoses with a local agronomist before treatment.</div>
  </section>;
}
