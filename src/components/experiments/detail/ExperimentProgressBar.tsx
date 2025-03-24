
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Experiment } from '@/types/database';

interface ExperimentProgressBarProps {
  experiment: Experiment;
}

const ExperimentProgressBar = ({ experiment }: ExperimentProgressBarProps) => {
  // Calculate experiment progress based on status and completed fields
  const calculateProgress = () => {
    switch(experiment.status) {
      case 'planned': return 10;
      case 'in-progress': 
        return experiment.results ? 75 : 50;
      case 'completed': return 100;
      default: return 10;
    }
  };
  
  const progress = calculateProgress();
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Experiment Progress</span>
        <span className="text-sm">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">Planning</span>
        <span className="text-xs text-gray-500">In Progress</span>
        <span className="text-xs text-gray-500">Completed</span>
      </div>
    </div>
  );
};

export default ExperimentProgressBar;
