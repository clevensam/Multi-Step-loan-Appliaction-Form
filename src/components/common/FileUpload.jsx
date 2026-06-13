import { forwardRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ErrorMessage from './ErrorMessage';

const FileUpload = forwardRef(({
  label, accept, maxSize, onFilesChange, error, id, multiple = false,
  children, 'data-cy': dataCy,
}, ref) => {
  const inputId = id || `file-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  const onDrop = useCallback((accepted, rejected) => {
    if (accepted.length > 0) {
      onFilesChange?.(multiple ? accepted : accepted[0]);
    }
  }, [onFilesChange, multiple]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  return (
    <div className="mb-4" data-cy={dataCy}>
      {label && (
        <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>
      )}
      {typeof children === 'function' ? (
        <div ref={ref} {...getRootProps()} data-cy={`${dataCy || inputId}-dropzone`}>
          <input id={inputId} {...getInputProps()} data-cy={`${dataCy || inputId}-input`} />
          {children({ getRootProps, getInputProps, isDragActive, isDragReject })}
        </div>
      ) : (
        <div
          ref={ref}
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary-50' : ''}
            ${isDragReject ? 'border-error bg-error-50' : ''}
            ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-primary hover:bg-gray-50' : ''}
          `}
          data-cy={`${dataCy || inputId}-dropzone`}
        >
          <input id={inputId} {...getInputProps()} data-cy={`${dataCy || inputId}-input`} />
          {isDragActive ? (
            <p className="text-sm text-primary">Drop files here...</p>
          ) : (
            <div>
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
              {maxSize && <p className="text-xs text-gray-400 mt-1">Max size: {Math.round(maxSize / 1024 / 1024)}MB</p>}
            </div>
          )}
        </div>
      )}
      {error && <ErrorMessage id={errorId} message={error} />}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';
export default FileUpload;
