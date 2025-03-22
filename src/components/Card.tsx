
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  elevation?: 'none' | 'subtle' | 'medium' | 'glass';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = ({
  className,
  elevation = 'subtle',
  hover = false,
  children,
  ...props
}: CardProps) => {
  const shadowClasses = {
    none: '',
    subtle: 'shadow-subtle',
    medium: 'shadow-elevation',
    glass: 'shadow-glass backdrop-blur-sm bg-white/95 border border-white/40'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden',
        shadowClasses[elevation],
        hover && 'hover-lift',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
