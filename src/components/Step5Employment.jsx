import { useCallback } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import RadioGroup from './common/RadioGroup';
import { LOAN_TYPES, EMPLOYMENT_TYPES } from '../constants';

const EMPLOYMENT_OPTIONS = [
  { value: EMPLOYMENT_TYPES.SALARIED, label: 'Salaried' },
  { value: EMPLOYMENT_TYPES.SELF_EMPLOYED, label: 'Self-Employed' },
  { value: EMPLOYMENT_TYPES.BUSINESS_OWNER, label: 'Business Owner' },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'sole-proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private-limited', label: 'Private Limited' },
  { value: 'llp', label: 'LLP' },
  { value: 'public-limited', label: 'Public Limited' },
  { value: 'other-business-type', label: 'Other' },
];

export default function Step5Employment({ formData, updateFields, errors }) {
  const {
    loanType, employmentType,
    companyName, designation, monthlyNetSalary, yearsOfExperience,
    businessName, businessType, annualTurnover, yearsInBusiness,
    monthlyIncome, gstNumber, officeAddress,
  } = formData;

  const isBusinessLoan = loanType === LOAN_TYPES.BUSINESS;

  const filteredOptions = isBusinessLoan
    ? EMPLOYMENT_OPTIONS.filter((o) => o.value !== EMPLOYMENT_TYPES.SALARIED)
    : EMPLOYMENT_OPTIONS;

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.value !== undefined ? e.target.value : e;
    const updates = { [field]: value };

    if (field === 'employmentType' && value !== employmentType) {
      updates.companyName = '';
      updates.designation = '';
      updates.monthlyNetSalary = '';
      updates.yearsOfExperience = '';
      updates.businessName = '';
      updates.businessType = '';
      updates.annualTurnover = '';
      updates.yearsInBusiness = '';
      updates.monthlyIncome = '';
      updates.gstNumber = '';
      updates.officeAddress = '';
    }

    updateFields(updates);
  }, [updateFields, employmentType]);

  const isSalaried = employmentType === EMPLOYMENT_TYPES.SALARIED;
  const isSelfEmployed = employmentType === EMPLOYMENT_TYPES.SELF_EMPLOYED;
  const isBusinessOwner = employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employment & Income Details</h2>

      {isBusinessLoan && (
        <div className="bg-warning bg-opacity-10 border border-warning rounded-lg p-3 mb-6 text-sm text-warning-800">
          Business loan requires Self-Employed or Business Owner employment type.
        </div>
      )}

      <RadioGroup
        label="Employment Type"
        name="employmentType"
        options={filteredOptions}
        value={employmentType}
        onChange={handleChange('employmentType')}
        layout="horizontal"
        error={errors?.employmentType}
        data-cy="step5-employment-type"
      />

      {isSalaried && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-3">Salaried Employee Details</h3>
          <Input
            label="Company Name"
            value={companyName}
            onChange={handleChange('companyName')}
            error={errors?.companyName}
            placeholder="Enter company name"
            autoComplete="organization"
            data-cy="step5-company-name"
          />
          <Input
            label="Designation"
            value={designation}
            onChange={handleChange('designation')}
            error={errors?.designation}
            placeholder="Enter your designation"
            data-cy="step5-designation"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Monthly Net Salary (₹)"
              value={monthlyNetSalary}
              onChange={handleChange('monthlyNetSalary')}
              error={errors?.monthlyNetSalary}
              placeholder="Minimum ₹15,000"
              inputMode="numeric"
              data-cy="step5-monthly-salary"
            />
            <Input
              label="Years of Experience"
              value={yearsOfExperience}
              onChange={handleChange('yearsOfExperience')}
              error={errors?.yearsOfExperience}
              placeholder="Total years"
              inputMode="numeric"
              data-cy="step5-experience"
            />
          </div>
        </div>
      )}

      {(isSelfEmployed || isBusinessOwner) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-3">
            {isBusinessOwner ? 'Business Owner Details' : 'Self-Employed Details'}
          </h3>
          <Input
            label="Business Name"
            value={businessName}
            onChange={handleChange('businessName')}
            error={errors?.businessName}
            placeholder="Enter business name"
            data-cy="step5-business-name"
          />
          <Select
            label="Business Type"
            placeholder="Select business type"
            options={BUSINESS_TYPE_OPTIONS}
            value={businessType}
            onChange={handleChange('businessType')}
            error={errors?.businessType}
            data-cy="step5-business-type"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Annual Turnover (₹)"
              value={annualTurnover}
              onChange={handleChange('annualTurnover')}
              error={errors?.annualTurnover}
              placeholder="Minimum ₹3,00,000"
              inputMode="numeric"
              data-cy="step5-annual-turnover"
            />
            <Input
              label="Years in Business"
              value={yearsInBusiness}
              onChange={handleChange('yearsInBusiness')}
              error={errors?.yearsInBusiness}
              placeholder="Minimum 2 years"
              inputMode="numeric"
              data-cy="step5-years-business"
            />
          </div>
          <Input
            label="Monthly Income (₹)"
            value={monthlyIncome}
            onChange={handleChange('monthlyIncome')}
            error={errors?.monthlyIncome}
            placeholder="Enter average monthly income"
            inputMode="numeric"
            data-cy="step5-monthly-income"
          />
          {isBusinessOwner && (
            <>
              <Input
                label="GST Number"
                value={gstNumber}
                onChange={handleChange('gstNumber')}
                error={errors?.gstNumber}
                placeholder="e.g., 29AAAAA0000A1Z5"
                data-cy="step5-gst-number"
              />
              <Input
                label="Office / Business Address"
                value={officeAddress}
                onChange={handleChange('officeAddress')}
                error={errors?.officeAddress}
                placeholder="Enter office or business address"
                data-cy="step5-office-address"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
