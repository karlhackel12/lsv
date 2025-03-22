
import React from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/Card';

interface EmptyExperimentStateProps {
  onCreateNew: () => void;
}

const EmptyExperimentState = ({ onCreateNew }: EmptyExperimentStateProps) => {
  return (
    <Card className="p-12 text-center animate-slideUpFade">
      <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
      <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Experiments Yet</h3>
      <p className="text-validation-gray-600 mb-6">Design your first experiment to test a hypothesis.</p>
      <Button 
        className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
        onClick={onCreateNew}
      >
        <Plus className="h-4 w-4 mr-2" />
        Design First Experiment
      </Button>
    </Card>
  );
};

export default EmptyExperimentState;
