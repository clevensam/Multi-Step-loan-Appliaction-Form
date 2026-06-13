import { useCallback } from 'react';
import Input from './common/Input';
import Select from './common/Select';
import RadioGroup from './common/RadioGroup';
import CurrencyInput from './common/CurrencyInput';
import { LOAN_TYPES, AMOUNT_RANGES, TENURE_RANGES, LOAN_TYPE_LABELS } from '../constants';

const LOAN_TYPE_OPTIONS = [
  { value: LOAN_TYPES.PERSONAL, label: LOAN_TYPE_LABELS[LOAN_TYPES.PERSONAL] },
  { value: LOAN_TYPES.HOME, label: LOAN_TYPE_LABELS[LOAN_TYPES.HOME] },
  { value: LOAN_TYPES.BUSINESS, label: LOAN_TYPE_LABELS[LOAN_TYPES.BUSINESS] },
];

const PURPOSE_OPTIONS = {
  [LOAN_TYPES.PERSONAL]: [
    { value: 'debt-consolidation', label: 'Debt Consolidation' },
    { value: 'education', label: 'Education' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'travel', label: 'Travel' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'home-renovation', label: 'Home Renovation' },
    { value: 'other-personal', label: 'Other' },
  ],
  [LOAN_TYPES.HOME]: [
    { value: 'purchase', label: 'Home Purchase' },
    { value: 'construction', label: 'Home Construction' },
    { value: 'renovation', label: 'Home Renovation/Extension' },
    { value: 'plot-purchase', label: 'Plot Purchase' },
    { value: 'balance-transfer', label: 'Balance Transfer' },
    { value: 'other-home', label: 'Other' },
  ],
  [LOAN_TYPES.BUSINESS]: [
    { value: 'working-capital', label: 'Working Capital' },
    { value: 'expansion', label: 'Business Expansion' },
    { value: 'equipment', label: 'Equipment Purchase' },
    { value: 'inventory', label: 'Inventory Financing' },
    { value: 'startup', label: 'Startup Funding' },
    { value: 'other-business', label: 'Other' },
  ],
};

function getTenureOptions(loanType) {
  const range = TENURE_RANGES[loanType];
  if (!range) return [];
  const step = loanType === LOAN_TYPES.HOME ? 12 : 6;
  const options = [];
  for (let m = range.min; m <= range.max; m += step) {
    const years = m >= 12 ? `${Math.floor(m / 12)}yr` : '';
    const months = m % 12 === 0 ? '' : ` ${m % 12}m`;
    options.push({ value: String(m), label: `${m} months${years ? ` (${years}${months})` : ''}` });
  }
  return options;
}

export default function Step1LoanType({ formData, updateFields, errors }) {
  const { loanType, loanAmount, loanTenure, loanPurpose, referralCode } = formData;
  const amountRange = AMOUNT_RANGES[loanType] || { min: 50000, max: 1000000 };
  const purposes = PURPOSE_OPTIONS[loanType] || [];

  const handleChange = useCallback((field) => (e) => {
    const value = e.target?.value !== undefined ? e.target.value : e;
    const updates = { [field]: value };

    if (field === 'loanType' && value !== loanType) {
      const newAmountRange = AMOUNT_RANGES[value];
      if (newAmountRange) {
        updates.loanAmount = '';
      }
      updates.loanTenure = '';
      updates.loanPurpose = '';
    }

    updateFields(updates);
  }, [updateFields, loanType]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Loan Type & Basic Information</h2>

      <RadioGroup
        label="Select Loan Type"
        name="loanType"
        options={LOAN_TYPE_OPTIONS}
        value={loanType}
        onChange={handleChange('loanType')}
        layout="horizontal"
        error={errors?.loanType}
        data-cy="step1-loan-type"
      />

      {loanType && (
        <>
          <CurrencyInput
            label={`Loan Amount (₹${amountRange.min.toLocaleString('en-IN')} – ₹${amountRange.max.toLocaleString('en-IN')})`}
            value={loanAmount}
            onChange={handleChange('loanAmount')}
            error={errors?.loanAmount}
            data-cy="step1-loan-amount"
          />

          <Select
            label="Loan Tenure"
            placeholder="Select tenure"
            options={getTenureOptions(loanType)}
            value={loanTenure}
            onChange={handleChange('loanTenure')}
            error={errors?.loanTenure}
            data-cy="step1-loan-tenure"
          />

          <Select
            label="Loan Purpose"
            placeholder="Select purpose"
            options={purposes}
            value={loanPurpose}
            onChange={handleChange('loanPurpose')}
            error={errors?.loanPurpose}
            data-cy="step1-loan-purpose"
          />

          <Input
            label="Referral Code (optional)"
            value={referralCode}
            onChange={handleChange('referralCode')}
            placeholder="Enter referral code"
            data-cy="step1-referral-code"
          />
        </>
      )}
    </div>
  );
}
