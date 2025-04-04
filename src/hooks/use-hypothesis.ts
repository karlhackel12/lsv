
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/hooks/use-project';

export const useHypotheses = (
  onHypothesesUpdated: () => void,
  phaseType: 'problem' | 'solution'
) => {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<Hypothesis | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const handleCreateNew = useCallback(() => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((hypothesis: Hypothesis) => {
    setHypothesisToDelete(hypothesis);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetail = useCallback((hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setViewMode('detail');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!hypothesisToDelete) return;

    try {
      // Use the originalId if it exists, otherwise use the regular id
      const idToDelete = hypothesisToDelete.originalId || hypothesisToDelete.id;
      
      const { error } = await supabase
        .from('hypotheses')
        .delete()
        .eq('id', idToDelete);

      if (error) throw error;

      toast({
        title: 'Hipótese excluída',
        description: 'A hipótese foi excluída com sucesso',
        variant: 'default',
      });

      onHypothesesUpdated();
    } catch (error) {
      console.error('Error deleting hypothesis:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a hipótese. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  }, [hypothesisToDelete, onHypothesesUpdated, toast]);

  const updateHypothesisStatus = useCallback(
    async (hypothesis: Hypothesis, status: 'validated' | 'validating' | 'not-started' | 'invalid') => {
      try {
        // Use the originalId if it exists, otherwise use the regular id
        const idToUpdate = hypothesis.originalId || hypothesis.id;
        
        const { error } = await supabase
          .from('hypotheses')
          .update({ status })
          .eq('id', idToUpdate);

        if (error) throw error;

        toast({
          title: 'Status atualizado',
          description: `A hipótese foi marcada como ${status}`,
          variant: 'default',
        });

        onHypothesesUpdated();
      } catch (error) {
        console.error('Error updating hypothesis status:', error);
        toast({
          title: 'Erro ao atualizar status',
          description: 'Não foi possível atualizar o status da hipótese',
          variant: 'destructive',
        });
      }
    },
    [onHypothesesUpdated, toast]
  );

  const handleSaveHypothesis = useCallback(
    async (formData: Partial<Hypothesis>) => {
      try {
        // Ensure we have a project_id - either from the form data or from the current project
        const project_id = formData.project_id || (currentProject?.id || '');
        
        if (!project_id) {
          throw new Error('Nenhum projeto selecionado. Por favor, selecione um projeto primeiro.');
        }

        const isNew = !formData.id;
        
        // Fill in required fields for new hypotheses
        if (isNew) {
          formData = {
            ...formData,
            project_id,
            phase: phaseType,
            status: 'not-started' as 'not-started',
            created_at: new Date().toISOString(),
          };
        }

        let result;
        
        if (isNew) {
          // Create new hypothesis
          result = await supabase.from('hypotheses').insert(formData).select();
        } else {
          // Use the originalId if it exists, otherwise use the regular id
          const idToUpdate = formData.originalId || formData.id;
          
          // Update existing hypothesis
          result = await supabase
            .from('hypotheses')
            .update(formData)
            .eq('id', idToUpdate as string)
            .select();
        }

        if (result.error) throw result.error;

        toast({
          title: isNew ? 'Hipótese criada' : 'Hipótese atualizada',
          description: isNew ? 'Hipótese criada com sucesso' : 'Hipótese atualizada com sucesso',
          variant: 'default',
        });

        setIsFormOpen(false);
        onHypothesesUpdated();
      } catch (error) {
        console.error('Error saving hypothesis:', error);
        toast({
          title: 'Erro ao salvar',
          description: (error as Error).message || 'Não foi possível salvar a hipótese. Tente novamente.',
          variant: 'destructive',
        });
      }
    },
    [currentProject, phaseType, onHypothesesUpdated, toast]
  );

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
};

export default useHypotheses;
