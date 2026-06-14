import { useCallback } from 'react';
import MaskedInput from './common/MaskedInput';
import Checkbox from './common/Checkbox';
import Input from './common/Input';
import useVerification from '../hooks/useVerification';
import { LOAN_TYPES } from '../constants';

export default function Step3KYC({ watch, setValue, errors }) {
  const panNumber = watch('panNumber');
  const aadhaarNumber = watch('aadhaarNumber');
  const aadhaarConsent = watch('aadhaarConsent');
  const voterId = watch('voterId');
  const passport = watch('passport');
  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');

  const showPassport = loanType === LOAN_TYPES.HOME && Number(loanAmount) > 500000;

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

  const err = (f) => errors[f]?.message;

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
            setValue('panNumber', e.target.value);
            panVerification.reset();
          }}
          onBlur={handlePanBlur}
          error={err('panNumber') || panVerification.error}
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
            setValue('aadhaarNumber', e.target.value);
            aadhaarVerification.reset();
          }}
          onBlur={handleAadhaarBlur}
          error={err('aadhaarNumber') || aadhaarVerification.error}
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
        onChange={(e) => setValue('aadhaarConsent', e.target.checked)}
        error={err('aadhaarConsent')}
        data-cy="step3-aadhaar-consent"
      />

      <Input
        label="Voter ID (optional)"
        value={voterId}
        onChange={(e) => setValue('voterId', e.target.value)}
        error={err('voterId')}
        placeholder="Format: ABC1234567"
        data-cy="step3-voter-id"
      />

      {showPassport && (
        <Input
          label="Passport Number"
          value={passport}
          onChange={(e) => setValue('passport', e.target.value)}
          error={err('passport')}
          placeholder="Format: A1234567"
          data-cy="step3-passport"
        />
      )}
    </div>
  );
}
