import { z } from 'zod';

export default function step8Schema() {
  return z.object({
    consentAccurate: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm the information is accurate' }),
    }),
    consentCreditCheck: z.literal(true, {
      errorMap: () => ({ message: 'You must authorise credit check' }),
    }),
    consentTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept terms and conditions' }),
    }),
    consentCommunications: z.literal(true, {
      errorMap: () => ({ message: 'You must consent to receive communications' }),
    }),
  });
}
