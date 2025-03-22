import React from 'react';
import { cn } from '@/lib/utils';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
const Card = ({
  children,
  className,
  hover = false,
  onClick,
  style
}: CardProps) => {
  return;
};
export default Card;