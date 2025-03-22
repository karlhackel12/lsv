
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/Card';

interface ExperimentsHeaderProps {
  onCreateNew: () => void;
}

const ExperimentsHeader = ({ onCreateNew }: ExperimentsHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Experiment Tracking</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Design New Experiment
        </Button>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Design and track experiments to validate your hypotheses. Good experiments have a clear hypothesis, methodology, and success metrics.
        </p>
      </Card>
    </>
  );
};

export default ExperimentsHeader;
