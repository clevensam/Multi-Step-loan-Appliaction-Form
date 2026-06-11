import { forwardRef } from 'react';

const Checkbox = forwardRef(({ label, id, error, className = '', 'data-cy': dataCy, ...props }, ref) => {
  const checkboxId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="mb-3" data-cy={dataCy}>
      <label htmlFor={checkboxId} className="flex items-start gap-2 cursor-pointer group">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ${className}`}
          data-cy={`${dataCy || checkboxId}-field`}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-5">{label}</span>
        )}
      </label>
      {error && <p role="alert" className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
