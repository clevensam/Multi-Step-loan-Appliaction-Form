import { useState, useCallback, useEffect } from 'react';
import FileUpload from './common/FileUpload';
import SignatureCanvas from './common/SignatureCanvas';
import { DOCUMENT_SPECS, getRequiredDocs } from '../schemas/step7Schema';
import { compressImage } from '../utils/imageCompressor';

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

function FilePreview({ file }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!(file instanceof File)) return;
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  if (!(file instanceof File)) return null;

  if (file.type.startsWith('image/')) {
    return (
      <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
        {previewUrl && (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-14 h-14 object-cover rounded border border-gray-200 flex-shrink-0"
          />
        )}
        <div className="text-xs text-gray-600 min-w-0">
          <p className="font-medium truncate max-w-[180px]">{file.name}</p>
          <p className="text-gray-400">{formatSize(file.size)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
      <svg className="w-10 h-10 text-error flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <path d="M14 2v6h6" fill="none" stroke="#fff" strokeWidth="2"/>
        <text x="12" y="20" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">PDF</text>
      </svg>
      <div className="text-xs text-gray-600 min-w-0">
        <p className="font-medium truncate max-w-[180px]">{file.name}</p>
        <p className="text-gray-400">{formatSize(file.size)}</p>
      </div>
    </div>
  );
}

function DocumentItem({
  docKey, spec, file, error, onFileChange, onCompressResult,
}) {
  const [compressing, setCompressing] = useState(false);
  const [compressedInfo, setCompressedInfo] = useState(null);

  const handleFiles = useCallback(async (accepted) => {
    setCompressing(true);
    setCompressedInfo(null);

    try {
      if (spec.multiple && Array.isArray(accepted)) {
        const results = await Promise.all(
          accepted.map((f) => {
            if (f.type.startsWith('image/') && f.type !== 'image/gif') {
              return compressImage(f, { maxSizeMB: spec.maxSize / 1024 / 1024 });
            }
            return { file: f, skipped: true, originalSize: f.size, compressedSize: f.size, reduction: 0 };
          }),
        );
        const files = results.map((r) => r.file);
        onFileChange(files);
        const totalReduction = results.reduce((sum, r) => sum + r.reduction, 0) / results.length;
        if (results.some((r) => !r.skipped)) {
          setCompressedInfo({
            originalSize: results.reduce((s, r) => s + r.originalSize, 0),
            compressedSize: results.reduce((s, r) => s + r.compressedSize, 0),
            reduction: Math.round(totalReduction * 10) / 10,
          });
        }
      } else {
        let result = accepted;
        if (accepted instanceof File && accepted.type.startsWith('image/') && accepted.type !== 'image/gif') {
          result = await compressImage(accepted, { maxSizeMB: spec.maxSize / 1024 / 1024 });
        } else {
          result = { file: accepted, skipped: true, originalSize: accepted.size, compressedSize: accepted.size, reduction: 0 };
        }
        onFileChange(result.file);
        if (!result.skipped) {
          setCompressedInfo({
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            reduction: result.reduction,
          });
        }
      }
    } catch (err) {
      onFileChange(accepted instanceof File ? accepted : null);
    }

    setCompressing(false);
  }, [spec, onFileChange]);

  return (
    <div className="mb-6">
      <FileUpload
        label={`${spec.label}${spec.multiple ? ' (can select multiple)' : ''}`}
        accept={Object.fromEntries(spec.accept.map((ext) => [ext === '.jpg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'application/pdf', spec.accept]))}
        maxSize={spec.maxSize}
        onFilesChange={handleFiles}
        multiple={spec.multiple}
        error={error}
        data-cy={`step7-${docKey}`}
      >
        {({ isDragActive }) => (
          <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
          `}>
            {file && !compressing ? (
              <div className="flex flex-col items-center gap-2">
                {spec.multiple && Array.isArray(file)
                  ? file.map((f, i) => <FilePreview key={i} file={f} />)
                  : <FilePreview file={file} />
                }
                <p className="text-xs text-gray-400 mt-1">Click or drag to replace</p>
              </div>
            ) : (
              <div>
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                {spec.maxSize && <p className="text-xs text-gray-400 mt-1">Max size: {Math.round(spec.maxSize / 1024 / 1024)}MB</p>}
              </div>
            )}
          </div>
        )}
      </FileUpload>
      {compressing && <p className="text-xs text-primary mt-1">Compressing image...</p>}
      {compressedInfo && (
        <p className="text-xs text-gray-500 mt-1">
          Original: {formatSize(compressedInfo.originalSize)} → Compressed: {formatSize(compressedInfo.compressedSize)}
          {compressedInfo.reduction > 0 && ` (${compressedInfo.reduction}% smaller)`}
        </p>
      )}
    </div>
  );
}

export default function Step7Documents({ formData, updateFields, errors }) {
  const { documents = {}, signature, panNumber } = formData;
  const panVerified = formData.panVerified || false;

  const formStateWithVerified = {
    ...formData,
    panVerified: panNumber && panNumber.length === 10,
  };

  const requiredDocs = getRequiredDocs(formStateWithVerified);

  const handleDocChange = useCallback((docKey) => (file) => {
    updateFields({
      documents: {
        ...documents,
        [docKey]: file,
      },
    });
  }, [updateFields, documents]);

  const handleSignatureChange = useCallback((e) => {
    updateFields({ signature: e.target.value });
  }, [updateFields]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Document Upload & E-Signature</h2>
      <p className="text-gray-500 mb-6">
        Upload the required documents below. Images will be automatically compressed to meet size limits.
      </p>

      {requiredDocs.map((docKey) => {
        const spec = DOCUMENT_SPECS[docKey];
        if (!spec) return null;
        const file = documents[docKey];
        const docErrorKey = `documents.${docKey}`;
        return (
          <DocumentItem
            key={docKey}
            docKey={docKey}
            spec={spec}
            file={file}
            error={errors?.[docErrorKey]}
            onFileChange={handleDocChange(docKey)}
          />
        );
      })}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-4">E-Signature</h3>
        <SignatureCanvas
          label="Sign here"
          value={signature}
          onChange={handleSignatureChange}
          error={errors?.signature}
          data-cy="step7-signature"
        />
      </div>
    </div>
  );
}
