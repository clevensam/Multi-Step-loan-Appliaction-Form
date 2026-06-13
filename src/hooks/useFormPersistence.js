import { useState, useEffect, useCallback } from 'react';
import { decrypt } from '../utils/encryption';
import getSchema from '../schemas/schemaFactory';

function cleanupStorage(storageKey) {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(`${storageKey}_meta`);
}

function validateDraftData(data) {
  if (!data || typeof data !== 'object') return false;
  const payload = data.data || data;
  const schema = getSchema(0, payload);
  if (!schema) return false;
  const result = schema.safeParse(payload);
  return result.success;
}

async function checkForSavedDraft(storageKey, expiryHours) {
  try {
    const metaRaw = localStorage.getItem(`${storageKey}_meta`);
    if (!metaRaw) return null;

    const meta = JSON.parse(metaRaw);
    const age = Date.now() - new Date(meta.timestamp).getTime();
    if (age > expiryHours * 60 * 60 * 1000) {
      cleanupStorage(storageKey);
      return null;
    }

    const encrypted = localStorage.getItem(storageKey);
    if (!encrypted) return null;

    const decrypted = await decrypt(encrypted);
    if (!validateDraftData(decrypted)) {
      cleanupStorage(storageKey);
      return null;
    }
    return decrypted;
  } catch {
    cleanupStorage(storageKey);
    return null;
  }
}

export default function useFormPersistence(storageKey, expiryHours = 72) {
  const [savedData, setSavedData] = useState(null);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    checkForSavedDraft(storageKey, expiryHours).then((data) => {
      if (data) {
        setSavedData(data);
        setShowResume(true);
      }
    });
  }, [storageKey, expiryHours]);

  const resume = useCallback(() => {
    setShowResume(false);
    return savedData?.data || null;
  }, [savedData]);

  const startFresh = useCallback(() => {
    cleanupStorage(storageKey);
    setShowResume(false);
    setSavedData(null);
    return null;
  }, [storageKey]);

  return {
    savedData, showResume, resume, startFresh,
  };
}
