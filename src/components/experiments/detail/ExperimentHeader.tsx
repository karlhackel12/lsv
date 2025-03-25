
import React from 'react';
import { Experiment } from '@/types/database';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Edit, CalendarClock, Link as LinkIcon, TrendingUp, Beaker } from 'lucide-react';

interface ExperimentHeaderProps {
  experiment: Experiment;
  onEdit: () => void;
  hasRelatedHypothesis?: boolean;
  isGrowthExperiment?: boolean;
}

const ExperimentHeader = ({ 
  experiment, 
  onEdit, 
  hasRelatedHypothesis = false,
  isGrowthExperiment = false
}: ExperimentHeaderProps) => {
  const Icon = isGrowthExperiment ? TrendingUp : Beaker;
  
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-500 mr-1" />
          <h1 className="text-xl font-bold text-gray-900">{experiment.title}</h1>
          {hasRelatedHypothesis && (
            <Badge variant="outline" className="bg-blue-50 border-blue-200">
              <LinkIcon className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          )}
        </div>
        <div className="flex items-center mt-2 space-x-3 text-sm text-gray-500">
          <StatusBadge status={experiment.status} />
          <span className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-1" />
            {new Date(experiment.updated_at).toLocaleDateString()}
          </span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {experiment.category || 'Experiment'}
          </Badge>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={onEdit} 
        className="flex items-center"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit {isGrowthExperiment ? 'Growth ' : ''}Experiment
      </Button>
    </div>
  );
};

export default ExperimentHeader;
