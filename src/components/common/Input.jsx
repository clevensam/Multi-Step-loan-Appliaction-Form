import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const Input = forwardRef(({ label, error, helpText, id, className = '', 'data-cy': dataCy, ...props }, ref) => {
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

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
        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150
          ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        data-cy={`${dataCy || inputId}-field`}
        {...props}
      />
      {error && <ErrorMessage id={errorId} message={error} />}
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
