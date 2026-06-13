import { z } from 'zod';
import { EMPLOYMENT_TYPES, INTEREST_RATES } from '../constants';
import { calculateEMI } from '../utils/emiCalculator';

function getMonthlyIncome(formState) {
  let income = 0;
  if (formState.employmentType === EMPLOYMENT_TYPES.SALARIED) {
    income = Number(formState.monthlyNetSalary) || 0;
  } else {
    income = Number(formState.monthlyIncome) || 0;
  }
  if (formState.coApplicantIncome) {
    income += Number(formState.coApplicantIncome) || 0;
  }
  return income;
}

function computeEmiRatio(formState) {
  const { loanType, loanAmount, loanTenure } = formState;
  if (!loanType || !loanAmount || !loanTenure) return 0;
  const annualRate = INTEREST_RATES[loanType];
  if (!annualRate) return 0;
  const emi = calculateEMI(Number(loanAmount), annualRate, Number(loanTenure));
  const monthlyIncome = getMonthlyIncome(formState);
  if (monthlyIncome <= 0) return 0;
  return (emi / monthlyIncome) * 100;
}

export default function step8Schema(formState = {}) {
  const emiRatio = computeEmiRatio(formState);

  const shape = {
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
  };

  if (emiRatio > 50) {
    shape.consentHighEmi = z.literal(true, {
      errorMap: () => ({ message: 'You must consent to proceed with this EMI ratio' }),
    });
  }

  return z.object(shape);
}
