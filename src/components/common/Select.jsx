import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const Select = forwardRef(({ label, error, options = [], placeholder, id, className = '', 'data-cy': dataCy, ...props }, ref) => {
  const selectId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="mb-4" data-cy={dataCy}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm appearance-none bg-white
            ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          data-cy={`${dataCy || selectId}-field`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const display = typeof opt === 'string' ? opt : opt.label;
            return <option key={value} value={value}>{display}</option>;
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
