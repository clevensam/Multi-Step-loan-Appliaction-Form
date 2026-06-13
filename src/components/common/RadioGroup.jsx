import { forwardRef } from 'react';
import ErrorMessage from './ErrorMessage';

const RadioGroup = forwardRef(({ label, name, options = [], value, onChange, error, layout = 'vertical', 'data-cy': dataCy }, ref) => {
  const groupId = name || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${groupId}-error`;

  return (
    <fieldset className="mb-4" data-cy={dataCy}>
      {label && (
        <legend className="block text-sm font-medium text-gray-700 mb-2">{label}</legend>
      )}
      <div className={`flex gap-4 ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'}`}>
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          const optionId = `${groupId}-${optValue}`;
          return (
            <label key={optValue} htmlFor={optionId} className="flex items-center gap-2 cursor-pointer group">
              <input
                ref={ref}
                type="radio"
                id={optionId}
                name={name}
                value={optValue}
                checked={value === optValue}
                onChange={onChange}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                data-cy={`${dataCy || groupId}-${optValue}`}
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{optLabel}</span>
            </label>
          );
        })}
      </div>
      {error && <ErrorMessage id={errorId} message={error} />}
    </fieldset>
  );
});

RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;
