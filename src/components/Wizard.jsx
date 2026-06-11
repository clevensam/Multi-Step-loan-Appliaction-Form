import { useState, useCallback, useRef, useEffect } from 'react';
import { STEPS } from '../constants';
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

export default function Wizard({ formData, updateFields, errors, validateStep, onSubmit }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const headerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const steps = STEPS.filter((s) => s.visible !== false);
  const currentStep = steps[currentStepIdx];
  const isFirstStep = currentStepIdx === 0;
  const isLastStep = currentStepIdx === steps.length - 1;
  const progress = ((currentStepIdx + 1) / steps.length) * 100;

  const goToStep = useCallback((index) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIdx(index);
    }
  }, [steps.length]);

  const nextStep = useCallback(async () => {
    const isValid = await validateStep(currentStepIdx);
    if (isValid && currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  }, [currentStepIdx, steps.length, validateStep]);

  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }, [currentStepIdx]);

  const handleSubmit = useCallback(async () => {
    const isValid = await validateStep(currentStepIdx);
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
    const params = new URLSearchParams(window.location.search);
    const step = parseInt(params.get('step'), 10);
    if (!Number.isNaN(step) && step >= 0 && step < steps.length) {
      setCurrentStepIdx(step);
    }
  }, [steps.length]);

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
          />
        </div>
      </footer>
    </div>
  );
}
