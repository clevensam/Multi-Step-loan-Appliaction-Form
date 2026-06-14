import { useCallback } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import RadioGroup from './common/RadioGroup';
import MaskedInput from './common/MaskedInput';
import useVerification from '../hooks/useVerification';
import { GENDERS, MARITAL_STATUSES } from '../constants';

export default function Step2PersonalInfo({ watch, setValue, errors }) {
  const fullName = watch('fullName');
  const dateOfBirth = watch('dateOfBirth');
  const gender = watch('gender');
  const maritalStatus = watch('maritalStatus');
  const fatherName = watch('fatherName');
  const motherName = watch('motherName');
  const email = watch('email');
  const mobile = watch('mobile');
  const alternateMobile = watch('alternateMobile');

  const emailVerification = useVerification({
    type: 'email',
    value: email,
    onVerified: () => {},
  });

  const mobileVerification = useVerification({
    type: 'mobile',
    value: mobile,
    onVerified: () => {},
  });

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.value !== undefined ? e.target.value : e;
    setValue(field, value);
  }, [setValue]);

  const err = (f) => errors[f]?.message;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>

      <Input
        label="Full Name"
        value={fullName}
        onChange={handleChange('fullName')}
        error={err('fullName')}
        placeholder="Enter your full name"
        autoComplete="name"
        data-cy="step2-full-name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={dateOfBirth}
          onChange={handleChange('dateOfBirth')}
          error={err('dateOfBirth')}
          data-cy="step2-dob"
        />

        <Select
          label="Gender"
          placeholder="Select gender"
          options={GENDERS}
          value={gender}
          onChange={handleChange('gender')}
          error={err('gender')}
          data-cy="step2-gender"
        />
      </div>

      <Select
        label="Marital Status"
        placeholder="Select marital status"
        options={MARITAL_STATUSES}
        value={maritalStatus}
        onChange={handleChange('maritalStatus')}
        error={err('maritalStatus')}
        data-cy="step2-marital-status"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Father's Name"
          value={fatherName}
          onChange={handleChange('fatherName')}
          error={err('fatherName')}
          placeholder="Enter father's name"
          autoComplete="family-name"
          data-cy="step2-father-name"
        />

        <Input
          label="Mother's Name"
          value={motherName}
          onChange={handleChange('motherName')}
          error={err('motherName')}
          placeholder="Enter mother's name"
          autoComplete="family-name"
          data-cy="step2-mother-name"
        />
      </div>

      <div className="relative">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            handleChange('email')(e);
            emailVerification.reset();
          }}
          onBlur={(e) => {
            if (e.target.value) emailVerification.verify();
          }}
          error={err('email') || emailVerification.error}
          placeholder="your@email.com"
          autoComplete="email"
          data-cy="step2-email"
        />
        {emailVerification.isVerifying && (
          <span className="text-xs text-primary absolute right-3 top-9">Verifying...</span>
        )}
        {emailVerification.isVerified && (
          <span className="text-xs text-accent absolute right-3 top-9">✓ Verified</span>
        )}
      </div>

      <div className="relative">
        <MaskedInput
          label="Mobile Number"
          maskType="mobile"
          value={mobile}
          onChange={(e) => {
            handleChange('mobile')(e);
            mobileVerification.reset();
          }}
          onBlur={(e) => {
            if (e.target.value) mobileVerification.verify();
          }}
          error={err('mobile') || mobileVerification.error}
          placeholder="Enter 10-digit mobile"
          autoComplete="tel"
          data-cy="step2-mobile"
        />
        {mobileVerification.isVerifying && (
          <span className="text-xs text-primary absolute right-3 top-9">Verifying...</span>
        )}
        {mobileVerification.isVerified && (
          <span className="text-xs text-accent absolute right-3 top-9">✓ Verified</span>
        )}
      </div>

      <Input
        label="Alternate Mobile (optional)"
        value={alternateMobile}
        onChange={handleChange('alternateMobile')}
        error={err('alternateMobile')}
        placeholder="Enter alternate mobile number"
        autoComplete="tel"
        data-cy="step2-alternate-mobile"
      />
    </div>
  );
}
