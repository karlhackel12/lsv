
import { useState } from 'react';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseHypothesesProps {
  onHypothesesUpdated: () => void;
  phaseType: 'problem' | 'solution';
}

export function useHypotheses({ onHypothesesUpdated, phaseType }: UseHypothesesProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<Hypothesis | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { toast } = useToast();

  const handleCreateNew = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setIsFormOpen(true);
  };

  const handleDelete = (hypothesis: Hypothesis) => {
    setHypothesisToDelete(hypothesis);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!hypothesisToDelete) return;

    try {
      const { error } = await supabase
        .from('hypotheses')
        .delete()
        .eq('id', hypothesisToDelete.id);

      if (error) throw error;

      toast({
        title: 'Hypothesis Deleted',
        description: 'The hypothesis has been successfully deleted',
        variant: 'default'
      });

      setIsDeleteDialogOpen(false);
      onHypothesesUpdated();
    } catch (error: any) {
      console.error('Error deleting hypothesis:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete hypothesis',
        variant: 'destructive',
      });
    }
  };

  const updateHypothesisStatus = async (hypothesis: Hypothesis, newStatus: "validated" | "validating" | "not-started" | "invalid") => {
    try {
      const { error } = await supabase
        .from('hypotheses')
        .update({ status: newStatus })
        .eq('id', hypothesis.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Hypothesis status updated to ${newStatus}`,
        variant: 'default'
      });

      onHypothesesUpdated();
    } catch (error: any) {
      console.error('Error updating hypothesis status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSaveHypothesis = async (hypothesis: Hypothesis) => {
    try {
      let data;

      if (hypothesis.id) {
        // Update existing hypothesis
        const { data: updatedData, error } = await supabase
          .from('hypotheses')
          .update({
            statement: hypothesis.statement,
            category: hypothesis.category,
            criteria: hypothesis.criteria,
            experiment: hypothesis.experiment,
            evidence: hypothesis.evidence || null,
            result: hypothesis.result || null,
            status: hypothesis.status || 'not-started',
            phase: hypothesis.phase || phaseType,
          })
          .eq('id', hypothesis.id)
          .select();

        if (error) throw error;
        data = updatedData;
      } else {
        // Create new hypothesis
        const { data: newData, error } = await supabase
          .from('hypotheses')
          .insert({
            statement: hypothesis.statement,
            category: hypothesis.category,
            criteria: hypothesis.criteria,
            experiment: hypothesis.experiment,
            phase: hypothesis.phase || phaseType,
            project_id: hypothesis.project_id,
            status: 'not-started'
          })
          .select();

        if (error) throw error;
        data = newData;
      }

      toast({
        title: hypothesis.id ? 'Hypothesis Updated' : 'Hypothesis Created',
        description: hypothesis.id
          ? 'Your hypothesis has been updated successfully'
          : 'Your new hypothesis has been created',
        variant: 'default'
      });

      setIsFormOpen(false);
      onHypothesesUpdated();
    } catch (error: any) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save hypothesis',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetail = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setViewMode('detail');
  };

  return {
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
    handleViewDetail,
  };
}
