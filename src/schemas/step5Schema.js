import { z } from 'zod';
import { LOAN_TYPES, EMPLOYMENT_TYPES } from '../constants';
import { validateGST } from '../utils/validators';

export default function step5Schema(formState = {}) {
  const loanType = formState.loanType || '';
  const isBusinessLoan = loanType === LOAN_TYPES.BUSINESS;

  const salariedSchema = z.object({
    employmentType: z.literal(EMPLOYMENT_TYPES.SALARIED),
    companyName: z.string().min(1, 'Company name is required'),
    designation: z.string().min(1, 'Designation is required'),
    monthlyNetSalary: z.string()
      .min(1, 'Monthly net salary is required')
      .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
      .refine((val) => Number(val) >= 15000, 'Minimum monthly salary is ₹15,000'),
    yearsOfExperience: z.string()
      .min(1, 'Years of experience is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number'),
  });

  const selfEmployedSchema = z.object({
    employmentType: z.literal(EMPLOYMENT_TYPES.SELF_EMPLOYED),
    businessName: z.string().min(1, 'Business name is required'),
    businessType: z.string().min(1, 'Business type is required'),
    annualTurnover: z.string()
      .min(1, 'Annual turnover is required')
      .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
      .refine((val) => Number(val) >= 300000, 'Minimum annual turnover is ₹3,00,000'),
    yearsInBusiness: z.string()
      .min(1, 'Years in business is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number')
      .refine((val) => Number(val) >= 2, 'Minimum 2 years in business required'),
    monthlyIncome: z.string()
      .min(1, 'Monthly income is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number'),
  });

  const businessOwnerSchema = z.object({
    employmentType: z.literal(EMPLOYMENT_TYPES.BUSINESS_OWNER),
    businessName: z.string().min(1, 'Business name is required'),
    businessType: z.string().min(1, 'Business type is required'),
    annualTurnover: z.string()
      .min(1, 'Annual turnover is required')
      .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
      .refine((val) => Number(val) >= 300000, 'Minimum annual turnover is ₹3,00,000'),
    yearsInBusiness: z.string()
      .min(1, 'Years in business is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number')
      .refine((val) => Number(val) >= 2, 'Minimum 2 years in business required'),
    monthlyIncome: z.string()
      .min(1, 'Monthly income is required')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number'),
    gstNumber: z.string()
      .min(1, 'GST number is required')
      .refine((val) => {
        const result = validateGST(val);
        return result.valid;
      }, (val) => {
        const result = validateGST(val);
        return { message: result.error || 'Invalid GST number' };
      }),
    officeAddress: z.string().min(1, 'Office/business address is required'),
  });

  const emptySchema = z.object({
    employmentType: z.literal(''),
  });

  const schemas = [selfEmployedSchema, businessOwnerSchema];
  if (!isBusinessLoan) schemas.unshift(salariedSchema);

  return z.discriminatedUnion('employmentType', [
    emptySchema,
    ...schemas,
  ]);
}
