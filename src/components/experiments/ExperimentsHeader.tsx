
import React from 'react';
import { Plus, Beaker, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperimentsHeaderProps {
  onCreateNew: () => void;
  experimentType?: 'problem' | 'solution' | 'business-model';
}

const ExperimentsHeader = ({ 
  onCreateNew,
  experimentType = 'problem'
}: ExperimentsHeaderProps) => {
  // Get the appropriate icon and title based on experiment type
  const getHeaderContent = () => {
    switch(experimentType) {
      case 'problem':
        return {
          icon: <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />,
          title: 'Problem Experiments',
          buttonText: 'Add Problem Experiment'
        };
      case 'solution':
        return {
          icon: <Beaker className="h-5 w-5 mr-2 text-green-500" />,
          title: 'Solution Experiments',
          buttonText: 'Add Solution Experiment'
        };
      case 'business-model':
        return {
          icon: <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />,
          title: 'Business Model Experiments',
          buttonText: 'Add Business Model Experiment'
        };
      default:
        return {
          icon: <Beaker className="h-5 w-5 mr-2 text-blue-500" />,
          title: 'Experiments',
          buttonText: 'Add New Experiment'
        };
    }
  };

  const { icon, title, buttonText } = getHeaderContent();
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-validation-gray-900 flex items-center">
        {icon}
        {title}
      </h2>
      <Button 
        id="create-experiment-button"
        className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
        onClick={onCreateNew}
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
};

export default ExperimentsHeader;
