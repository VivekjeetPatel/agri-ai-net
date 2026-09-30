import { useCallback, useEffect, useState } from 'react';
import sampleDiagnosis from '../mocks/sampleDiagnosis.json';
import { analyzeImage } from '../services/cropHealthService.js';

const initialCount = () => {
  try { return Number(window.localStorage.getItem('fieldwise-crop-health-analysis-count') || 0); }
  catch { return 0; }
};

export function useDiagnosis() {
  const [status, setStatus] = useState('idle');
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [analysesUsed, setAnalysesUsed] = useState(initialCount);

  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);

  const selectFile = useCallback(nextFile => {
    if (!nextFile) return;
    if (!['image/jpeg', 'image/png'].includes(nextFile.type)) { setError('diagnostics.errors.badImage'); return; }
    if (nextFile.size > 10 * 1024 * 1024) { setError('diagnostics.errors.imageTooLarge'); return; }
    setFile(nextFile);
    setImage(current => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(nextFile); });
    setResult(null);
    setError('');
    setStatus('preview');
  }, []);

  const analyze = useCallback(async language => {
    if (!file || status === 'loading') return;
    setError('');
    setStatus('loading');
    try {
      const response = await analyzeImage(file, { language });
      setResult(response);
      if (response.analysesUsed != null) setAnalysesUsed(response.analysesUsed);
      setStatus(response.confidence < 0.4 || !response.disease ? 'lowConfidence' : 'success');
      return response;
    } catch (reason) {
      setError(reason.code || 'diagnostics.errors.failed');
      setStatus('error');
      return null;
    }
  }, [file, status]);

  const useDemo = useCallback(() => {
    setResult({ ...sampleDiagnosis });
    setStatus('success');
    setError('');
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
    setStatus(file ? 'preview' : 'idle');
  }, [file]);

  return { status, image, result, error, analysesUsed, selectFile, analyze, useDemo, reset };
}
