import { useEffect, useRef, useCallback } from 'react';
import { encrypt } from '../utils/encryption';

export default function useAutoSave(storageKey, state, metadata = {}, interval = 30000, onSaved = undefined) {
  const timerRef = useRef(null);
  const saveInProgress = useRef(false);
  const stateRef = useRef(state);
  const metaRef = useRef(metadata);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    metaRef.current = metadata;
  }, [metadata]);

  const save = useCallback(async () => {
    if (saveInProgress.current) return;
    saveInProgress.current = true;

    try {
      const payload = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        ...metaRef.current,
        data: stateRef.current,
      };
      const encrypted = await encrypt(payload);
      localStorage.setItem(storageKey, encrypted);
      localStorage.setItem(`${storageKey}_meta`, JSON.stringify({
        timestamp: payload.timestamp,
        version: payload.version,
      }));
      onSaved?.(payload.timestamp);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      saveInProgress.current = false;
    }
  }, [storageKey, onSaved]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, interval);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, interval, save]);

  const saveNow = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    save();
  }, [save]);

  return { saveNow };
}
