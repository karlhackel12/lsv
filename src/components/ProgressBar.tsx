
import React from 'react';
import { cn } from '@/lib/utils';

type ProgressBarType = 'default' | 'success' | 'warning' | 'error' | 'info';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarType;
  showValue?: boolean;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const ProgressBar = ({
  value,
  max = 100,
  variant = 'default',
  showValue = false,
  label,
  size = 'md',
  className
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const variantClasses = {
    default: 'bg-validation-blue-600',
    success: 'bg-validation-green-600',
    warning: 'bg-validation-yellow-500',
    error: 'bg-validation-red-600',
    info: 'bg-validation-gray-500'
  };
  
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm font-medium text-validation-gray-700">{label}</span>}
          {showValue && <span className="text-sm font-medium text-validation-gray-700">{value}{max !== 100 && `/${max}`}</span>}
        </div>
      )}
      <div className={cn('w-full bg-validation-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div 
          className={cn('rounded-full transition-all duration-500 ease-out', variantClasses[variant])} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
