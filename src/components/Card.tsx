
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
}

const Card = ({ 
  children, 
  className, 
  hover = false, 
  onClick, 
  style,
  gradient = false,
  gradientFrom = 'from-validation-blue-500',
  gradientTo = 'to-validation-blue-700'
}: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full transition-all duration-300',
        'dark:bg-gray-800 dark:border-gray-700',
        hover && 'hover:shadow-md hover:-translate-y-1',
        onClick && 'cursor-pointer',
        gradient && `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white`,
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
