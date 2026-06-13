import { forwardRef } from 'react';

function SelectLabel({ children, htmlFor, className = '', ...props }) {
  if (!children) return null;
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
      {children}
    </label>
  );
}

const SelectField = forwardRef(({
  className = '', error, children, placeholder, id, 'data-cy': dataCy, ...props
}, ref) => {
  const fieldId = id || props['aria-describedby']?.replace('-error', '');
  return (
    <div className="relative">
      <select
        ref={ref}
        id={fieldId}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm appearance-none bg-white
          ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}`}
        aria-invalid={!!error}
        data-cy={dataCy}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
});

function SelectOption({ value, label, ...props }) {
  return <option value={value} {...props}>{label || value}</option>;
}

function SelectError({ id, children, message }) {
  const text = children ?? message;
  if (!text) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-1 text-sm text-error">
      {text}
    </p>
  );
}

const Select = forwardRef(({
  children, label, error, options = [], placeholder, id, className = '', 'data-cy': dataCy, ...props
}, ref) => {
  if (children) {
    return <div className={`mb-4 ${className}`} data-cy={dataCy}>{children}</div>;
  }
  const selectId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;
  return (
    <div className={`mb-4 ${className}`} data-cy={dataCy}>
      {label && <SelectLabel htmlFor={selectId}>{label}</SelectLabel>}
      <SelectField
        ref={ref}
        id={selectId}
        error={error}
        placeholder={placeholder}
        aria-describedby={error ? errorId : undefined}
        data-cy={`${dataCy || selectId}-field`}
        {...props}
      >
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const display = typeof opt === 'string' ? opt : opt.label;
          return <SelectOption key={value} value={value} label={display} />;
        })}
      </SelectField>
      {error && <SelectError id={errorId} message={error} />}
    </div>
  );
});

Select.Label = SelectLabel;
Select.Field = SelectField;
Select.Option = SelectOption;
Select.Error = SelectError;

SelectField.displayName = 'Select.Field';
SelectLabel.displayName = 'Select.Label';
SelectOption.displayName = 'Select.Option';
SelectError.displayName = 'Select.Error';
Select.displayName = 'Select';

export default Select;
