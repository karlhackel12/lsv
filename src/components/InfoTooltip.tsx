
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

interface InfoTooltipProps {
  text: string;
  link?: string;
  icon?: React.ReactNode;
  className?: string;
}

const InfoTooltip = ({ text, link, icon, className = '' }: InfoTooltipProps) => {
  const tooltipContent = link ? (
    <div className="text-sm">
      <p>{text}</p>
      <Link to={link} className="text-blue-500 hover:text-blue-700 mt-1 block text-xs font-medium">
        Learn more →
      </Link>
    </div>
  ) : (
    <p className="text-sm">{text}</p>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={`text-blue-500 hover:text-blue-700 focus:outline-none ${className}`}>
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
