import { useState, useCallback } from 'react';
import Wizard from './components/Wizard';
import getSchema from './schemas/schemaFactory';

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

export default function App() {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  const clearStepErrors = useCallback((stepIndex) => {
    const schema = getSchema(stepIndex, formData);
    if (!schema) return;
    const fields = Object.keys(schema.shape || {});
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((f) => delete next[f]);
      return next;
    });
  }, [formData]);

  const updateFields = useCallback((fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  }, []);

  const validateStep = useCallback(async (stepIndex) => {
    const schema = getSchema(stepIndex, formData);
    if (!schema) return true;

    const result = schema.safeParse(formData);
    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        const fields = Object.keys(schema.shape || {});
        fields.forEach((f) => delete next[f]);
        return next;
      });
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    const flatErrors = {};
    Object.entries(fieldErrors).forEach(([key, msgs]) => {
      if (msgs && msgs.length > 0) {
        flatErrors[key] = msgs[0];
      }
    });
    setErrors((prev) => ({ ...prev, ...flatErrors }));
    return false;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    console.warn('Form submitted:', formData);
  }, [formData]);

  return (
    <Wizard
      formData={formData}
      updateFields={updateFields}
      errors={errors}
      validateStep={validateStep}
      onSubmit={handleSubmit}
    />
  );
}
