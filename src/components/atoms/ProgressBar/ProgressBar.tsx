import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  variant?: 'blue' | 'emerald' | 'amber' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = false,
  variant = 'blue',
  size = 'md',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorStyles = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600',
  }[variant];

  return (
    <div className={`w-full space-y-1 text-left ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 select-none">
          {label && <span>{label}</span>}
          {showPercent && <span className="text-slate-500">{Math.round(clamped)}%</span>}
        </div>
      )}

      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightStyles}`}>
        <div
          className={`h-full transition-all duration-300 rounded-full ${colorStyles}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
