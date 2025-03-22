
import React from 'react';
import { Lightbulb, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import Card from '@/components/Card';
import { Hypothesis } from '@/types/database';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  onEdit: (hypothesis: Hypothesis) => void;
  onDelete: (hypothesis: Hypothesis) => void;
  onStatusChange: (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => void;
}

const HypothesisCard = ({ hypothesis, onEdit, onDelete, onStatusChange }: HypothesisCardProps) => {
  return (
    <Card 
      className="p-6 animate-slideUpFade" 
      hover={true}
    >
      <div className="flex justify-between mb-4">
        <span className={`text-xs font-semibold inline-block px-3 py-1 rounded-full ${
          hypothesis.category === 'value' 
            ? 'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200' 
            : 'bg-validation-gray-50 text-validation-gray-700 border border-validation-gray-200'
        }`}>
          {hypothesis.category === 'value' ? 'Value Hypothesis' : 'Growth Hypothesis'}
        </span>
        <div className="flex space-x-2">
          <StatusBadge status={hypothesis.status} />
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(hypothesis)}
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
            onClick={() => onDelete(hypothesis)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-4 text-validation-gray-900">{hypothesis.statement}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-validation-gray-500 mb-1">Experiment</p>
          <p className="text-validation-gray-700 mb-4">{hypothesis.experiment}</p>
          
          <p className="text-sm font-medium text-validation-gray-500 mb-1">Success Criteria</p>
          <p className="text-validation-gray-700">{hypothesis.criteria}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
          <p className="text-validation-gray-700 mb-4">
            {hypothesis.result || 'No results yet'}
          </p>
          
          <p className="text-sm font-medium text-validation-gray-500 mb-1">Evidence</p>
          <p className="text-validation-gray-700">
            {hypothesis.evidence || 'No evidence collected yet'}
          </p>
        </div>
      </div>
      {(hypothesis.status === 'validating' || hypothesis.status === 'not-started') && (
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => onEdit(hypothesis)}
          >
            Update Results
          </Button>
          {hypothesis.status === 'not-started' && (
            <Button 
              className="bg-validation-blue-600 hover:bg-validation-blue-700"
              onClick={() => onStatusChange(hypothesis, 'validating')}
            >
              Start Experiment
            </Button>
          )}
          {hypothesis.status === 'validating' && (
            <div className="flex gap-2">
              <Button 
                className="bg-validation-green-600 hover:bg-validation-green-700"
                onClick={() => onStatusChange(hypothesis, 'validated')}
              >
                Mark Validated
              </Button>
              <Button 
                className="bg-validation-red-600 hover:bg-validation-red-700"
                onClick={() => onStatusChange(hypothesis, 'invalid')}
              >
                Mark Invalid
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default HypothesisCard;
