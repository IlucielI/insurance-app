import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, errorMessage, id, disabled, checked, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? `chk-${label.slice(0, 15).toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="flex flex-col space-y-1 text-left">
        <label
          htmlFor={checkboxId}
          className={`flex items-start gap-3 cursor-pointer group ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
        >
          <div className="relative flex items-center justify-center pt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              checked={checked}
              className={`h-4 w-4 rounded border text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed ${
                hasError ? 'border-rose-400' : 'border-slate-300'
              }`}
              {...props}
            />
          </div>

          <div className="text-xs">
            <span
              className={`font-semibold ${
                hasError ? 'text-rose-700' : 'text-slate-800'
              } group-hover:text-slate-900`}
            >
              {label}
            </span>
            {description && (
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{description}</p>
            )}
          </div>
        </label>

        {hasError && <p className="text-[11px] text-rose-600 font-medium pl-7">{errorMessage}</p>}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
