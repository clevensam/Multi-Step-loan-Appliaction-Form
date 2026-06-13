import { INTEREST_RATES } from '../constants';

export function calculateEMI(principal, annualRate, tenureMonths) {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  const numerator = principal * monthlyRate * (1 + monthlyRate) ** tenureMonths;
  const denominator = (1 + monthlyRate) ** tenureMonths - 1;
  return numerator / denominator;
}

export function calculateTotalPayable(emi, tenureMonths) {
  return emi * tenureMonths;
}

export function calculateTotalInterest(totalPayable, principal) {
  return totalPayable - principal;
}

export function calculateProcessingFee(principal) {
  const fee = principal * 0.01;
  return Math.round(Math.min(Math.max(fee, 2000), 25000));
}

export function getPreApprovalSummary(loanType, amount, tenureMonths) {
  const annualRate = INTEREST_RATES[loanType];
  if (!annualRate || !amount || !tenureMonths) return null;

  const principal = Number(amount);
  const tenure = Number(tenureMonths);
  const emi = calculateEMI(principal, annualRate, tenure);
  const totalPayable = calculateTotalPayable(emi, tenure);
  const totalInterest = calculateTotalInterest(totalPayable, principal);
  const processingFee = calculateProcessingFee(principal);

  return {
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalInterest),
    processingFee,
    annualRate,
  };
}
