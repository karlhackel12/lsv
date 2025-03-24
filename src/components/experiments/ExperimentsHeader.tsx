
import React from 'react';
import { Plus, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperimentsHeaderProps {
  onCreateNew: () => void;
  experimentType?: 'problem' | 'solution' | 'business-model';
}

const ExperimentsHeader = ({ 
  onCreateNew,
  experimentType = 'problem'
}: ExperimentsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-validation-gray-900 flex items-center">
        <Beaker className="h-5 w-5 mr-2 text-blue-500" />
        Experiments
      </h2>
      <Button 
        id="create-experiment-button"
        className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
        onClick={onCreateNew}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Experiment
      </Button>
    </div>
  );
};

export default ExperimentsHeader;
