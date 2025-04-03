'use client';

import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Lightbulb, FlaskConical, Beaker, Layers, LineChart, GitFork, TrendingUp } from 'lucide-react';

const steps = [
  { id: 'problem', label: 'Problem', icon: Lightbulb, path: '/problem-validation' },
  { id: 'solution', label: 'Solution', icon: FlaskConical, path: '/solution-validation' },
  { id: 'experiments', label: 'Experiments', icon: Beaker, path: '/experiments' },
  { id: 'mvp', label: 'MVP', icon: Layers, path: '/mvp' },
  { id: 'metrics', label: 'Metrics', icon: LineChart, path: '/metrics' },
  { id: 'pivot', label: 'Pivot', icon: GitFork, path: '/pivot' },
  { id: 'growth', label: 'Growth', icon: TrendingUp, path: '/growth' },
];

const ProgressTracker = () => {
  const location = useLocation();
  
  // Determine current step based on URL path
  const getCurrentStepIndex = () => {
    const currentPath = location.pathname;
    const matchedIndex = steps.findIndex(step => currentPath === step.path);
    if (matchedIndex >= 0) return matchedIndex;
    
    // Default to first step if no match or homepage
    return currentPath === '/' ? 0 : -1;
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    isActive && "bg-blue-100 text-blue-600 border-2 border-blue-500",
                    isCompleted && "bg-green-100 text-green-600",
                    !isActive && !isCompleted && "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span 
                  className={cn(
                    "text-xs font-medium hidden md:block",
                    isActive && "text-blue-600",
                    isCompleted && "text-green-600",
                    !isActive && !isCompleted && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-0.5 w-4 mx-1",
                    index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker; 