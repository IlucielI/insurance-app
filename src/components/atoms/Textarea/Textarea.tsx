import React, { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      label,
      helperText,
      errorMessage,
      showCount = false,
      maxLength,
      value,
      id,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-slate-700 select-none"
            >
              {label}
            </label>
          )}

          {showCount && maxLength && (
            <span
              className={`text-[10px] ${
                currentLength >= maxLength ? 'font-bold text-rose-500' : 'text-slate-400'
              }`}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            hasError
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
          } ${className}`}
          rows={rows}
          {...props}
        />

        {hasError ? (
          <p className="text-[11px] text-rose-600 font-medium">{errorMessage}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
