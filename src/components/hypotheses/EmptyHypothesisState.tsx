
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Beaker, Target } from 'lucide-react';

interface EmptyHypothesisStateProps {
  onCreateNew: () => void;
  phaseType?: 'problem' | 'solution';
}

const EmptyHypothesisState = ({ onCreateNew, phaseType = 'problem' }: EmptyHypothesisStateProps) => {
  return (
    <Card className="p-12 text-center animate-slideUpFade">
      {phaseType === 'problem' ? (
        <Lightbulb className="mx-auto h-12 w-12 text-validation-blue-400 mb-4" />
      ) : (
        <Beaker className="mx-auto h-12 w-12 text-validation-green-400 mb-4" />
      )}
      
      <h3 className="text-xl font-medium text-validation-gray-900 mb-2">
        {phaseType === 'problem' 
          ? 'No Problem Hypotheses Yet' 
          : 'No Solution Hypotheses Yet'}
      </h3>
      
      <p className="text-validation-gray-600 mb-6 max-w-md mx-auto">
        {phaseType === 'problem'
          ? 'Start by creating hypotheses about customer problems to validate your assumptions.'
          : 'Create hypotheses about potential solutions that address validated problems.'}
      </p>
      
      <Button 
        onClick={onCreateNew}
        className={phaseType === 'problem' 
          ? "bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
          : "bg-validation-green-600 hover:bg-validation-green-700 text-white"}
        size="lg"
      >
        <Target className="h-4 w-4 mr-2" />
        {phaseType === 'problem' 
          ? 'Create First Problem Hypothesis' 
          : 'Create First Solution Hypothesis'}
      </Button>
    </Card>
  );
};

export default EmptyHypothesisState;
