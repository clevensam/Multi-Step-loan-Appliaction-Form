import { z } from 'zod';
import { LOAN_TYPES, EMPLOYMENT_TYPES } from '../constants';

const DOCUMENT_SPECS = {
  panCard: {
    label: 'PAN Card Copy', accept: ['.pdf', '.jpg', '.png'], maxSize: 5 * 1024 * 1024,
  },
  aadhaarFront: {
    label: 'Aadhaar Front', accept: ['.pdf', '.jpg', '.png'], maxSize: 5 * 1024 * 1024,
  },
  aadhaarBack: {
    label: 'Aadhaar Back', accept: ['.pdf', '.jpg', '.png'], maxSize: 5 * 1024 * 1024,
  },
  salarySlips: {
    label: 'Salary Slips (last 3 months)', accept: ['.pdf'], maxSize: 5 * 1024 * 1024, multiple: true,
  },
  bankStatements: {
    label: 'Bank Statements (6 months)', accept: ['.pdf'], maxSize: 10 * 1024 * 1024,
  },
  itrReturns: {
    label: 'ITR Returns (2 years)', accept: ['.pdf'], maxSize: 5 * 1024 * 1024, multiple: true,
  },
  propertyDocs: {
    label: 'Property Documents', accept: ['.pdf'], maxSize: 10 * 1024 * 1024,
  },
  businessRegistration: {
    label: 'Business Registration', accept: ['.pdf'], maxSize: 5 * 1024 * 1024,
  },
  gstReturns: {
    label: 'GST Returns (4 quarters)', accept: ['.pdf'], maxSize: 5 * 1024 * 1024, multiple: true,
  },
  photograph: {
    label: 'Photograph', accept: ['.jpg', '.png'], maxSize: 2 * 1024 * 1024,
  },
};

export function getRequiredDocs(formState = {}) {
  const {
    loanType, employmentType, panVerified = false,
  } = formState;
  const isSalaried = employmentType === EMPLOYMENT_TYPES.SALARIED;
  const isSelfEmployed = employmentType === EMPLOYMENT_TYPES.SELF_EMPLOYED;
  const isBusinessOwner = employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER;
  const isHome = loanType === LOAN_TYPES.HOME;

  const required = [];

  if (!panVerified) required.push('panCard');
  required.push('aadhaarFront');
  required.push('aadhaarBack');
  if (isSalaried) required.push('salarySlips');
  required.push('bankStatements');
  if (isSelfEmployed || isBusinessOwner) required.push('itrReturns');
  if (isHome) required.push('propertyDocs');
  if (isBusinessOwner) required.push('businessRegistration');
  if (isBusinessOwner) required.push('gstReturns');
  required.push('photograph');

  return required;
}

export default function step7Schema(formState = {}) {
  const requiredDocs = getRequiredDocs(formState);
  const docs = formState.documents || {};

  const signature = formState.signature || '';

  const schemaShape = {
    signature: z.string().min(1, 'E-signature is required'),
  };

  requiredDocs.forEach((docKey) => {
    if (DOCUMENT_SPECS[docKey]?.multiple) {
      schemaShape[`documents.${docKey}`] = z
        .array(z.instanceof(File))
        .min(1, `${DOCUMENT_SPECS[docKey].label} is required`);
    } else {
      schemaShape[`documents.${docKey}`] = z
        .instanceof(File, { message: `${DOCUMENT_SPECS[docKey].label} is required` });
    }
  });

  const base = z.object(schemaShape);

  const refinements = [];
  requiredDocs.forEach((docKey) => {
    const spec = DOCUMENT_SPECS[docKey];
    if (!spec) return;
    if (spec.multiple) {
      const fieldVal = docs[docKey];
      if (Array.isArray(fieldVal)) {
        fieldVal.forEach((file, idx) => {
          if (file.size > spec.maxSize) {
            refinements.push({
              path: [`documents.${docKey}[${idx}]`],
              message: `${spec.label} exceeds ${spec.maxSize / 1024 / 1024}MB limit`,
            });
          }
        });
      }
    } else if (docKey !== 'panCard') {
      const file = docs[docKey];
      if (file && file instanceof File && file.size > spec.maxSize) {
        refinements.push({
          path: [`documents.${docKey}`],
          message: `${spec.label} exceeds ${spec.maxSize / 1024 / 1024}MB limit`,
        });
      }
    }
  });

  if (refinements.length > 0 || !signature) {
    return base.superRefine((data, ctx) => {
      if (!data.signature) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'E-signature is required',
          path: ['signature'],
        });
      }
      requiredDocs.forEach((docKey) => {
        const spec = DOCUMENT_SPECS[docKey];
        if (!spec) return;
        const file = data.documents?.[docKey];
        if (!file) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${spec.label} is required`,
            path: [`documents.${docKey}`],
          });
        }
        if (spec.multiple && (!file || (Array.isArray(file) && file.length === 0))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${spec.label} is required`,
            path: [`documents.${docKey}`],
          });
        }
      });
    });
  }

  return base;
}

export { DOCUMENT_SPECS };
