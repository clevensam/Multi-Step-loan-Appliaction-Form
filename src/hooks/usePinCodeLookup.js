import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import pinData from '../utils/pinCodeData.json';

export default function usePinCodeLookup(pin) {
  const [result, setResult] = useState({
    city: '', state: '', postOffice: '', isLoading: false, error: null,
  });
  const lastPin = useRef('');

  useEffect(() => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return undefined;
    }

    if (pin === lastPin.current) return undefined;
    lastPin.current = pin;

    const timer = setTimeout(() => {
      const data = pinData[pin];
      if (data) {
        setResult({
          city: data.city,
          state: data.state,
          postOffice: data.postOffice,
          isLoading: false,
          error: null,
        });
      } else {
        setResult({
          city: '',
          state: '',
          postOffice: '',
          isLoading: false,
          error: 'PIN not found.',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pin]);

  const reset = useCallback(() => {
    setResult({
      city: '', state: '', postOffice: '', isLoading: false, error: null,
    });
    lastPin.current = '';
  }, []);

  return { ...result, reset };
}
