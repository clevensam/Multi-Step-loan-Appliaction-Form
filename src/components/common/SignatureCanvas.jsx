import { useRef, useEffect, useCallback, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import ErrorMessage from './ErrorMessage';

export default function SignatureField({ label, value, onChange, error, id, 'data-cy': dataCy }) {
  const sigRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const fieldId = id || 'signature-canvas';
  const errorId = `${fieldId}-error`;

  useEffect(() => {
    if (value && sigRef.current && isEmpty) {
      setIsEmpty(false);
    }
  }, [value, isEmpty]);

  const handleClear = useCallback(() => {
    if (sigRef.current) {
      sigRef.current.clear();
      setIsEmpty(true);
      onChange?.({ target: { value: '' } });
    }
  }, [onChange]);

  const handleEnd = useCallback(() => {
    if (sigRef.current) {
      const isEmptySig = sigRef.current.isEmpty();
      setIsEmpty(isEmptySig);
      if (!isEmptySig) {
        const dataUrl = sigRef.current.toDataURL('image/png');
        onChange?.({ target: { value: dataUrl } });
      } else {
        onChange?.({ target: { value: '' } });
      }
    }
  }, [onChange]);

  return (
    <div className="mb-4" data-cy={dataCy}>
      {label && (
        <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>
      )}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <SignaturePad
          ref={sigRef}
          onEnd={handleEnd}
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair relative z-10',
            'data-cy': `${dataCy || fieldId}-canvas`,
          }}
          clearOnResize={false}
        />
        <div className="absolute inset-0 bg-black bg-opacity-[0.02] pointer-events-none" style={{ backdropFilter: 'blur(1px)' }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
          data-cy={`${dataCy || fieldId}-clear`}
        >
          Clear signature
        </button>
        {!isEmpty && (
          <span className="text-xs text-accent">✓ Signature captured</span>
        )}
      </div>
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
}
