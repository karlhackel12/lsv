
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import ExperimentStatusActions from './ExperimentStatusActions';
import { Experiment } from '@/types/database';

interface ExperimentCardProps {
  experiment: Experiment;
  index: number;
  onEdit: (experiment: Experiment) => void;
  onDelete: (experiment: Experiment) => void;
  onViewDetail: (experiment: Experiment) => void;
  refreshData: () => void;
}

const ExperimentCard = ({ 
  experiment, 
  index, 
  onEdit, 
  onDelete, 
  onViewDetail,
  refreshData 
}: ExperimentCardProps) => {
  return (
    <Card 
      key={experiment.id} 
      className="p-6 animate-slideUpFade" 
      style={{ animationDelay: `${(index + 2) * 100}ms` }}
      hover={true}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-validation-gray-900">{experiment.title}</h3>
          <p className="text-validation-gray-600 italic mb-2">Testing: {experiment.hypothesis}</p>
        </div>
        <div className="flex space-x-2">
          <StatusBadge status={experiment.status as any} />
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewDetail(experiment)}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="sr-only">View</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(experiment)}
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
            onClick={() => onDelete(experiment)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Method</p>
            <p className="text-validation-gray-700">{experiment.method}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Key Metrics</p>
            <p className="text-validation-gray-700">{experiment.metrics}</p>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
            <p className="text-validation-gray-700">
              {experiment.results || 'No results yet'}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Insights</p>
            <p className="text-validation-gray-700">
              {experiment.insights || 'No insights yet'}
            </p>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Decisions</p>
            <p className="text-validation-gray-700">
              {experiment.decisions || 'Pending experiment completion'}
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex justify-center items-center"
              onClick={() => onViewDetail(experiment)}
            >
              <Eye className="h-3.5 w-3.5 mr-2" />
              View Details
            </Button>
            
            <ExperimentStatusActions 
              experiment={experiment} 
              refreshData={refreshData}
              onEdit={onEdit}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExperimentCard;
