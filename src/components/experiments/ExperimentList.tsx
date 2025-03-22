
import React from 'react';
import ExperimentCard from './ExperimentCard';
import EmptyExperimentState from './EmptyExperimentState';
import { Experiment } from '@/types/database';

interface ExperimentListProps {
  experiments: Experiment[];
  refreshData: () => void;
  onEdit: (experiment: Experiment) => void;
  onDelete: (experiment: Experiment) => void;
  onCreateNew: () => void;
  onViewDetail: (experiment: Experiment) => void;
}

const ExperimentList = ({ 
  experiments, 
  refreshData, 
  onEdit, 
  onDelete, 
  onCreateNew,
  onViewDetail
}: ExperimentListProps) => {
  if (experiments.length === 0) {
    return <EmptyExperimentState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="space-y-6">
      {experiments.map((experiment, index) => (
        <ExperimentCard
          key={experiment.id}
          experiment={experiment}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetail={onViewDetail}
          refreshData={refreshData}
        />
      ))}
    </div>
  );
};

export default ExperimentList;
