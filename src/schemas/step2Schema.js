import { z } from 'zod';
import { GENDERS, MARITAL_STATUSES } from '../constants';

function calculateAge(dob) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export default function step2Schema(formState = {}) {
  return z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    dateOfBirth: z.string()
      .min(1, 'Enter date of birth')
      .refine((val) => {
        const a = calculateAge(val);
        return a >= 21;
      }, 'You must be at least 21 years old')
      .refine((val) => {
        const a = calculateAge(val);
        return a <= 65;
      }, 'Maximum age is 65 years'),
    gender: z.string()
      .min(1, 'Please select your gender')
      .refine((val) => GENDERS.includes(val), 'Please select your gender'),
    maritalStatus: z.string()
      .min(1, 'Please select marital status')
      .refine((val) => MARITAL_STATUSES.includes(val), 'Please select marital status'),
    fatherName: z.string().min(2, 'Father name must be at least 2 characters').max(100),
    motherName: z.string().min(2, 'Mother name must be at least 2 characters').max(100),
    email: z.string().email('Enter a valid email address'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Mobile must start with 6-9 and be exactly 10 digits'),
    alternateMobile: z.string()
      .optional()
      .refine(
        (val) => !val || /^[6-9]\d{9}$/.test(val),
        'Alternate mobile must start with 6-9 and be 10 digits',
      )
      .refine(
        (val) => !val || val !== formState.mobile,
        'Alternate mobile must differ from mobile number',
      ),
  }).superRefine((data, ctx) => {
    const ageVal = calculateAge(data.dateOfBirth);
    const tenureVal = Number(formState.loanTenure) || 0;
    if (ageVal + tenureVal / 12 > 65) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `At age ${ageVal}, the maximum allowed tenure for you is ${Math.floor((65 - ageVal) * 12)} months`,
        path: ['dateOfBirth'],
      });
    }
  });
}
