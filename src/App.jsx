import { useState, useCallback, useEffect } from 'react';
import Wizard from './components/Wizard';
import getSchema from './schemas/schemaFactory';
import useAutoSave from './hooks/useAutoSave';
import useFormPersistence from './hooks/useFormPersistence';
import { LOAN_TYPES, EMPLOYMENT_TYPES, STEPS } from './constants';

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
  coApplicantSignature: '',
  documents: {},
  signature: '',
  consentAccurate: false,
  consentCreditCheck: false,
  consentTerms: false,
  consentCommunications: false,
  consentHighEmi: false,
};

const STORAGE_KEY = 'lendswift_draft';

function ResumeModal({ timestamp, onResume, onStartFresh }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 max-w-md w-full text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
      >
        <svg className="w-12 h-12 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 id="resume-title" className="text-xl font-semibold text-gray-800 mb-2">You have a saved draft</h2>
        <p className="text-sm text-gray-500 mb-1">
          We found an incomplete application from your last visit.
        </p>
        {timestamp && (
          <p className="text-xs text-gray-400 mb-6">
            Last saved: {new Date(timestamp).toLocaleString()}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onResume}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onStartFresh}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {
    savedData, showResume, resume, startFresh,
  } = useFormPersistence(STORAGE_KEY);

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [initialised, setInitialised] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (showResume) return;
    if (!initialised) {
      setInitialised(true);
    }
  }, [showResume, initialised]);

  const getStorageKey = useCallback(() => {
    const loanType = formData.loanType || 'new';
    return `${STORAGE_KEY}_${loanType}`;
  }, [formData.loanType]);

  const AUTO_SAVE_INTERVAL = typeof window !== 'undefined' && window.Cypress ? 3000 : 30000;
  useAutoSave(STORAGE_KEY, formData, { step: currentStep }, AUTO_SAVE_INTERVAL, (timestamp) => {
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToast(`Draft saved at ${time}`);
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

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
    setFormData((prev) => {
      let next = { ...prev, ...fields };

      if (fields.employmentType !== undefined && fields.employmentType !== prev.employmentType) {
        const cleared = {
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
        };
        next = { ...next, ...cleared };
      }

      if (fields.loanType !== undefined && fields.loanType !== prev.loanType) {
        const cleared = {
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
          coApplicantSignature: '',
          documents: {},
        };
        next = { ...next, ...cleared };
      }

      return next;
    });

    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(fields).forEach((key) => {
        if (key === 'documents' && typeof fields[key] === 'object') {
          Object.keys(next).forEach((k) => {
            if (k.startsWith('documents.')) delete next[k];
          });
        } else {
          delete next[key];
          Object.keys(next).forEach((k) => {
            if (k.startsWith(key + '.')) delete next[k];
          });
        }
      });
      return next;
    });
  }, []);

  const validateStep = useCallback(async (stepId) => {
    const absoluteIndex = STEPS.findIndex((s) => s.id === stepId);
    const formDataWithVerified = {
      ...formData,
      panVerified: !!(formData.panNumber && formData.panNumber.length === 10),
    };
    const schema = getSchema(absoluteIndex, formDataWithVerified);
    if (!schema) return true;

    const result = schema.safeParse(formData);
    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev };
        const fields = Object.keys(schema.shape || {});
        fields.forEach((f) => {
          delete next[f];
          Object.keys(next).forEach((k) => {
            if (k.startsWith(f + '.')) delete next[k];
          });
        });
        return next;
      });
      return true;
    }

    const flatErrors = {};
    result.error.issues.forEach((issue) => {
      const key = issue.path.join('.');
      if (key && !flatErrors[key]) {
        flatErrors[key] = issue.message;
      }
    });
    setErrors((prev) => ({ ...prev, ...flatErrors }));
    return false;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_meta`);
  }, [getStorageKey]);

  const handleResume = useCallback(() => {
    const data = resume();
    if (data) {
      setFormData({ ...defaultFormData, ...data });
      if (savedData?.step !== undefined) {
        setCurrentStep(savedData.step);
      }
    }
  }, [resume, savedData]);

  const handleStartFresh = useCallback(() => {
    startFresh();
    setFormData(defaultFormData);
    setCurrentStep(0);
  }, [startFresh]);

  if (showResume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ResumeModal
          timestamp={savedData?.timestamp}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
        />
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-fade-in" role="status" aria-live="polite">
          {toast}
        </div>
      )}
        <Wizard
          formData={formData}
          updateFields={updateFields}
          errors={errors}
          validateStep={validateStep}
          onSubmit={handleSubmit}
          onStepChange={setCurrentStep}
          defaultStep={currentStep}
        />
    </>
  );
}
