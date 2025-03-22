
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className, hover = false, onClick }: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-300',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
