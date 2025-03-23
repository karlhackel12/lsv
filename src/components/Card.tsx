
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  variant?: 'default' | 'outline' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
}

const Card = ({ 
  children, 
  className, 
  hover = false, 
  onClick, 
  style,
  gradient = false,
  gradientFrom = 'from-validation-blue-500',
  gradientTo = 'to-validation-blue-700',
  variant = 'default'
}: CardProps) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outline: 'bg-transparent border border-gray-200',
    muted: 'bg-gray-50 border border-gray-100',
    primary: 'bg-blue-50 border border-blue-100 text-blue-800',
    success: 'bg-green-50 border border-green-100 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-100 text-yellow-800',
    error: 'bg-red-50 border border-red-100 text-red-800',
  }

  return (
    <div 
      className={cn(
        'rounded-lg shadow-sm overflow-hidden w-full transition-all duration-300',
        variantClasses[variant],
        'dark:bg-gray-800 dark:border-gray-700',
        hover && 'hover:shadow-md hover:-translate-y-1',
        onClick && 'cursor-pointer',
        gradient && `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white border-0`,
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
