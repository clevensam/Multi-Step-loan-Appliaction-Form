export const STEPS = [
  { id: 'step1', label: 'Loan Type & Basic Info', component: 'Step1LoanType' },
  { id: 'step2', label: 'Personal Information', component: 'Step2PersonalInfo' },
  { id: 'step3', label: 'Identity Verification (KYC)', component: 'Step3KYC' },
  { id: 'step4', label: 'Address Information', component: 'Step4Address' },
  { id: 'step5', label: 'Employment & Income', component: 'Step5Employment' },
  { id: 'step6', label: 'Co-Applicant & Guarantor', component: 'Step6CoApplicant' },
  { id: 'step7', label: 'Document Upload & E-Signature', component: 'Step7Documents' },
  { id: 'step8', label: 'Review & Submit', component: 'Step8Review' },
];

export const LOAN_TYPES = {
  PERSONAL: 'Personal',
  HOME: 'Home',
  BUSINESS: 'Business',
};

export const LOAN_TYPE_LABELS = {
  [LOAN_TYPES.PERSONAL]: 'Personal Loan',
  [LOAN_TYPES.HOME]: 'Home Loan',
  [LOAN_TYPES.BUSINESS]: 'Business Loan',
};

export const AMOUNT_RANGES = {
  [LOAN_TYPES.PERSONAL]: { min: 50000, max: 1000000 },
  [LOAN_TYPES.HOME]: { min: 50000, max: 10000000 },
  [LOAN_TYPES.BUSINESS]: { min: 50000, max: 5000000 },
};

export const TENURE_RANGES = {
  [LOAN_TYPES.PERSONAL]: { min: 12, max: 60 },
  [LOAN_TYPES.HOME]: { min: 60, max: 360 },
  [LOAN_TYPES.BUSINESS]: { min: 12, max: 120 },
};

export const INTEREST_RATES = {
  [LOAN_TYPES.PERSONAL]: 10.5,
  [LOAN_TYPES.HOME]: 8.5,
  [LOAN_TYPES.BUSINESS]: 14,
};

export const STEP_6_THRESHOLDS = {
  [LOAN_TYPES.PERSONAL]: 500000,
  [LOAN_TYPES.HOME]: 0,
  [LOAN_TYPES.BUSINESS]: 2000000,
};

export const EMPLOYMENT_TYPES = {
  SALARIED: 'Salaried',
  SELF_EMPLOYED: 'Self-Employed',
  BUSINESS_OWNER: 'Business Owner',
};

export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

export const GENDERS = ['Male', 'Female', 'Other'];

export const RESIDENCE_TYPES = ['Owned', 'Rented', 'Company', 'Family'];

export const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Business Partner'];
