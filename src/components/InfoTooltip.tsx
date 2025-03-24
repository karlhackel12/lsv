
import React from 'react';
import { Info, BookOpen, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

interface InfoTooltipProps {
  text: string;
  link?: string;
  icon?: React.ReactNode;
  className?: string;
  showBorder?: boolean;
  linkText?: string;
  linkIcon?: React.ReactNode;
}

const InfoTooltip = ({ 
  text, 
  link, 
  icon, 
  className = '',
  showBorder = false,
  linkText = 'Learn more about Lean Startup',
  linkIcon = <BookOpen className="h-3 w-3 mr-1" />
}: InfoTooltipProps) => {
  const tooltipContent = link ? (
    <div className="text-sm">
      <p>{text}</p>
      <Link to={link} className="text-blue-500 hover:text-blue-700 mt-1 block text-xs font-medium flex items-center">
        {linkIcon}
        {linkText}
      </Link>
    </div>
  ) : (
    <p className="text-sm">{text}</p>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`
            text-blue-500 hover:text-blue-700 focus:outline-none 
            ${showBorder ? 'border border-blue-200 p-1 rounded-full hover:bg-blue-50' : ''}
            ${className}
          `}>
            {icon || <Info className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
