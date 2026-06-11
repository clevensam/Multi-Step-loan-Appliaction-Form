import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Wizard from './components/Wizard';

const defaultFormData = {
  loanType: '',
  loanAmount: '',
  loanTenure: '',
  loanPurpose: '',
  referralCode: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobile: '',
  alternateMobile: '',
  panNumber: '',
  aadhaarNumber: '',
  aadhaarConsent: false,
  voterId: '',
  passport: '',
  currentAddressLine1: '',
  currentAddressLine2: '',
  pinCode: '',
  city: '',
  state: '',
  residenceType: '',
  yearsAtAddress: '',
  isSameAsPermanent: false,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPinCode: '',
  permanentCity: '',
  permanentState: '',
  employmentType: '',
  companyName: '',
  designation: '',
  monthlyNetSalary: '',
  yearsOfExperience: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  monthlyIncome: '',
  gstNumber: '',
  officeAddress: '',
  showCoApplicant: false,
  coApplicantName: '',
  coApplicantRelationship: '',
  coApplicantPan: '',
  coApplicantIncome: '',
  coApplicantConsent: false,
  documents: {},
  signature: '',
  consentAccurate: false,
  consentCreditCheck: false,
  consentTerms: false,
  consentCommunications: false,
};

function createStepSchema(stepIndex) {
  switch (stepIndex) {
    case 0:
      return z.object({
        loanType: z.string().min(1, 'Select a loan type'),
        loanAmount: z.string().min(1, 'Enter loan amount'),
        loanTenure: z.string().min(1, 'Select loan tenure'),
      });
    case 1:
      return z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters'),
        dateOfBirth: z.string().min(1, 'Enter date of birth'),
        gender: z.string().min(1, 'Select gender'),
        maritalStatus: z.string().min(1, 'Select marital status'),
        fatherName: z.string().min(2, 'Father name must be at least 2 characters'),
        motherName: z.string().min(2, 'Mother name must be at least 2 characters'),
        email: z.string().email('Enter a valid email'),
        mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
      });
    default:
      return z.object({});
  }
}

export default function App() {
  const [formData, setFormData] = useState(defaultFormData);

  const updateFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const schemas = [0, 1, 2, 3, 4, 5, 6, 7].map(createStepSchema);

  const { trigger, getValues, formState: { errors } } = useForm({
    defaultValues: formData,
    resolver: zodResolver(z.object({})),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const validateStep = useCallback(async (stepIndex) => {
    const schema = schemas[stepIndex];
    const data = getValues();
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      return Object.keys(fieldErrors).length === 0;
    }
    return true;
  }, [schemas, getValues]);

  return (
    <Wizard
      formData={formData}
      updateFields={updateFields}
      errors={errors}
      validateStep={validateStep}
    />
  );
}
