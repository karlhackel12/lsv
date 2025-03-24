
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
  experimentType?: 'problem' | 'solution' | 'business-model';
}

export function useExperimentForm({
  experiment,
  projectId,
  hypothesisId,
  onSave,
  onClose,
  experimentType = 'problem'
}: UseExperimentFormProps) {
  const { toast } = useToast();
  const isEditing = !!experiment;

  console.log("useExperimentForm initializing with:", { 
    isEditing, 
    experimentId: experiment?.id,
    experimentType,
    projectId,
    hypothesisId
  });

  // Initialize form with proper defaults for new experiments or existing data for edits
  const form = useForm<Experiment>({
    defaultValues: isEditing && experiment 
      ? {
          ...experiment,
          // Convert null values to empty strings to avoid controlled/uncontrolled component warnings
          title: experiment.title || '',
          hypothesis: experiment.hypothesis || '',
          method: experiment.method || '',
          metrics: experiment.metrics || '',
          status: experiment.status || 'planned',
          category: experiment.category || experimentType || 'problem',
          results: experiment.results || '',
          insights: experiment.insights || '',
          decisions: experiment.decisions || '',
        }
      : {
          title: '',
          hypothesis: '',
          method: '',
          metrics: '',
          status: 'planned',
          category: experimentType || 'problem',
          results: '',
          insights: '',
          decisions: '',
          project_id: projectId,
          hypothesis_id: hypothesisId || null,
        },
  });

  const handleSubmit = async (data: Experiment) => {
    try {
      console.log("Submitting experiment data:", { isEditing, data });
      
      if (isEditing && experiment?.id) {
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
            results: data.results || null, // Convert empty string to null for DB
            insights: data.insights || null,
            decisions: data.decisions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.id);
          
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        toast({
          title: 'Success',
          description: 'Experiment updated successfully',
        });
      } else {
        // Create new experiment
        console.log("Creating new experiment with data:", {
          title: data.title,
          hypothesis: data.hypothesis,
          method: data.method,
          metrics: data.metrics,
          status: data.status || 'planned',
          category: data.category || experimentType || 'problem',
          project_id: projectId,
          hypothesis_id: hypothesisId || null,
        });
        
        const { error } = await supabase
          .from('experiments')
          .insert({
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            status: data.status || 'planned',
            category: data.category || experimentType || 'problem',
            project_id: projectId,
            hypothesis_id: hypothesisId || null,
          });
          
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        
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
