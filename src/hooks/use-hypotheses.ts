
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
    const originalHypothesis = {
      ...hypothesis,
      id: hypothesis.originalId
    };
    setSelectedHypothesis(originalHypothesis);
    setIsFormOpen(true);
  };

  const handleDelete = (hypothesis: Hypothesis) => {
    setHypothesisToDelete({
      ...hypothesis,
      id: hypothesis.originalId
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
        .eq('id', hypothesis.originalId);
      
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
    refreshData();
    return Promise.resolve();
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
