import { forwardRef } from 'react';

function InputLabel({ children, htmlFor, className = '', ...props }) {
  if (!children) return null;
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
      {children}
    </label>
  );
}

const InputField = forwardRef(({ className = '', error, id, 'data-cy': dataCy, ...props }, ref) => {
  const fieldId = id || props['aria-describedby']?.replace('-error', '');
  return (
    <input
      ref={ref}
      id={fieldId}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150
        ${error ? 'border-error focus:border-error focus:ring-error' : 'border-gray-300 focus:border-primary focus:ring-primary'}
        focus:outline-none focus:ring-2 focus:ring-offset-0
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}`}
      aria-invalid={!!error}
      data-cy={dataCy}
      {...props}
    />
  );
});

function InputError({ id, children, message }) {
  const text = children ?? message;
  if (!text) return null;
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-1 text-sm text-error">
      {text}
    </p>
  );
}

function InputHelpText({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 text-xs text-gray-400">
      {children}
    </p>
  );
}

const Input = forwardRef(({
  children, label, error, helpText, id, className = '', 'data-cy': dataCy, ...props
}, ref) => {
  if (children) {
    return <div className={`mb-4 ${className}`} data-cy={dataCy}>{children}</div>;
  }
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  return (
    <div className={`mb-4 ${className}`} data-cy={dataCy}>
      {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}
      <InputField
        ref={ref}
        id={inputId}
        error={error}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        data-cy={`${dataCy || inputId}-field`}
        {...props}
      />
      {error && <InputError id={errorId} message={error} />}
      {helpText && !error && <InputHelpText id={helpId}>{helpText}</InputHelpText>}
    </div>
  );
});

Input.Label = InputLabel;
Input.Field = InputField;
Input.Error = InputError;
Input.HelpText = InputHelpText;

InputField.displayName = 'Input.Field';
InputLabel.displayName = 'Input.Label';
InputError.displayName = 'Input.Error';
InputHelpText.displayName = 'Input.HelpText';
Input.displayName = 'Input';

export default Input;
