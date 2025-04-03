
import React from 'react';
import { InfoIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
  text?: string; // Add this prop for backward compatibility
  link?: string; // Add this prop for backward compatibility
}

const InfoTooltip = ({ content, className, text, link }: InfoTooltipProps) => {
  const tooltipContent = text || content;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={className}>
            <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            {tooltipContent}
            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-500 hover:underline mt-1 text-xs"
              >
                Learn more
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;
