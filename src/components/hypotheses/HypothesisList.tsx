
import React from 'react';
import { Hypothesis } from '@/types/database';
import HypothesisCard from './HypothesisCard';
import { Loader2 } from 'lucide-react';

export interface HypothesisListProps {
  hypotheses: Hypothesis[];
  onEdit: (hypothesis: Hypothesis) => void;
  onDelete: (hypothesis: Hypothesis) => Promise<void>;
  onCreateNew: () => void;
  isLoading?: boolean;
}

const HypothesisList = ({ 
  hypotheses, 
  onEdit, 
  onDelete, 
  onCreateNew,
  isLoading = false
}: HypothesisListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading hypotheses...</span>
      </div>
    );
  }

  if (hypotheses.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium mb-2">No hypotheses yet</h3>
        <p className="text-gray-500 mb-4">
          Start by creating your first hypothesis to validate your business assumptions.
        </p>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Create First Hypothesis
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {hypotheses.map((hypothesis) => (
          <HypothesisCard
            key={hypothesis.id}
            hypothesis={hypothesis}
            onEdit={() => onEdit(hypothesis)}
            onDelete={() => onDelete(hypothesis)}
          />
        ))}
      </div>
    </div>
  );
};

export default HypothesisList;
