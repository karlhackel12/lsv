
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'validated' 
  | 'validating' 
  | 'not-started' 
  | 'invalid' 
  | 'completed' 
  | 'in-progress' 
  | 'planned' 
  | 'post-mvp' 
  | 'warning' 
  | 'success' 
  | 'error';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'validated':
      case 'completed':
      case 'success':
        return 'bg-validation-green-50 text-validation-green-700 border-validation-green-200 ring-validation-green-100';
      case 'validating':
      case 'in-progress':
      case 'warning':
        return 'bg-validation-yellow-50 text-validation-yellow-700 border-validation-yellow-200 ring-validation-yellow-100';
      case 'not-started':
      case 'planned':
        return 'bg-validation-blue-50 text-validation-blue-700 border-validation-blue-200 ring-validation-blue-100';
      case 'invalid':
      case 'error':
        return 'bg-validation-red-50 text-validation-red-700 border-validation-red-200 ring-validation-red-100';
      case 'post-mvp':
        return 'bg-validation-gray-100 text-validation-gray-700 border-validation-gray-200 ring-validation-gray-100';
      default:
        return 'bg-validation-gray-100 text-validation-gray-700 border-validation-gray-200 ring-validation-gray-100';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset shadow-sm',
        getStatusColor(status),
        className
      )}
    >
      {status.replace(/-/g, ' ')}
    </span>
  );
};

export default StatusBadge;
