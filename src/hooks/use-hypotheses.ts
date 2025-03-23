
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useHypotheses(refreshData: () => void) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<Hypothesis | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleCreateNew = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
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
      const { error } = await supabase
        .from('hypotheses')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', hypothesis.originalId || hypothesis.id);
      
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
      // Determine if we're updating an existing hypothesis or creating a new one
      if (selectedHypothesis) {
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
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedHypothesis.id);
          
        if (error) throw error;
        
        toast({
          title: 'Hypothesis updated',
          description: 'The hypothesis has been successfully updated.',
        });
      } else {
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
          });
          
        if (error) throw error;
        
        toast({
          title: 'Hypothesis created',
          description: 'A new hypothesis has been created successfully.',
        });
      }
      
      refreshData();
      return Promise.resolve();
    } catch (error: any) {
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
    handleSaveHypothesis
  };
}
