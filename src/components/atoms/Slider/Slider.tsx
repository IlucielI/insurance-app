import React from 'react';

export interface SliderProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue?: (val: number) => string;
  minLabel?: string;
  maxLabel?: string;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  formatValue = (v) => v.toLocaleString('id-ID'),
  minLabel,
  maxLabel,
  onChange,
  className = '',
  disabled = false,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const inputId = id || `slider-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className={`w-full space-y-2 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {formatValue(value)}
        </span>
      </div>

      <div className="relative flex items-center py-1">
        <input
          id={inputId}
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>{minLabel || formatValue(min)}</span>
        <span>{maxLabel || formatValue(max)}</span>
      </div>
    </div>
  );
};
