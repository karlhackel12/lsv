
import { useForm } from 'react-hook-form';
import { Experiment } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseExperimentFormProps {
  experiment?: Experiment | null;
  projectId: string;
  hypothesisId?: string;
  onSave: () => void;
  onClose: () => void;
}

export function useExperimentForm({
  experiment,
  projectId,
  hypothesisId,
  onSave,
  onClose
}: UseExperimentFormProps) {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const form = useForm<Experiment>({
    defaultValues: experiment || {
      title: '',
      hypothesis: '',
      method: '',
      metrics: '',
      status: 'planned',
      category: 'problem',
      results: '',
      insights: '',
      decisions: '',
    },
  });

  const handleSubmit = async (data: Experiment) => {
    try {
      if (isEditing) {
        // Update existing experiment
        const { error } = await supabase
          .from('experiments')
          .update({
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            status: data.status,
            category: data.category,
            results: data.results,
            insights: data.insights,
            decisions: data.decisions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Experiment updated successfully',
        });
      } else {
        // Create new experiment
        const { error } = await supabase
          .from('experiments')
          .insert({
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            status: data.status || 'planned',
            category: data.category || 'problem',
            project_id: projectId,
            hypothesis_id: hypothesisId || null,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'New experiment created successfully',
        });
      }
      
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving experiment:', err);
      toast({
        title: 'Error',
        description: 'Failed to save experiment',
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    isEditing,
    handleSubmit,
  };
}
