
import React from 'react';
import { Experiment } from '@/types/database';
import { Beaker, CheckCircle, FileText } from 'lucide-react';

interface ExperimentStatusIndicatorProps {
  experiment: Experiment;
}

const ExperimentStatusIndicator = ({ experiment }: ExperimentStatusIndicatorProps) => {
  if (experiment.status === 'completed') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <span>Experiment completed</span>
      </div>
    );
  } else if (experiment.status === 'in-progress') {
    return (
      <div className="flex items-center space-x-2 text-amber-600">
        <Beaker className="h-5 w-5" />
        <span>Experiment in progress</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <FileText className="h-5 w-5" />
        <span>Experiment planned</span>
      </div>
    );
  }
};

export default ExperimentStatusIndicator;
