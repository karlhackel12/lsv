
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, TrendingUp, Beaker } from 'lucide-react';

interface ExperimentsHeaderProps {
  onCreateNew?: () => void;
  experimentType?: 'problem' | 'solution' | 'business-model';
  isGrowthExperiment?: boolean;
}

const ExperimentsHeader = ({ 
  onCreateNew, 
  experimentType = 'problem',
  isGrowthExperiment = false
}: ExperimentsHeaderProps) => {
  const Icon = isGrowthExperiment ? TrendingUp : Beaker;
  
  const getTitle = () => {
    if (isGrowthExperiment) {
      return 'Growth Experiments';
    }
    
    return 'Validation Experiments';
  };
  
  const getDescription = () => {
    if (isGrowthExperiment) {
      return 'Design and run experiments to optimize your growth metrics and scale your business.';
    }
    
    switch(experimentType) {
      case 'problem':
        return 'Validate that the problem exists and is worth solving.';
      case 'solution':
        return 'Test that your solution effectively addresses the problem.';
      case 'business-model':
        return 'Verify that customers will pay for your solution.';
      default:
        return 'Run experiments to validate your hypotheses.';
    }
  };
  
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
        </div>
        <p className="text-gray-600 mt-1">
          {getDescription()}
        </p>
      </div>
      
      {onCreateNew && (
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {isGrowthExperiment ? 'New Growth Experiment' : 'New Experiment'}
        </Button>
      )}
    </div>
  );
};

export default ExperimentsHeader;
