
import React from 'react';
import { Hypothesis } from '@/types/database';
import HypothesisCard from './HypothesisCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HypothesisListProps {
  hypotheses: Hypothesis[];
  onEdit: (hypothesis: Hypothesis) => void;
  onDelete: (hypothesis: Hypothesis) => Promise<void> | void;
  onCreateNew: () => void;
  onViewDetail: (hypothesis: Hypothesis) => void;
  isLoading?: boolean;
  onStatusChange?: (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => void;
}

const HypothesisList = ({ 
  hypotheses, 
  onEdit, 
  onDelete, 
  onCreateNew,
  onViewDetail,
  isLoading = false,
  onStatusChange = () => {}
}: HypothesisListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-lg font-medium text-validation-gray-600">Loading hypotheses...</span>
      </div>
    );
  }

  if (hypotheses.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-4 md:p-8 text-center shadow-sm">
        <h3 className="text-xl font-medium mb-3 text-validation-gray-800">No hypotheses yet</h3>
        <p className="text-validation-gray-500 mb-6 max-w-md mx-auto">
          Start by creating your first hypothesis to validate your business assumptions.
        </p>
        <Button
          onClick={onCreateNew}
          className="px-4 md:px-6 py-2 bg-validation-blue-600 text-white rounded-lg hover:bg-validation-blue-700 transition-colors shadow-sm"
          size="lg"
        >
          Create First Hypothesis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {hypotheses.map((hypothesis, index) => (
          <div key={hypothesis.id} 
            className="animate-slideUpFade" 
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <HypothesisCard
              hypothesis={hypothesis}
              onEdit={() => onEdit(hypothesis)}
              onDelete={() => onDelete(hypothesis)}
              onViewDetail={() => onViewDetail(hypothesis)}
              onStatusChange={onStatusChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HypothesisList;
