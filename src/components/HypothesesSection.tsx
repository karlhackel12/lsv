
import React, { useEffect } from 'react';
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
  createTrigger?: number;
}

const HypothesesSection = ({
  hypotheses,
  refreshData,
  projectId,
  isLoading = false,
  phaseType = 'problem',
  createTrigger = 0
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
  
  // Listen to createTrigger changes from parent component
  useEffect(() => {
    if (createTrigger > 0) {
      handleCreateNew();
    }
  }, [createTrigger]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span className="text-lg font-medium text-validation-gray-600">Loading hypotheses...</span>
    </div>;
  }
  
  // Define a stub onApply function since we're just displaying templates but not using them directly
  const handleApplyTemplate = () => {
    // This is intentionally empty as the actual template application is handled elsewhere
    // Just needed to satisfy the prop requirement
    setShowTemplates(false);
  };
  
  return (
    <div className="animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          <HypothesisTemplates 
            showTemplates={showTemplates} 
            onClose={() => setShowTemplates(false)}
            onApply={handleApplyTemplate} 
            phaseType={phaseType} 
          />

          {hypotheses.length === 0 ? (
            <EmptyHypothesisState onCreateNew={handleCreateNew} phaseType={phaseType} />
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
