import { forwardRef, useState, useCallback } from 'react';
import { formatIndianNumber } from '../../utils/formatCurrency';
import ErrorMessage from './ErrorMessage';

const CurrencyInput = forwardRef(({ label, value, onChange, error, id, placeholder = 'Enter amount', className = '', 'data-cy': dataCy, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  const displayValue = focused ? value : (value ? formatIndianNumber(value) : '');

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback((e) => {
    setFocused(false);
    if (props.onBlur) props.onBlur(e);
  }, [props.onBlur]);

  return (
    <div className="mb-4" data-cy={dataCy}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">₹</span>
        <input
          ref={ref}
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full rounded-lg border pl-8 pr-3 py-2.5 text-sm
            ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          data-cy={`${dataCy || inputId}-field`}
          {...props}
        />
      </div>
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';
export default CurrencyInput;
