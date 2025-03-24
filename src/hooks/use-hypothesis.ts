
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useHypotheses(refreshData: () => void, phaseType: 'problem' | 'solution' = 'problem') {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<Hypothesis | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const handleCreateNew = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
    console.log('Editing hypothesis:', hypothesis);
    setSelectedHypothesis({
      ...hypothesis,
      id: hypothesis.originalId || hypothesis.id
    });
    setIsFormOpen(true);
  };

  const handleDelete = (hypothesis: Hypothesis) => {
    setHypothesisToDelete({
      ...hypothesis,
      id: hypothesis.originalId || hypothesis.id
    });
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetail = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setViewMode('detail');
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
        title: 'Hypothesis deleted',
        description: 'The hypothesis has been successfully deleted.',
      });
      
      refreshData();
      setViewMode('list');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setHypothesisToDelete(null);
    }
  };

  const updateHypothesisStatus = async (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => {
    try {
      const hypothesisId = hypothesis.originalId || hypothesis.id;
      console.log('Updating hypothesis status:', hypothesisId, newStatus);
      
      const { error } = await supabase
        .from('hypotheses')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', hypothesisId);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Hypothesis status changed to ${newStatus}.`,
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveHypothesis = async (formData: Hypothesis): Promise<void> => {
    try {
      console.log('Saving hypothesis with data:', formData);
      
      // Add phase data to the form data
      formData.phase = phaseType;
      
      // Determine if we're updating an existing hypothesis or creating a new one
      if (selectedHypothesis) {
        console.log('Updating existing hypothesis:', selectedHypothesis.id);
        
        // Update existing hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .update({
            statement: formData.statement,
            category: formData.category,
            status: formData.status,
            criteria: formData.criteria,
            experiment: formData.experiment,
            evidence: formData.evidence,
            result: formData.result,
            phase: formData.phase,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedHypothesis.id);
          
        if (error) throw error;
        
        toast({
          title: 'Hypothesis updated',
          description: 'The hypothesis has been successfully updated.',
        });
      } else {
        console.log('Creating new hypothesis for project:', formData.project_id);
        
        // Create new hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .insert({
            statement: formData.statement,
            category: formData.category,
            status: formData.status || 'not-started',
            criteria: formData.criteria,
            experiment: formData.experiment,
            project_id: formData.project_id,
            phase: formData.phase,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Hypothesis created',
          description: 'A new hypothesis has been created successfully.',
        });
      }
      
      refreshData();
      setViewMode('list');
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
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
    handleViewDetail
  };
}
