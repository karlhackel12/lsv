
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Experiment } from '@/types/database';
import { FormData } from '@/components/forms/ExperimentForm';

interface UseExperimentFormProps {
  experiment?: Experiment | null;
  projectId: string;
  hypothesisId?: string;
  onSave: () => void;
  onClose: () => void;
}

export const useExperimentForm = ({ 
  experiment, 
  projectId, 
  hypothesisId, 
  onSave, 
  onClose 
}: UseExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const form = useForm<FormData>({
    defaultValues: experiment ? {
      title: experiment.title,
      hypothesis: experiment.hypothesis,
      method: experiment.method,
      metrics: experiment.metrics,
      category: experiment.category || '',
      results: experiment.results || '',
      decisions: experiment.decisions || '',
      insights: experiment.insights || '',
      status: experiment.status,
    } : {
      title: '',
      hypothesis: '',
      method: '',
      metrics: '',
      category: '',
      results: '',
      decisions: '',
      insights: '',
      status: 'planned',
    }
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && experiment) {
        // Update existing experiment
        const { error } = await supabase
          .from('experiments')
          .update({
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            category: data.category,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
            status: data.status as 'planned' | 'in-progress' | 'completed', 
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.id);

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to update experiment. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Experiment updated',
          description: 'The experiment has been successfully updated.',
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
            category: data.category,
            hypothesis_id: hypothesisId,
            project_id: projectId,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
            status: data.status as 'planned' | 'in-progress' | 'completed',
          });

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to create experiment. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Experiment created',
          description: 'A new experiment has been created successfully.',
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    form,
    isEditing,
    handleSubmit
  };
};
