import { useCallback } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import MaskedInput from './common/MaskedInput';
import SignatureCanvas from './common/SignatureCanvas';
import Checkbox from './common/Checkbox';
import useVerification from '../hooks/useVerification';
import { RELATIONSHIPS } from '../constants';

export default function Step6CoApplicant({ watch, setValue, errors }) {
  const coApplicantName = watch('coApplicantName');
  const coApplicantRelationship = watch('coApplicantRelationship');
  const coApplicantPan = watch('coApplicantPan');
  const coApplicantIncome = watch('coApplicantIncome');
  const coApplicantConsent = watch('coApplicantConsent');
  const coApplicantSignature = watch('coApplicantSignature');
  const maritalStatus = watch('maritalStatus');

  const panVerification = useVerification({ type: 'pan', value: coApplicantPan, onVerified: () => {} });

  const handlePanBlur = useCallback(() => {
    if (coApplicantPan) panVerification.verify();
  }, [coApplicantPan, panVerification]);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value !== undefined ? e.target.value : e;
    setValue(field, value);
  }, [setValue]);

  const handleSignatureEnd = useCallback((signatureData) => {
    setValue('coApplicantSignature', signatureData?.target?.value ?? signatureData);
  }, [setValue]);

  const err = (f) => errors[f]?.message;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Co-Applicant & Guarantor Details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Required for loans above specified thresholds. Please provide co-applicant / guarantor information.
      </p>

      <Input
        label="Co-Applicant Full Name"
        value={coApplicantName}
        onChange={handleChange('coApplicantName')}
        error={err('coApplicantName')}
        placeholder="Enter co-applicant name as per PAN"
        autoComplete="name"
        data-cy="step6-co-app-name"
      />

      <Select
        label="Relationship"
        value={coApplicantRelationship}
        onChange={handleChange('coApplicantRelationship')}
        error={err('coApplicantRelationship')}
          options={RELATIONSHIPS}
        placeholder="Select relationship"
        defaultValue={maritalStatus === 'Married' ? 'Spouse' : ''}
        data-cy="step6-relationship"
      />

      <div className="relative">
        <MaskedInput
          label="Co-Applicant PAN"
          maskType="pan"
          showMasked={false}
          value={coApplicantPan}
          onChange={(e) => {
            setValue('coApplicantPan', e.target.value);
            panVerification.reset();
          }}
          onBlur={handlePanBlur}
          error={err('coApplicantPan') || panVerification.error}
          placeholder="Enter PAN (e.g., AAAAA9999A)"
          data-cy="step6-co-app-pan"
        />
        {panVerification.isVerifying && (
          <span className="text-xs text-primary absolute right-3 top-9">Verifying...</span>
        )}
        {panVerification.isVerified && (
          <span className="text-xs text-accent absolute right-3 top-9">✓ Verified</span>
        )}
      </div>

      <Input
        label="Co-Applicant Monthly Income (₹)"
        type="number"
        value={coApplicantIncome}
        onChange={handleChange('coApplicantIncome')}
        error={err('coApplicantIncome')}
        placeholder="Enter monthly income"
        inputMode="numeric"
        data-cy="step6-co-app-income"
      />

      <Checkbox
        label="I confirm that the co-applicant information provided is accurate and the co-applicant has consented to this application"
        checked={coApplicantConsent}
        onChange={(e) => setValue('coApplicantConsent', e.target.checked)}
        error={err('coApplicantConsent')}
        data-cy="step6-consent"
      />

      <SignatureCanvas
        label="Co-Applicant Signature"
        value={coApplicantSignature}
        onChange={handleSignatureEnd}
        error={err('coApplicantSignature')}
        data-cy="step6-co-app-signature"
      />
    </div>
  );
}
