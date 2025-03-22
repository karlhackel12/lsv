
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Hypothesis } from '@/types/database';
import HypothesisForm from './forms/HypothesisForm';
import HypothesisTemplates from './hypotheses/HypothesisTemplates';
import HypothesisList from './hypotheses/HypothesisList';
import EmptyHypothesisState from './hypotheses/EmptyHypothesisState';
import DeleteHypothesisDialog from './hypotheses/DeleteHypothesisDialog';
import { useHypotheses } from '@/hooks/use-hypotheses';

interface HypothesesSectionProps {
  hypotheses: Hypothesis[];
  refreshData: () => void;
  projectId: string;
}

const HypothesesSection = ({ hypotheses, refreshData, projectId }: HypothesesSectionProps) => {
  const {
    isFormOpen,
    setIsFormOpen,
    selectedHypothesis,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    hypothesisToDelete,
    showTemplates,
    setShowTemplates,
    handleCreateNew,
    handleEdit,
    handleDelete,
    confirmDelete,
    updateHypothesisStatus,
    handleSaveHypothesis
  } = useHypotheses(refreshData);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Hypothesis Testing</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Hypothesis
        </Button>
      </div>

      <HypothesisTemplates 
        showTemplates={showTemplates} 
        setShowTemplates={setShowTemplates} 
      />

      {hypotheses.length === 0 ? (
        <EmptyHypothesisState onCreateNew={handleCreateNew} />
      ) : (
        <HypothesisList 
          hypotheses={hypotheses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
          onStatusChange={updateHypothesisStatus}
        />
      )}

      {/* Hypothesis Form Dialog */}
      <HypothesisForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveHypothesis}
        hypothesis={selectedHypothesis}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHypothesisDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        hypothesisToDelete={hypothesisToDelete}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default HypothesesSection;
