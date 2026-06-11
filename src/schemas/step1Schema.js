import { z } from 'zod';
import { LOAN_TYPES, AMOUNT_RANGES, TENURE_RANGES } from '../constants';

export default function step1Schema(formState = {}) {
  const loanType = formState.loanType || '';
  const amountRange = AMOUNT_RANGES[loanType] || { min: 0, max: Infinity };
  const tenureRange = TENURE_RANGES[loanType] || { min: 1, max: 360 };

  return z.object({
    loanType: z.string()
      .min(1, 'Please select a loan type')
      .refine(
        (val) => [LOAN_TYPES.PERSONAL, LOAN_TYPES.HOME, LOAN_TYPES.BUSINESS].includes(val),
        'Please select a loan type',
      ),
    loanAmount: z.string()
      .min(1, 'Enter loan amount')
      .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
      .refine((val) => Number(val) >= amountRange.min, `Minimum amount is ₹${amountRange.min.toLocaleString('en-IN')}`)
      .refine((val) => Number(val) <= amountRange.max, `Maximum amount is ₹${amountRange.max.toLocaleString('en-IN')}`),
    loanTenure: z.string()
      .min(1, 'Select loan tenure')
      .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
      .refine((val) => Number(val) >= tenureRange.min, `Minimum tenure is ${tenureRange.min} months`)
      .refine((val) => Number(val) <= tenureRange.max, `Maximum tenure is ${tenureRange.max} months`),
    loanPurpose: z.string().min(1, 'Select loan purpose'),
    referralCode: z.string().optional(),
  }).partial({
    referralCode: true,
  });
}
