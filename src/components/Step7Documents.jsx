import { useState, useCallback } from 'react';
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

function DocumentItem({
  docKey, spec, file, error, onFileChange, onCompressResult,
}) {
  const [compressing, setCompressing] = useState(false);
  const [compressedInfo, setCompressedInfo] = useState(null);

  const handleFiles = useCallback(async (accepted) => {
    setCompressing(true);
    setCompressedInfo(null);

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
      />
      {compressing && <p className="text-xs text-primary mt-1">Compressing image...</p>}
      {compressedInfo && (
        <p className="text-xs text-gray-500 mt-1">
          Original: {formatSize(compressedInfo.originalSize)} → Compressed: {formatSize(compressedInfo.compressedSize)}
          {compressedInfo.reduction > 0 && ` (${compressedInfo.reduction}% smaller)`}
        </p>
      )}
      {file && !compressing && (
        <p className="text-xs text-accent mt-1">
          ✓ {spec.multiple && Array.isArray(file) ? `${file.length} file(s) uploaded` : 'File uploaded'}
          {' — '}{formatSize(file instanceof File ? file.size : 0)}
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

  const docKeys = Object.keys(DOCUMENT_SPECS);
  const orderedDocs = requiredDocs.concat(
    docKeys.filter((k) => !requiredDocs.includes(k)),
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Document Upload & E-Signature</h2>
      <p className="text-gray-500 mb-6">
        Upload the required documents below. Images will be automatically compressed to meet size limits.
      </p>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Required Documents</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          {requiredDocs.map((key) => (
            <li key={key} className="flex items-center gap-1">
              <span className="text-error">*</span> {DOCUMENT_SPECS[key]?.label || key}
            </li>
          ))}
        </ul>
      </div>

      {orderedDocs.map((docKey) => {
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
