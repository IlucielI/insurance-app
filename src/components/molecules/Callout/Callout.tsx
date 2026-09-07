import React from 'react';

export interface CalloutProps {
  children?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  children,
  description,
  variant = 'info',
  title,
  className = '',
}) => {
  const variantConfig = {
    info: {
      container: 'bg-blue-50/80 border-blue-200 text-blue-900',
      title: 'text-blue-900',
      icon: 'ℹ️',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-900',
      title: 'text-amber-900',
      icon: '⚠️',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      title: 'text-emerald-900',
      icon: '✅',
    },
    danger: {
      container: 'bg-rose-50/80 border-rose-200 text-rose-900',
      title: 'text-rose-900',
      icon: '🚫',
    },
  }[variant];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-xs leading-relaxed ${variantConfig.container} ${className}`}
    >
      <span className="shrink-0 text-base leading-none select-none">{variantConfig.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <h5 className={`font-bold mb-1 ${variantConfig.title}`}>{title}</h5>}
        <div className="text-slate-700">{children ?? description}</div>
      </div>
    </div>
  );
};
