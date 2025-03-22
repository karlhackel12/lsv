
import React, { useState } from 'react';
import { Experiment } from '@/types/database';
import ExperimentForm from './forms/ExperimentForm';
import ExperimentsHeader from './experiments/ExperimentsHeader';
import ExperimentList from './experiments/ExperimentList';
import DeleteExperimentDialog from './experiments/DeleteExperimentDialog';

interface ExperimentsSectionProps {
  experiments: Experiment[];
  refreshData: () => void;
  projectId: string;
}

const ExperimentsSection = ({ experiments, refreshData, projectId }: ExperimentsSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);

  const handleCreateNew = () => {
    setSelectedExperiment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (experiment: Experiment) => {
    // Find original experiment with string ID for database operations
    // Use the experiment as is since it already has originalId if needed
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };

  const handleDelete = (experiment: Experiment) => {
    // Use the experiment as is since it already has originalId if needed
    setExperimentToDelete(experiment);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="animate-fadeIn">
      <ExperimentsHeader onCreateNew={handleCreateNew} />
      
      <ExperimentList 
        experiments={experiments}
        refreshData={refreshData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />

      {/* Experiment Form Dialog */}
      <ExperimentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        experiment={selectedExperiment}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExperimentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        experimentToDelete={experimentToDelete}
        refreshData={refreshData}
      />
    </div>
  );
};

export default ExperimentsSection;
