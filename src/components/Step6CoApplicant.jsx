import { useCallback, useEffect } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import MaskedInput from './common/MaskedInput';
import Checkbox from './common/Checkbox';
import SignatureCanvas from './common/SignatureCanvas';
import useVerification from '../hooks/useVerification';
import { RELATIONSHIPS } from '../constants';

export default function Step6CoApplicant({ formData, updateFields, errors }) {
  const {
    maritalStatus,
    coApplicantName, coApplicantRelationship, coApplicantPan,
    coApplicantIncome, coApplicantConsent,
  } = formData;

  useEffect(() => {
    if (maritalStatus === 'Married' && !coApplicantRelationship) {
      updateFields({ coApplicantRelationship: 'Spouse' });
    }
  }, [maritalStatus, coApplicantRelationship, updateFields]);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.type === 'checkbox'
      ? e.target.checked
      : e.target?.value !== undefined
        ? e.target.value
        : e;
    updateFields({ [field]: value });
  }, [updateFields]);

  const panVerification = useVerification({
    type: 'pan',
    value: coApplicantPan,
    onVerified: () => {},
  });

  const handlePanBlur = useCallback(() => {
    if (coApplicantPan) panVerification.verify();
  }, [coApplicantPan, panVerification]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Co-Applicant & Guarantor</h2>
      <p className="text-gray-500 mb-6">
        Provide co-applicant or guarantor details. This helps strengthen your application.
      </p>

      <Input
        label="Co-Applicant Full Name"
        value={coApplicantName}
        onChange={handleChange('coApplicantName')}
        error={errors?.coApplicantName}
        placeholder="Enter co-applicant name"
        data-cy="step6-co-app-name"
      />

      <Select
        label="Relationship"
        placeholder="Select relationship"
        options={RELATIONSHIPS}
        value={coApplicantRelationship}
        onChange={handleChange('coApplicantRelationship')}
        error={errors?.coApplicantRelationship}
        data-cy="step6-relationship"
      />

      <div className="relative">
        <MaskedInput
          label="Co-Applicant PAN"
          maskType="pan"
          showMasked={false}
          value={coApplicantPan}
          onChange={(e) => {
            handleChange('coApplicantPan')(e);
            panVerification.reset();
          }}
          onBlur={handlePanBlur}
          error={errors?.coApplicantPan || panVerification.error}
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
        value={coApplicantIncome}
        onChange={handleChange('coApplicantIncome')}
        error={errors?.coApplicantIncome}
        placeholder="Enter monthly income"
        inputMode="numeric"
        data-cy="step6-co-app-income"
      />

      <SignatureCanvas
        label="Co-Applicant Signature"
        value={formData.coApplicantSignature}
        onChange={handleChange('coApplicantSignature')}
        error={errors?.coApplicantSignature}
        data-cy="step6-co-app-signature"
      />

      <Checkbox
        label="I confirm that the co-applicant details provided are accurate and I have their consent"
        checked={coApplicantConsent}
        onChange={handleChange('coApplicantConsent')}
        error={errors?.coApplicantConsent}
        data-cy="step6-consent"
      />
    </div>
  );
}
