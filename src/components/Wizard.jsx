import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { STEPS, STEP_6_THRESHOLDS, EMPLOYMENT_TYPES, INTEREST_RATES } from '../constants';
import { getRequiredDocs, DOCUMENT_SPECS } from '../schemas/step7Schema';
import { calculateEMI } from '../utils/emiCalculator';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1LoanType from './Step1LoanType';
import Step2PersonalInfo from './Step2PersonalInfo';
import Step3KYC from './Step3KYC';
import Step4Address from './Step4Address';
import Step5Employment from './Step5Employment';
import Step6CoApplicant from './Step6CoApplicant';
import Step7Documents from './Step7Documents';
import Step8Review from './Step8Review';

const STEP_COMPONENTS = {
  Step1LoanType,
  Step2PersonalInfo,
  Step3KYC,
  Step4Address,
  Step5Employment,
  Step6CoApplicant,
  Step7Documents,
  Step8Review,
};

function computeShowCoApplicant(formData) {
  const loanType = formData.loanType;
  const loanAmount = Number(formData.loanAmount) || 0;
  const threshold = STEP_6_THRESHOLDS[loanType];
  if (threshold === undefined) return false;
  if (threshold === 0) return true;
  return loanAmount > threshold;
}

export default function Wizard({ formData, updateFields, errors, validateStep, onSubmit, onStepChange, defaultStep = 0 }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(defaultStep);
  const headerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const showCoApplicant = computeShowCoApplicant(formData);

  const stepsWithVisibility = useMemo(() => {
    if (formData.showCoApplicant !== showCoApplicant) {
      updateFields({ showCoApplicant });
    }
    return STEPS.map((s) => ({
      ...s,
      isVisible: s.id === 'step6' ? showCoApplicant : true,
    }));
  }, [showCoApplicant, formData.showCoApplicant, updateFields]);

  const steps = stepsWithVisibility.filter((s) => s.isVisible !== false);
  const currentStep = steps[currentStepIdx];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;
  const progress = ((currentStepIdx + 1) / steps.length) * 100;

  function getMonthlyIncome(fd) {
    let income = 0;
    if (fd.employmentType === EMPLOYMENT_TYPES.SALARIED) {
      income = Number(fd.monthlyNetSalary) || 0;
    } else {
      income = Number(fd.monthlyIncome) || 0;
    }
    if (fd.coApplicantIncome) {
      income += Number(fd.coApplicantIncome) || 0;
    }
    return income;
  }

  function computeEmiRatio(fd) {
    const { loanType, loanAmount, loanTenure } = fd;
    if (!loanType || !loanAmount || !loanTenure) return 0;
    const annualRate = INTEREST_RATES[loanType];
    if (!annualRate) return 0;
    const emi = calculateEMI(Number(loanAmount), annualRate, Number(loanTenure));
    const monthlyIncome = getMonthlyIncome(fd);
    if (monthlyIncome <= 0) return 0;
    return (emi / monthlyIncome) * 100;
  }

  const canSubmit = useMemo(() => {
    if (!isLastStep) return true;
    const { documents = {}, ...rest } = formData;
    const allConsents = rest.consentAccurate && rest.consentCreditCheck
      && rest.consentTerms && rest.consentCommunications;
    if (!allConsents) return false;
    const emiRatio = computeEmiRatio(formData);
    if (emiRatio > 50 && !rest.consentHighEmi) return false;
    const required = getRequiredDocs(formData);
    const allDocs = required.every((key) => {
      const file = documents[key];
      const spec = DOCUMENT_SPECS[key];
      if (!spec) return true;
      if (spec.multiple) return Array.isArray(file) && file.length > 0;
      return file instanceof File;
    });
    if (!allDocs) return false;
    if (!formData.signature) return false;
    return true;
  }, [isLastStep, formData]);

  useEffect(() => {
    onStepChange?.(currentStepIdx);
  }, [currentStepIdx, onStepChange]);

  useEffect(() => {
    if (currentStepIdx >= steps.length) {
      setCurrentStepIdx(steps.length - 1);
    }
  }, [steps.length, currentStepIdx]);

  const goToStep = useCallback((index) => {
    const activeIndex = steps.findIndex((s) => {
      const origIdx = STEPS.findIndex((os) => os.id === s.id);
      return origIdx === index;
    });
    if (activeIndex >= 0) {
      setCurrentStepIdx(activeIndex);
    }
  }, [steps]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Cypress) {
      window.__wizardGoToStep = goToStep;
    }
    return () => {
      if (typeof window !== 'undefined' && window.Cypress) {
        delete window.__wizardGoToStep;
      }
    };
  }, [goToStep]);

  const nextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep.id);
    if (isValid && currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  }, [currentStep, currentStepIdx, steps.length, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }, [currentStepIdx]);

  const handleSubmit = useCallback(async () => {
    const isValid = await validateStep(currentStep.id);
    if (!isValid) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const ref = `LND${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setReferenceId(ref);
    setShowSuccess(true);
    setIsSubmitting(false);
    onSubmit?.();
  }, [currentStepIdx, validateStep, onSubmit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = headerRef.current?.querySelector('input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (el) el.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIdx]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('step', currentStepIdx);
    window.history.replaceState({}, '', url);
  }, [currentStepIdx]);

  const CurrentStepComponent = STEP_COMPONENTS[currentStep.component];

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-4">Your loan application has been received.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reference Number</p>
            <p className="text-lg font-mono font-bold text-primary">{referenceId}</p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg
              bg-primary text-white hover:bg-primary-600 transition-colors"
          >
            Apply for Another Loan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-primary">LendSwift</h1>
            <span className="text-sm text-gray-500">
              Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>
          <ProgressBar
            steps={steps}
            currentStepIdx={currentStepIdx}
            progress={progress}
          />
        </div>
      </header>

      <main ref={headerRef} className="max-w-4xl mx-auto px-4 py-8">
        <CurrentStepComponent
          formData={formData}
          updateFields={updateFields}
          errors={errors}
          goToStep={goToStep}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <StepNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            onPrev={prevStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
            currentStepLabel={currentStep.label}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
          />
        </div>
      </footer>
    </div>
  );
}
