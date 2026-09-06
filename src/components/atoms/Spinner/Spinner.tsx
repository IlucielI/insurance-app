import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'white' | 'slate';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  }[size];

  const colorClasses = {
    primary: 'border-blue-600/20 border-t-blue-600',
    white: 'border-white/20 border-t-white',
    slate: 'border-slate-300 border-t-slate-700',
  }[variant];

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
