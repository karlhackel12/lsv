
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Beaker, PlusCircle, TrendingUp } from 'lucide-react';

interface EmptyExperimentStateProps {
  onCreateNew: () => void;
  isGrowthExperiment?: boolean;
}

const EmptyExperimentState: React.FC<EmptyExperimentStateProps> = ({ 
  onCreateNew,
  isGrowthExperiment = false
}) => {
  const Icon = isGrowthExperiment ? TrendingUp : Beaker;
  
  return (
    <Card className="mt-6 border-dashed">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <Icon className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isGrowthExperiment ? 'No Growth Experiments Yet' : 'No Experiments Yet'}
        </h3>
        <p className="text-gray-500 mb-4 max-w-md">
          {isGrowthExperiment 
            ? 'Create experiments to optimize your growth metrics and test your growth hypotheses.'
            : 'Design experiments to validate your hypotheses and collect evidence to support your decisions.'
          }
        </p>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {isGrowthExperiment ? 'Create First Growth Experiment' : 'Create First Experiment'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyExperimentState;
