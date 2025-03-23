
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, CircleCheck, Circle, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepJourneyProps {
  steps: Step[];
  currentStepId: string;
  onStepChange?: (stepId: string) => void;
  compact?: boolean;
  showProgress?: boolean;
  completedStepIds?: string[];
  className?: string;
  variant?: 'default' | 'numbered' | 'pills' | 'cards';
  orientation?: 'horizontal' | 'vertical';
}

const StepJourney = ({
  steps,
  currentStepId,
  onStepChange,
  compact = false,
  showProgress = true,
  completedStepIds = [],
  className,
  variant = 'default',
  orientation = 'horizontal'
}: StepJourneyProps) => {
  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Function to check if a step is completed
  const isStepCompleted = (stepId: string) => completedStepIds.includes(stepId);
  
  // Function to check if a step can be accessed (it's current or completed)
  const canAccessStep = (step: Step, index: number) => {
    if (onStepChange) {
      return index <= currentStepIndex || isStepCompleted(step.id);
    }
    return false;
  };
  
  // Render steps based on the selected variant
  const renderSteps = () => {
    switch (variant) {
      case 'numbered':
        return (
          <div className={cn(
            'flex gap-2',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = isStepCompleted(step.id);
              const isClickable = canAccessStep(step, index);
              
              return (
                <button
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-all',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600',
                    isCompleted ? 'text-green-600' : '',
                    isClickable ? 'cursor-pointer hover:bg-gray-100' : 'opacity-70 cursor-default'
                  )}
                  onClick={() => isClickable && onStepChange && onStepChange(step.id)}
                  disabled={!isClickable}
                >
                  <div className={cn(
                    'flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium',
                    isActive ? 'bg-blue-100 text-blue-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  
                  <div className="text-left">
                    <div className="font-medium text-sm">{step.label}</div>
                    {!compact && step.description && (
                      <div className="text-xs text-gray-500">{step.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
        
      case 'pills':
        return (
          <div className={cn(
            'flex gap-1',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = isStepCompleted(step.id);
              const isClickable = canAccessStep(step, index);
              
              return (
                <button
                  key={step.id}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive ? 'bg-blue-500 text-white' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                    isClickable ? 'cursor-pointer hover:opacity-90' : 'opacity-70 cursor-default'
                  )}
                  onClick={() => isClickable && onStepChange && onStepChange(step.id)}
                  disabled={!isClickable}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        );
        
      case 'cards':
        return (
          <div className={cn(
            'grid gap-4',
            orientation === 'vertical' ? 'grid-cols-1' : 
            'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          )}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = isStepCompleted(step.id);
              const isClickable = canAccessStep(step, index);
              
              // Determine the background color for the card
              const cardBgColors = [
                'from-blue-50 to-blue-100',
                'from-purple-50 to-purple-100',
                'from-green-50 to-green-100',
                'from-yellow-50 to-yellow-100',
                'from-red-50 to-red-100'
              ];
              
              const bgColorClass = cardBgColors[index % cardBgColors.length];
              
              return (
                <button
                  key={step.id}
                  className={cn(
                    'relative p-4 rounded-lg bg-gradient-to-br shadow-sm border border-gray-100 transition-all',
                    isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'opacity-70 cursor-default',
                    isActive ? bgColorClass : 'from-gray-50 to-gray-100',
                    isCompleted ? 'border-green-200' : ''
                  )}
                  onClick={() => isClickable && onStepChange && onStepChange(step.id)}
                  disabled={!isClickable}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2">
                      <CircleCheck className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-start gap-2">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      {step.icon || <Circle className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="font-medium text-sm">{step.label}</div>
                    {!compact && step.description && (
                      <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                    )}
                  </div>
                  
                  {/* Small indicator showing step number */}
                  <div className="absolute bottom-2 right-2 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                    {index + 1}
                  </div>
                </button>
              );
            })}
          </div>
        );
        
      case 'default':
      default:
        return (
          <div className={cn(
            'flex gap-2 items-center',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = isStepCompleted(step.id);
              const isClickable = canAccessStep(step, index);
              const isLast = index === steps.length - 1;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md transition-all',
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600',
                      isCompleted ? 'text-green-600' : '',
                      isClickable ? 'cursor-pointer hover:bg-gray-100' : 'opacity-70 cursor-default'
                    )}
                    onClick={() => isClickable && onStepChange && onStepChange(step.id)}
                    disabled={!isClickable}
                  >
                    {isCompleted ? (
                      <CircleCheck className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className={cn(
                        'flex items-center justify-center rounded-full w-6 h-6 text-xs font-medium',
                        isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      )}>
                        {index + 1}
                      </div>
                    )}
                    <span className="text-sm">{step.label}</span>
                  </button>
                  
                  {!isLast && orientation === 'horizontal' && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
    }
  };
  
  return (
    <div className={className}>
      {renderSteps()}
      
      {showProgress && (
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepJourney;
