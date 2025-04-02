
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Experiment } from '@/types/database';

interface ExperimentProgressBarProps {
  experiment: Experiment;
  showLabels?: boolean;
}

const ExperimentProgressBar = ({
  experiment,
  showLabels = true
}: ExperimentProgressBarProps) => {
  // Calculate experiment progress based on status and completed fields
  const calculateProgress = () => {
    switch (experiment.status) {
      case 'planned':
        return 10;
      case 'in-progress':
        return experiment.results ? 75 : 50;
      case 'completed':
        return 100;
      default:
        return 10;
    }
  };
  
  const progress = calculateProgress();
  
  return (
    <div className="w-full space-y-1">
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="h-4 bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Planned</span>
          <span>In Progress</span>
          <span>Completed</span>
        </div>
      )}
    </div>
  );
};

export default ExperimentProgressBar;
