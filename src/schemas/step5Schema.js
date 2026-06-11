import { z } from 'zod';
import { LOAN_TYPES, EMPLOYMENT_TYPES } from '../constants';
import { validateGST } from '../utils/validators';

const SALARIED_VALUES = [EMPLOYMENT_TYPES.SALARIED];
const BUSINESS_VALUES = [EMPLOYMENT_TYPES.SELF_EMPLOYED, EMPLOYMENT_TYPES.BUSINESS_OWNER];

export default function step5Schema(formState = {}) {
  const loanType = formState.loanType || '';
  const employmentType = formState.employmentType || '';

  let allowedTypes;
  if (loanType === LOAN_TYPES.BUSINESS) {
    allowedTypes = [...BUSINESS_VALUES];
  } else {
    allowedTypes = [...SALARIED_VALUES, ...BUSINESS_VALUES];
  }

  let schema = z.object({
    employmentType: z.string()
      .min(1, 'Select employment type')
      .refine((val) => allowedTypes.includes(val), {
        message: loanType === LOAN_TYPES.BUSINESS
          ? 'Business loan requires Self-Employed or Business Owner'
          : 'Select a valid employment type',
      }),
    companyName: z.string().optional(),
    designation: z.string().optional(),
    monthlyNetSalary: z.string().optional(),
    yearsOfExperience: z.string().optional(),
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    annualTurnover: z.string().optional(),
    yearsInBusiness: z.string().optional(),
    monthlyIncome: z.string().optional(),
    gstNumber: z.string().optional(),
    officeAddress: z.string().optional(),
  });

  if (employmentType === EMPLOYMENT_TYPES.SALARIED) {
    schema = schema.extend({
      companyName: z.string().min(1, 'Company name is required'),
      designation: z.string().min(1, 'Designation is required'),
      monthlyNetSalary: z.string()
        .min(1, 'Monthly net salary is required')
        .refine((val) => !Number.isNaN(Number(val)), 'Enter a valid number')
        .refine((val) => Number(val) >= 15000, 'Minimum monthly salary is ₹15,000'),
      yearsOfExperience: z.string()
        .min(1, 'Years of experience is required')
        .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number'),
    }).partial({
      businessName: true,
      businessType: true,
      annualTurnover: true,
      yearsInBusiness: true,
      monthlyIncome: true,
      gstNumber: true,
      officeAddress: true,
    });
  }

  if (BUSINESS_VALUES.includes(employmentType)) {
    const isOwner = employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER;
    schema = schema.extend({
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
      ...(isOwner ? {
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
      } : {}),
    }).partial({
      companyName: true,
      designation: true,
      monthlyNetSalary: true,
      yearsOfExperience: true,
    });
  }

  return schema;
}
