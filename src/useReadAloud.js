import { useCallback, useEffect, useRef, useState } from 'react';
import { selectSpeechVoice, speechTemplates, splitSpeechText } from './speechService.js';

export function useReadAloud({ queue, language, onUnsupported }) {
  const [state, setState] = useState('idle');
  const [currentItem, setCurrentItem] = useState(null);
  const [notice, setNotice] = useState('');
  const [speed, setSpeedState] = useState(() => {
    try { return window.localStorage.getItem('fieldwise-speech-speed') === 'normal' ? 'normal' : 'slow'; }
    catch { return 'slow'; }
  });
  const [voices, setVoices] = useState(() => typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
  const queueRef = useRef(queue);
  const indexRef = useRef(0);
  const sentenceRef = useRef(0);
  const timerRef = useRef(null);
  const languageRef = useRef(language);
  const stateRef = useRef(state);
  const activeRef = useRef(false);
  queueRef.current = queue;
  stateRef.current = state;

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener?.('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', update);
  }, []);

  const finish = useCallback(() => {
    clearTimeout(timerRef.current);
    activeRef.current = false;
    stateRef.current = 'idle';
    setState('idle');
    setCurrentItem(null);
  }, []);

  const playCurrent = useCallback(() => {
    clearTimeout(timerRef.current);
    const currentQueue = queueRef.current;
    if (!activeRef.current || !currentQueue?.length || indexRef.current >= currentQueue.length) { finish(); return; }
    const item = currentQueue[indexRef.current];
    const sentences = splitSpeechText(item.text);
    if (sentenceRef.current >= sentences.length) {
      indexRef.current += 1;
      sentenceRef.current = 0;
      timerRef.current = window.setTimeout(playCurrent, 600);
      return;
    }
    setCurrentItem(item.id);
    const utterance = new SpeechSynthesisUtterance(sentences[sentenceRef.current]);
    const selection = selectSpeechVoice(voices, languageRef.current);
    utterance.lang = selection.locale;
    if (selection.voice) utterance.voice = selection.voice;
    else {
      const fallbackVoice = voices.find(voice => voice.lang?.toLowerCase().startsWith('hi')) || voices.find(voice => voice.lang?.toLowerCase().startsWith('en')) || voices[0];
      if (fallbackVoice) { utterance.voice = fallbackVoice; utterance.lang = fallbackVoice.lang || 'en-IN'; }
      const templates = speechTemplates[languageRef.current] || speechTemplates.English;
      const message = templates.unavailable || speechTemplates.English.unavailable;
      setNotice(message);
      onUnsupported?.(message);
    }
    utterance.rate = speed === 'slow' ? 0.88 : 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (!activeRef.current) return;
      sentenceRef.current += 1;
      timerRef.current = window.setTimeout(playCurrent, sentenceRef.current >= sentences.length ? 600 : 100);
    };
    utterance.onerror = event => {
      if (event.error !== 'canceled' && event.error !== 'interrupted' && activeRef.current) {
        setNotice('Voice playback could not continue. Please try again.');
        finish();
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [finish, onUnsupported, speed, voices]);

  const start = useCallback((items = queueRef.current, startIndex = 0) => {
    if (!window.speechSynthesis) { const message = 'Voice is not supported in this browser.'; setNotice(message); onUnsupported?.(message); return; }
    window.speechSynthesis.cancel();
    clearTimeout(timerRef.current);
    queueRef.current = items;
    indexRef.current = startIndex;
    sentenceRef.current = 0;
    setNotice('');
    activeRef.current = true;
    stateRef.current = 'playing';
    setState('playing');
    playCurrent();
  }, [onUnsupported, playCurrent]);

  const stop = useCallback(() => {
    activeRef.current = false;
    window.speechSynthesis?.cancel();
    clearTimeout(timerRef.current);
    setState('idle');
    stateRef.current = 'idle';
    setCurrentItem(null);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setState('paused');
    stateRef.current = 'paused';
  }, []);
  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setState('playing');
    stateRef.current = 'playing';
  }, []);
  const next = useCallback(() => {
    if (!activeRef.current) return;
    window.speechSynthesis?.cancel();
    clearTimeout(timerRef.current);
    indexRef.current += 1;
    sentenceRef.current = 0;
    stateRef.current = 'playing';
    setState('playing');
    playCurrent();
  }, [playCurrent]);
  const previous = useCallback(() => {
    if (!activeRef.current) return;
    window.speechSynthesis?.cancel();
    clearTimeout(timerRef.current);
    indexRef.current = Math.max(0, indexRef.current - 1);
    sentenceRef.current = 0;
    stateRef.current = 'playing';
    setState('playing');
    playCurrent();
  }, [playCurrent]);
  const toggleSpeed = useCallback(() => {
    setSpeedState(current => {
      const nextSpeed = current === 'slow' ? 'normal' : 'slow';
      try { window.localStorage.setItem('fieldwise-speech-speed', nextSpeed); } catch { /* Preference is optional. */ }
      return nextSpeed;
    });
  }, []);
  useEffect(() => {
    if (!activeRef.current) return;
    const wasPaused = stateRef.current === 'paused';
    window.speechSynthesis?.cancel();
    clearTimeout(timerRef.current);
    sentenceRef.current = 0;
    playCurrent();
    if (wasPaused) window.setTimeout(() => window.speechSynthesis?.pause(), 0);
  }, [speed]);
  const toggle = useCallback(() => {
    if (stateRef.current === 'playing' || stateRef.current === 'paused') stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    if (languageRef.current !== language) {
      languageRef.current = language;
      if (activeRef.current) start(queue, 0);
    }
  }, [language, queue, start]);

  useEffect(() => () => {
    activeRef.current = false;
    clearTimeout(timerRef.current);
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => { if (document.visibilityState === 'hidden' && activeRef.current) stop(); };
    const onPageHide = () => { if (activeRef.current) stop(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onPageHide);
    };
  }, [stop]);

  return { state, currentItem, notice, speed, supported: typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window, toggle, start, pause, resume, stop, next, previous, toggleSpeed };
}
