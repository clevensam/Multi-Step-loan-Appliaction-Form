import {
  useState, useCallback, useRef, useEffect,
} from 'react';
import {
  validatePAN, validateAadhaar, validateMobile, validateEmail,
} from '../utils/validators';

function getFormatError(type, val) {
  switch (type) {
    case 'pan': {
      const result = validatePAN(val);
      return result.valid ? null : result.error;
    }
    case 'aadhaar': {
      const result = validateAadhaar(val);
      return result.valid ? null : result.error;
    }
    case 'mobile': {
      const result = validateMobile(val);
      return result.valid ? null : result.error;
    }
    case 'email': {
      const result = validateEmail(val);
      return result.valid ? null : result.error;
    }
    default:
      return val && val.trim() ? null : 'Value is required';
  }
}

export default function useVerification({
  type, value, delay = 1500, onVerified, onError,
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const verify = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVerified(false);
    setError(null);

    if (!value || !value.trim()) {
      const msg = 'Value is required';
      setError(msg);
      onError?.(msg);
      return;
    }

    const formatError = getFormatError(type, value);
    if (formatError) {
      setError(formatError);
      onError?.(formatError);
      return;
    }

    setIsVerifying(true);
    timerRef.current = setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setError(null);
      onVerified?.();
    }, delay);
  }, [value, type, delay, onVerified, onError]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    isVerifying, isVerified, error, verify, reset,
  };
}
