import { useCallback } from 'react';
import FileUpload from './common/FileUpload';
import SignatureCanvas from './common/SignatureCanvas';
import { getRequiredDocs, DOCUMENT_SPECS } from '../schemas/step7Schema';
import { compressImage } from '../utils/imageCompressor';

export default function Step7Documents({ watch, setValue, errors }) {
  const formState = watch();
  const requiredDocs = getRequiredDocs(formState);
  const signature = watch('signature');
  const documents = watch('documents') || {};

  const handleFile = useCallback((docKey) => async (fileOrFiles) => {
    if (docKey === 'photograph' && fileOrFiles instanceof File && fileOrFiles.type.startsWith('image/')) {
      const compressed = await compressImage(fileOrFiles);
      setValue(`documents.${docKey}`, compressed.file);
      return;
    }
    setValue(`documents.${docKey}`, fileOrFiles);
  }, [setValue]);

  const handleSignatureEnd = useCallback((e) => {
    setValue('signature', e.target.value);
  }, [setValue]);

  const err = (f) => errors[f]?.message;
  const docErr = (k) => errors.documents?.[k]?.message;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Document Upload & E-Signature</h2>

      <div className="space-y-6">
        {requiredDocs.map((docKey) => {
          const spec = DOCUMENT_SPECS[docKey];
          if (!spec) return null;

          const acceptObj = spec.accept.reduce((acc, ext) => {
            if (ext === '.pdf') acc['application/pdf'] = [];
            else if (['.jpg', '.jpeg'].includes(ext)) acc['image/jpeg'] = [];
            else if (ext === '.png') acc['image/png'] = [];
            return acc;
          }, {});

          const isUploaded = spec.multiple
            ? (documents[docKey] || []).length > 0
            : !!documents[docKey];

          return (
            <div key={docKey} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <FileUpload
                label={`${spec.label} ${spec.multiple ? '(multiple)' : ''}`}
                accept={acceptObj}
                maxSize={spec.maxSize}
                onFilesChange={handleFile(docKey)}
                multiple={spec.multiple || false}
                error={docErr(docKey)}
                data-cy={`step7-${docKey}`}
              />
              {isUploaded && (
                <p className="text-sm text-accent mt-2">✓ {spec.label} uploaded</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-3">E-Signature</h3>
        <p className="text-sm text-gray-500 mb-3">
          Please sign below using your mouse or touch device (blur overlay active for security).
        </p>
        <SignatureCanvas
          label="Your Signature"
          value={signature}
          onChange={handleSignatureEnd}
          error={err('signature')}
          data-cy="step7-signature"
        />
      </div>
    </div>
  );
}
