import { z } from 'zod';
import { RELATIONSHIPS } from '../constants';
import { validatePAN } from '../utils/validators';

export default function step6Schema(formState = {}) {
  const showCoApplicant = formState.showCoApplicant === true;

  if (!showCoApplicant) {
    return z.object({
      showCoApplicant: z.boolean(),
    });
  }

  return z.object({
    showCoApplicant: z.boolean(),
    coApplicantName: z.string().min(1, 'Co-applicant name is required'),
    coApplicantRelationship: z.string()
      .min(1, 'Select relationship')
      .refine((val) => RELATIONSHIPS.includes(val), 'Select a valid relationship'),
    coApplicantPan: z.string()
      .min(1, 'Co-applicant PAN is required')
      .refine(
        (val) => {
          const result = validatePAN(val, formState.loanType);
          return result.valid;
        },
        (val) => {
          const result = validatePAN(val, formState.loanType);
          return { message: result.error || 'Invalid PAN' };
        },
      ),
    coApplicantIncome: z.string()
      .min(1, 'Co-applicant income is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid income'),
    coApplicantConsent: z.literal(true, {
      errorMap: () => ({ message: 'You must give consent for co-applicant' }),
    }),
  });
}
