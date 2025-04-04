
import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface InfoTooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  iconClassName?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
  text?: string;
  link?: string;
}

export function InfoTooltip({
  content,
  side = 'top',
  align = 'center',
  className,
  iconClassName,
  triggerClassName,
  children,
  text,
  link,
}: InfoTooltipProps) {
  const tooltipContent = text || content;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex', triggerClassName)}>
            {children || (
              <Button variant="ghost" size="icon" className={cn('h-6 w-6 p-0', className)}>
                <Info className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className="max-w-[300px] text-sm p-3 bg-white dark:bg-slate-900 shadow-lg"
        >
          {tooltipContent}
          {link && (
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block mt-2 text-blue-500 hover:underline text-xs"
            >
              Learn more →
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
