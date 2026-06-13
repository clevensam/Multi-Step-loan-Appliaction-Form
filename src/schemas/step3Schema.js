import { z } from 'zod';
import { LOAN_TYPES } from '../constants';
import { validatePAN, validateAadhaar } from '../utils/validators';

export default function step3Schema(formState = {}) {
  const loanType = formState.loanType || '';
  const loanAmount = Number(formState.loanAmount) || 0;
  const showPassport = loanType === LOAN_TYPES.HOME && loanAmount > 500000;

  return z.object({
    panNumber: z.string()
      .min(1, 'PAN is required')
      .refine(
        (val) => {
          const result = validatePAN(val, loanType);
          return result.valid;
        },
        (val) => {
          const result = validatePAN(val, loanType);
          return { message: result.error || 'Invalid PAN' };
        },
      ),
    aadhaarNumber: z.string()
      .min(1, 'Aadhaar is required')
      .refine(
        (val) => {
          const result = validateAadhaar(val);
          return result.valid;
        },
        (val) => {
          const result = validateAadhaar(val);
          return { message: result.error || 'Invalid Aadhaar' };
        },
      ),
    aadhaarConsent: z.literal(true, {
      errorMap: () => ({ message: 'You must consent to Aadhaar verification' }),
    }),
    voterId: z.string()
      .optional()
      .refine(
        (val) => !val || /^[A-Z]{3}\d{7}$/.test(val.toUpperCase()),
        'Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567)',
      ),
    passport: z.string()
      .optional()
      .refine(
        (val) => !val || /^[A-Z]\d{7}$/.test(val.toUpperCase()),
        'Passport must be 1 letter followed by 7 digits',
      ),
  }).superRefine((data, ctx) => {
    if (showPassport && !data.passport) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passport is required for home loans above ₹5,00,000',
        path: ['passport'],
      });
    }
  });
}
