import React from 'react';

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'active' | 'pending' | 'flagged';
  actor?: string;
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps, className = '' }) => {
  return (
    <div className={`space-y-6 text-left ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;

        const iconConfig = {
          completed: {
            dot: 'bg-emerald-500 text-white ring-4 ring-emerald-100',
            icon: '✓',
            line: 'bg-emerald-300',
          },
          active: {
            dot: 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse',
            icon: '⚡',
            line: 'bg-slate-200',
          },
          flagged: {
            dot: 'bg-amber-500 text-white ring-4 ring-amber-100',
            icon: '⚠️',
            line: 'bg-slate-200',
          },
          pending: {
            dot: 'bg-slate-200 text-slate-400 ring-4 ring-slate-100',
            icon: '•',
            line: 'bg-slate-200',
          },
        }[step.status];

        return (
          <div key={step.id} className="relative flex items-start gap-4 group">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={`absolute left-3.5 top-8 bottom-0 w-0.5 -ml-px ${iconConfig.line}`}
                aria-hidden="true"
              />
            )}

            {/* Bullet Dot */}
            <div
              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${iconConfig.dot}`}
            >
              {iconConfig.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4
                  className={`text-xs font-bold ${
                    step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {step.title}
                </h4>
                {step.timestamp && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {step.timestamp}
                  </span>
                )}
              </div>

              <p
                className={`text-xs mt-1 leading-relaxed ${
                  step.status === 'pending' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {step.description}
              </p>

              {step.actor && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                  <span>Otoritas: {step.actor}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
