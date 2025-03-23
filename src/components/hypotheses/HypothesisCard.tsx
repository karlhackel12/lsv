
import React from 'react';
import { Lightbulb, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import Card from '@/components/Card';
import { Hypothesis } from '@/types/database';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  onEdit: (hypothesis: Hypothesis) => void;
  onDelete: (hypothesis: Hypothesis) => void;
  onViewDetail: (hypothesis: Hypothesis) => void;
  onStatusChange: (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => void;
}

const HypothesisCard = ({ 
  hypothesis, 
  onEdit, 
  onDelete, 
  onViewDetail,
  onStatusChange 
}: HypothesisCardProps) => {
  return (
    <Card 
      className="p-4 md:p-6 h-full flex flex-col animate-slideUpFade" 
      hover={true}
    >
      <div className="flex flex-wrap justify-between gap-2 mb-3 md:mb-5">
        <span className={`text-xs font-semibold inline-block px-3 py-1 rounded-full ${
          hypothesis.category === 'growth' 
            ? 'bg-validation-green-50 text-validation-green-700 border border-validation-green-200'
            : 'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200'
        }`}>
          {hypothesis.category === 'growth' ? 'Growth Hypothesis' : 'Value Hypothesis'}
        </span>
        <div className="flex space-x-2">
          <StatusBadge status={hypothesis.status} />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-3 md:mb-4 text-validation-gray-900 line-clamp-2">{hypothesis.statement}</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
        <div className="space-y-2 md:space-y-3">
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Experiment</p>
            <p className="text-validation-gray-700 line-clamp-3">{hypothesis.experiment}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Success Criteria</p>
            <p className="text-validation-gray-700 line-clamp-3">{hypothesis.criteria}</p>
          </div>
          
          {(hypothesis.result || hypothesis.evidence) && (
            <div className="pt-2">
              {hypothesis.result && (
                <div className="mb-2 md:mb-3">
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
                  <p className="text-validation-gray-700 line-clamp-2">
                    {hypothesis.result}
                  </p>
                </div>
              )}
              
              {hypothesis.evidence && (
                <div>
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Evidence</p>
                  <p className="text-validation-gray-700 line-clamp-2">
                    {hypothesis.evidence}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewDetail(hypothesis)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Details</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(hypothesis)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
            onClick={() => onDelete(hypothesis)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>

        {(hypothesis.status === 'validating' || hypothesis.status === 'not-started') && (
          <div className="flex flex-wrap gap-2">
            {hypothesis.status === 'not-started' && (
              <Button 
                size="sm"
                className="bg-validation-blue-600 hover:bg-validation-blue-700"
                onClick={() => onStatusChange(hypothesis, 'validating')}
              >
                Start Experiment
              </Button>
            )}
            {hypothesis.status === 'validating' && (
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  className="bg-validation-green-600 hover:bg-validation-green-700"
                  onClick={() => onStatusChange(hypothesis, 'validated')}
                >
                  Validate
                </Button>
                <Button 
                  size="sm"
                  className="bg-validation-red-600 hover:bg-validation-red-700"
                  onClick={() => onStatusChange(hypothesis, 'invalid')}
                >
                  Invalidate
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default HypothesisCard;
