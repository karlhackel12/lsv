
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Hypothesis } from '@/types/database';
import HypothesisForm from './forms/HypothesisForm';
import HypothesisTemplates from './hypotheses/HypothesisTemplates';
import HypothesisList from './hypotheses/HypothesisList';
import EmptyHypothesisState from './hypotheses/EmptyHypothesisState';
import DeleteHypothesisDialog from './hypotheses/DeleteHypothesisDialog';
import HypothesisDetailView from './hypotheses/HypothesisDetailView';
import { useHypotheses } from '@/hooks/use-hypothesis';
import { Loader2 } from 'lucide-react';

interface HypothesesSectionProps {
  hypotheses: Hypothesis[];
  refreshData: () => void;
  projectId: string;
  isLoading?: boolean;
  phaseType?: 'problem' | 'solution';
}

const HypothesesSection = ({ 
  hypotheses, 
  refreshData, 
  projectId, 
  isLoading = false,
  phaseType = 'problem'
}: HypothesesSectionProps) => {
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
    handleSaveHypothesis,
    viewMode,
    setViewMode,
    handleViewDetail
  } = useHypotheses(refreshData, phaseType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-lg font-medium text-validation-gray-600">Loading hypotheses...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-validation-gray-900">
              {phaseType === 'problem' ? 'Problem Hypotheses' : 'Solution Hypotheses'}
            </h2>
            <Button 
              id="create-hypothesis-button"
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
            phaseType={phaseType}
          />

          {hypotheses.length === 0 ? (
            <EmptyHypothesisState 
              onCreateNew={handleCreateNew} 
              phaseType={phaseType} 
            />
          ) : (
            <HypothesisList 
              hypotheses={hypotheses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateNew={handleCreateNew}
              onViewDetail={handleViewDetail}
              onStatusChange={updateHypothesisStatus}
            />
          )}
        </>
      ) : (
        selectedHypothesis && (
          <HypothesisDetailView
            hypothesis={selectedHypothesis}
            onEdit={() => handleEdit(selectedHypothesis)}
            onClose={() => setViewMode('list')}
            onRefresh={refreshData}
            projectId={projectId}
          />
        )
      )}

      {/* Hypothesis Form Dialog */}
      <HypothesisForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveHypothesis}
        hypothesis={selectedHypothesis}
        projectId={projectId}
        phaseType={phaseType}
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
