export default function ProgressBar({ steps, currentStepIdx, progress }) {
  return (
    <nav aria-label="Application progress" className="w-full">
      <div className="flex items-center gap-1 mb-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                  transition-colors duration-200 flex-shrink-0
                  ${isCompleted ? 'bg-accent text-white' : ''}
                  ${isCurrent ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                `}
                aria-label={`${step.label}${isCurrent ? ' (current step)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded ${
                    idx < currentStepIdx ? 'bg-accent' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 text-center">
        <span className="sr-only">Step {currentStepIdx + 1}: </span>
        {steps[currentStepIdx]?.label}
      </p>
    </nav>
  );
}
