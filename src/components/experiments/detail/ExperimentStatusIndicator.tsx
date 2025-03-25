
import React from 'react';
import { Experiment } from '@/types/database';
import { Beaker, CheckCircle, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

interface ExperimentStatusIndicatorProps {
  experiment: Experiment;
  size?: 'sm' | 'md' | 'lg';
  isGrowthExperiment?: boolean;
}

const ExperimentStatusIndicator = ({ 
  experiment, 
  size = 'md',
  isGrowthExperiment = false
}: ExperimentStatusIndicatorProps) => {
  // Determine icon size based on the size prop
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  
  const InProgressIcon = isGrowthExperiment ? TrendingUp : Beaker;
  
  if (experiment.status === 'completed') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className={iconSize} />
        <span className={textSize}>
          {isGrowthExperiment ? 'Growth experiment' : 'Experiment'} completed
        </span>
      </div>
    );
  } else if (experiment.status === 'in-progress') {
    return (
      <div className="flex items-center space-x-2 text-amber-600">
        <InProgressIcon className={iconSize} />
        <span className={textSize}>
          {isGrowthExperiment ? 'Growth experiment' : 'Experiment'} in progress
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <FileText className={iconSize} />
        <span className={textSize}>
          {isGrowthExperiment ? 'Growth experiment' : 'Experiment'} planned
        </span>
      </div>
    );
  }
};

export default ExperimentStatusIndicator;
