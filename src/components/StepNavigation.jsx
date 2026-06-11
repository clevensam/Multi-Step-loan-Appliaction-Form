export default function StepNavigation({
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  onSubmit,
  currentStepLabel,
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={`
          inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg
          transition-colors duration-150
          ${isFirstStep
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
          }
        `}
        aria-label={isFirstStep ? 'Already on first step' : `Go to previous step`}
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <span className="hidden sm:block text-sm text-gray-400">
        {currentStepLabel}
      </span>

      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg
            bg-accent text-white hover:bg-accent-600 active:bg-accent-700
            transition-colors duration-150 shadow-sm"
          aria-label="Submit application"
        >
          Submit Application
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg
            bg-primary text-white hover:bg-primary-600 active:bg-primary-700
            transition-colors duration-150 shadow-sm"
          aria-label="Go to next step"
        >
          Next
          <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
