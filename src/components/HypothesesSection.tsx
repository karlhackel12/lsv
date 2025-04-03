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
  title?: string;
  hypotheses: Hypothesis[];
  isLoading?: boolean;
  phase?: 'problem' | 'solution';
  onCreateTrigger?: number;
  onHypothesesUpdated?: () => void;
  projectId?: string;
}

const HypothesesSection = ({
  title,
  hypotheses,
  isLoading = false,
  phase = 'problem',
  onCreateTrigger = 0,
  onHypothesesUpdated,
  projectId
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
  } = useHypotheses(onHypothesesUpdated || (() => {}), phase);
  
  // Listen to createTrigger changes from parent component
  useEffect(() => {
    if (onCreateTrigger > 0) {
      handleCreateNew();
    }
  }, [onCreateTrigger]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
      <span className="text-lg font-medium text-muted-foreground">Carregando hipóteses...</span>
    </div>;
  }
  
  return (
    <div className="animate-fadeIn">
      {title && (
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      )}
      
      {viewMode === 'list' ? (
        <>
          <HypothesisTemplates 
            showTemplates={showTemplates} 
            onClose={() => setShowTemplates(false)} 
            onApply={handleSaveHypothesis} 
            phaseType={phase} 
          />

          {hypotheses.length === 0 ? (
            <EmptyHypothesisState onCreateNew={handleCreateNew} phaseType={phase} />
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
            onRefresh={onHypothesesUpdated || (() => {})} 
            projectId={projectId || selectedHypothesis.project_id} 
          />
        )
      )}

      {/* Hypothesis Form Dialog */}
      <HypothesisForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveHypothesis} 
        hypothesis={selectedHypothesis} 
        projectId={projectId || ''} 
        phaseType={phase} 
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
