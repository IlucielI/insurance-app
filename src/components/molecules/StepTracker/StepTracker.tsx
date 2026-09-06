import React from 'react';

export interface StepItem {
  number: number;
  title: string;
  subtitle?: string;
}

export interface StepTrackerProps {
  currentStep: number;
  steps?: StepItem[];
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export const defaultApplicationSteps: StepItem[] = [
  { number: 1, title: 'Identitas & KTP', subtitle: 'Verifikasi Dukcapil' },
  { number: 2, title: 'Profil Finansial', subtitle: 'DSR & Penghasilan' },
  { number: 3, title: 'Kuesioner Medis', subtitle: 'Pernyataan Kesehatan' },
  { number: 4, title: 'Ringkasan & Submit', subtitle: 'Verifikasi Final' },
];

export const StepTracker: React.FC<StepTrackerProps> = ({
  currentStep,
  steps = defaultApplicationSteps,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isPending = currentStep < step.number;

          const cardBorder = isActive
            ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/10'
            : isCompleted
            ? 'border-emerald-200 bg-emerald-50/30'
            : 'border-slate-200 bg-white opacity-70';

          const numberBg = isActive
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
            : isCompleted
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-100 text-slate-500';

          return (
            <button
              key={step.number}
              type="button"
              disabled={isPending}
              onClick={() => onStepClick?.(step.number)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${cardBorder} ${
                isPending ? 'cursor-default' : 'cursor-pointer hover:border-blue-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${numberBg}`}
              >
                {isCompleted ? '✓' : step.number}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold truncate ${
                    isActive
                      ? 'text-blue-900'
                      : isCompleted
                      ? 'text-emerald-900'
                      : 'text-slate-600'
                  }`}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{step.subtitle}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
