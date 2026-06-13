import { z } from 'zod';
import { RESIDENCE_TYPES } from '../constants';

export default function step4Schema(formState = {}) {
  const isSameAsPermanent = formState.isSameAsPermanent === true || formState.isSameAsPermanent === 'true';
  const residenceType = formState.residenceType || '';
  const yearsAtAddress = Number(formState.yearsAtAddress) || 0;

  let schema = z.object({
    currentAddressLine1: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long'),
    currentAddressLine2: z.string().max(200).optional(),
    pinCode: z.string()
      .min(1, 'PIN code is required')
      .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    residenceType: z.string()
      .min(1, 'Please select residence type')
      .refine((val) => RESIDENCE_TYPES.includes(val), 'Please select residence type'),
    rentAmount: z.string().optional(),
    yearsAtAddress: z.string()
      .min(1, 'Enter years at current address')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Enter a valid number')
      .refine((val) => Number(val) <= 50, 'Years at address cannot exceed 50'),
    previousAddressLine1: z.string().optional(),
    previousAddressLine2: z.string().optional(),
    isSameAsPermanent: z.boolean(),
    permanentAddressLine1: z.string().optional(),
    permanentAddressLine2: z.string().optional(),
    permanentPinCode: z.string().optional(),
    permanentCity: z.string().optional(),
    permanentState: z.string().optional(),
  });

  if (residenceType === 'Rented' || residenceType === 'rented') {
    schema = schema.refine(
      (data) => data.rentAmount && Number(data.rentAmount) > 0,
      { message: 'Enter rent amount', path: ['rentAmount'] },
    );
  }

  if (yearsAtAddress < 1) {
    schema = schema.refine(
      (data) => data.previousAddressLine1 && data.previousAddressLine1.length >= 5,
      {
        message: 'Previous address is required when living at current address for less than 1 year',
        path: ['previousAddressLine1'],
      },
    );
  }

  if (!isSameAsPermanent) {
    schema = schema.refine(
      (data) => data.permanentAddressLine1 && data.permanentAddressLine1.length >= 5,
      { message: 'Permanent address is required', path: ['permanentAddressLine1'] },
    ).refine(
      (data) => data.permanentPinCode && /^\d{6}$/.test(data.permanentPinCode),
      { message: 'Enter a valid 6-digit PIN code', path: ['permanentPinCode'] },
    ).refine(
      (data) => data.permanentCity && data.permanentCity.length >= 2,
      { message: 'Permanent city is required', path: ['permanentCity'] },
    ).refine(
      (data) => data.permanentState && data.permanentState.length >= 2,
      { message: 'Permanent state is required', path: ['permanentState'] },
    );
  }

  return schema;
}
