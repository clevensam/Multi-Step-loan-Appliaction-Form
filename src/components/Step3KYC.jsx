import { useCallback } from 'react';
import MaskedInput from './common/MaskedInput';
import Checkbox from './common/Checkbox';
import Input from './common/Input';
import useVerification from '../hooks/useVerification';
import { LOAN_TYPES } from '../constants';

export default function Step3KYC({ formData, updateFields, errors }) {
  const {
    panNumber, aadhaarNumber, aadhaarConsent, voterId, passport,
    loanType, loanAmount,
  } = formData;

  const showPassport = loanType === LOAN_TYPES.HOME && Number(loanAmount) > 500000;

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target?.value !== undefined ? e.target.value : e;
    updateFields({ [field]: value });
  }, [updateFields]);

  const panVerification = useVerification({
    type: 'pan',
    value: panNumber,
    onVerified: () => {},
  });

  const aadhaarVerification = useVerification({
    type: 'aadhaar',
    value: aadhaarNumber,
    onVerified: () => {},
  });

  const handlePanBlur = useCallback(() => {
    if (panNumber) panVerification.verify();
  }, [panNumber, panVerification]);

  const handleAadhaarBlur = useCallback(() => {
    if (aadhaarNumber) aadhaarVerification.verify();
  }, [aadhaarNumber, aadhaarVerification]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Identity Verification (KYC)</h2>

      <div className="relative">
        <MaskedInput
          label="PAN Number"
          maskType="pan"
          showMasked={false}
          value={panNumber}
          onChange={(e) => {
            handleChange('panNumber')(e);
            panVerification.reset();
          }}
          onBlur={handlePanBlur}
          error={errors?.panNumber || panVerification.error}
          placeholder="Enter PAN (e.g., AAAAA9999A)"
          data-cy="step3-pan"
        />
        {panVerification.isVerifying && (
          <span className="text-xs text-primary absolute right-3 top-9">Verifying...</span>
        )}
        {panVerification.isVerified && (
          <span className="text-xs text-accent absolute right-3 top-9">✓ Verified</span>
        )}
      </div>

      <div className="relative">
        <MaskedInput
          label="Aadhaar Number"
          maskType="aadhaar"
          showMasked={false}
          value={aadhaarNumber}
          onChange={(e) => {
            handleChange('aadhaarNumber')(e);
            aadhaarVerification.reset();
          }}
          onBlur={handleAadhaarBlur}
          error={errors?.aadhaarNumber || aadhaarVerification.error}
          placeholder="Enter 12-digit Aadhaar"
          data-cy="step3-aadhaar"
        />
        {aadhaarVerification.isVerifying && (
          <span className="text-xs text-primary absolute right-3 top-9">Verifying...</span>
        )}
        {aadhaarVerification.isVerified && (
          <span className="text-xs text-accent absolute right-3 top-9">✓ Verified</span>
        )}
      </div>

      <Checkbox
        label="I consent to Aadhaar-based verification as per UIDAI guidelines"
        checked={aadhaarConsent}
        onChange={handleChange('aadhaarConsent')}
        error={errors?.aadhaarConsent}
        data-cy="step3-aadhaar-consent"
      />

      <Input
        label="Voter ID (optional)"
        value={voterId}
        onChange={handleChange('voterId')}
        error={errors?.voterId}
        placeholder="Format: ABC1234567"
        data-cy="step3-voter-id"
      />

      {showPassport && (
        <Input
          label="Passport Number"
          value={passport}
          onChange={handleChange('passport')}
          error={errors?.passport}
          placeholder="Format: A1234567"
          data-cy="step3-passport"
        />
      )}
    </div>
  );
}
