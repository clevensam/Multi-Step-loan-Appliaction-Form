import { forwardRef, useCallback } from 'react';
import ErrorMessage from './ErrorMessage';

function formatMask(value, maskType) {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '');
  if (maskType === 'pan') {
    const upper = cleaned.toUpperCase().slice(0, 10);
    return upper;
  }
  if (maskType === 'aadhaar') {
    const digits = cleaned.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  }
  if (maskType === 'mobile') {
    const digits = cleaned.replace(/\D/g, '').slice(0, 10);
    return digits;
  }
  return cleaned;
}

function displayMasked(value, maskType) {
  if (!value) return '';
  const cleaned = value.replace(/\s/g, '');
  if (maskType === 'pan') {
    return `XXXXX${cleaned.slice(5)}`;
  }
  if (maskType === 'aadhaar') {
    if (cleaned.length <= 4) return cleaned;
    const last4 = cleaned.slice(-4);
    const prefixLen = Math.min(cleaned.length - 4, 8);
    const masked = '•'.repeat(prefixLen > 4 ? 8 : prefixLen);
    if (cleaned.length > 8) {
      return `${masked} ${last4}`;
    }
    return `${masked.slice(0, 4)} ${masked.slice(4)}${last4}`;
  }
  if (maskType === 'mobile') {
    return cleaned;
  }
  return value;
}

const MaskedInput = forwardRef(({
  label, value, onChange, error, maskType, id, showMasked = true, className = '', 'data-cy': dataCy, ...props
}, ref) => {
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  const handleChange = useCallback((e) => {
    const formatted = formatMask(e.target.value, maskType);
    onChange({ ...e, target: { ...e.target, value: formatted } });
  }, [maskType, onChange]);

  const displayValue = showMasked && maskType ? displayMasked(value, maskType) : value;

  return (
    <div className="mb-4" data-cy={dataCy}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono
          ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
        data-cy={`${dataCy || inputId}-field`}
        {...props}
      />
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
});

MaskedInput.displayName = 'MaskedInput';
export default MaskedInput;
