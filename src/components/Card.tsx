
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card = ({ children, className, hover = false, onClick, style }: CardProps) => {
  return (
    <div 
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full',
        hover && 'hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1',
        onClick && 'cursor-pointer',
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
