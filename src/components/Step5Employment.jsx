import { useCallback } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import RadioGroup from './common/RadioGroup';
import { EMPLOYMENT_TYPES, BUSINESS_TYPES } from '../constants';

const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPES).map(([, value]) => ({
  value,
  label: value,
}));

export default function Step5Employment({ watch, setValue, errors }) {
  const employmentType = watch('employmentType');

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.value !== undefined ? e.target.value : e;
    setValue(field, value);
  }, [setValue]);

  const err = (f) => errors[f]?.message;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employment & Income Details</h2>

      <RadioGroup
        label="Employment Type"
        name="employmentType"
        options={EMPLOYMENT_TYPE_OPTIONS}
        value={employmentType}
        onChange={(e) => setValue('employmentType', e.target.value)}
        layout="horizontal"
        error={err('employmentType')}
        data-cy="step5-employment-type"
      />

      {employmentType === 'Salaried' && (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Salary Details</h3>
          <Input
            label="Company Name"
            value={watch('companyName')}
            onChange={handleChange('companyName')}
            error={err('companyName')}
            placeholder="Full legal name of company"
            autoComplete="organization"
            data-cy="step5-company-name"
          />
          <Input
            label="Designation"
            value={watch('designation')}
            onChange={handleChange('designation')}
            error={err('designation')}
            placeholder="Your job title"
            autoComplete="organization-title"
            data-cy="step5-designation"
          />
          <Input
            label="Monthly Net Salary (₹)"
            type="number"
            value={watch('monthlyNetSalary')}
            onChange={handleChange('monthlyNetSalary')}
            error={err('monthlyNetSalary')}
            placeholder="Minimum ₹15,000"
            inputMode="numeric"
            data-cy="step5-monthly-salary"
          />
          <Input
            label="Years of Experience"
            type="number"
            value={watch('yearsOfExperience')}
            onChange={handleChange('yearsOfExperience')}
            error={err('yearsOfExperience')}
            placeholder="Total years of work experience"
            inputMode="numeric"
            data-cy="step5-experience"
          />
        </div>
      )}

      {employmentType === 'Self-Employed' && (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Self-Employment Details</h3>
          <Input
            label="Business Name"
            value={watch('businessName')}
            onChange={handleChange('businessName')}
            error={err('businessName')}
            placeholder="Business / firm name"
            autoComplete="organization"
            data-cy="step5-business-name"
          />
          <Select
            label="Business Type"
            value={watch('businessType')}
            onChange={handleChange('businessType')}
            error={err('businessType')}
            options={BUSINESS_TYPES}
            placeholder="Select business type"
            data-cy="step5-business-type"
          />
          <Input
            label="Annual Turnover (₹)"
            type="number"
            value={watch('annualTurnover')}
            onChange={handleChange('annualTurnover')}
            error={err('annualTurnover')}
            placeholder="Minimum ₹3,00,000"
            inputMode="numeric"
            data-cy="step5-annual-turnover"
          />
          <Input
            label="Years in Business"
            type="number"
            value={watch('yearsInBusiness')}
            onChange={handleChange('yearsInBusiness')}
            error={err('yearsInBusiness')}
            placeholder="Minimum 2 years"
            inputMode="numeric"
            data-cy="step5-years-business"
          />
          <Input
            label="Monthly Income (₹)"
            type="number"
            value={watch('monthlyIncome')}
            onChange={handleChange('monthlyIncome')}
            error={err('monthlyIncome')}
            placeholder="Average monthly income from business"
            inputMode="numeric"
            data-cy="step5-monthly-income"
          />
        </div>
      )}

      {employmentType === 'Business Owner' && (
        <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Business Details</h3>
          <Input
            label="Business Name"
            value={watch('businessName')}
            onChange={handleChange('businessName')}
            error={err('businessName')}
            placeholder="Registered business name"
            autoComplete="organization"
            data-cy="step5-business-name"
          />
          <Select
            label="Business Type"
            value={watch('businessType')}
            onChange={handleChange('businessType')}
            error={err('businessType')}
            options={BUSINESS_TYPES}
            placeholder="Select business type"
            data-cy="step5-business-type"
          />
          <Input
            label="Annual Turnover (₹)"
            type="number"
            value={watch('annualTurnover')}
            onChange={handleChange('annualTurnover')}
            error={err('annualTurnover')}
            placeholder="Minimum ₹3,00,000"
            inputMode="numeric"
            data-cy="step5-annual-turnover"
          />
          <Input
            label="Years in Business"
            type="number"
            value={watch('yearsInBusiness')}
            onChange={handleChange('yearsInBusiness')}
            error={err('yearsInBusiness')}
            placeholder="Minimum 2 years"
            inputMode="numeric"
            data-cy="step5-years-business"
          />
          <Input
            label="GST Number"
            value={watch('gstNumber')}
            onChange={handleChange('gstNumber')}
            error={err('gstNumber')}
            placeholder="15-character GSTIN"
            data-cy="step5-gst-number"
          />
          <Input
            label="Office / Business Address"
            value={watch('officeAddress')}
            onChange={handleChange('officeAddress')}
            error={err('officeAddress')}
            placeholder="Registered office address"
            autoComplete="street-address"
            data-cy="step5-office-address"
          />
        </div>
      )}
    </div>
  );
}
