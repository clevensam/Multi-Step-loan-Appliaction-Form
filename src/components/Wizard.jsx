import { useState, useCallback, useRef, useEffect } from 'react';
import { STEPS } from '../constants';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';

const STEP_COMPONENTS = {
  Step1LoanType: null,
  Step2PersonalInfo: null,
  Step3KYC: null,
  Step4Address: null,
  Step5Employment: null,
  Step6CoApplicant: null,
  Step7Documents: null,
  Step8Review: null,
};

export default function Wizard({ formData, updateFields, errors, validateStep }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const headerRef = useRef(null);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = headerRef.current?.querySelector('input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (el) el.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [currentStepIdx]);

  const CurrentStepComponent = STEP_COMPONENTS[currentStep.component];

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
        {CurrentStepComponent ? (
          <CurrentStepComponent
            formData={formData}
            updateFields={updateFields}
            errors={errors}
            goToStep={goToStep}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {currentStep.label}
            </h2>
            <p className="text-gray-500">
              Step {currentStepIdx + 1} content will be implemented here.
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <StepNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            onPrev={prevStep}
            onNext={nextStep}
            onSubmit={() => {}}
            currentStepLabel={currentStep.label}
          />
        </div>
      </footer>
    </div>
  );
}
