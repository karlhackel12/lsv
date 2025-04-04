import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Experiment } from '@/types/database';
import { FormData } from '@/components/forms/ExperimentForm';
import { adaptExperimentForDb } from '@/utils/experiment-adapter';

interface UseExperimentFormProps {
  experiment: Experiment | null | undefined;
  projectId: string;
  hypothesisId?: string | null;
  onSave: (experiment: Experiment) => void;
  onClose: () => void;
  experimentType?: 'problem' | 'solution' | 'business-model';
  isGrowthExperiment?: boolean;
}

export function useExperimentForm({
  experiment,
  projectId,
  hypothesisId,
  onSave,
  onClose,
  experimentType = 'problem',
  isGrowthExperiment = false
}: UseExperimentFormProps) {
  const { toast } = useToast();
  const isEditing = !!experiment;
  
  const formSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    hypothesis: z.string().min(1, 'Hypothesis is required'),
    method: z.string().min(1, 'Method is required'),
    metrics: z.array(z.string()).min(1, 'Metrics are required'),
    status: z.string(),
    category: z.string(),
    results: z.string().optional(),
    insights: z.string().optional(),
    decisions: z.string().optional(),
    project_id: z.string(),
    hypothesis_id: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    isGrowthExperiment: z.boolean().optional(),
    originalGrowthExperiment: z.any().optional(),
    originalId: z.string().optional(),
  });

  const getMetricsArray = (metrics: any): string[] => {
    if (!metrics) return [''];
    if (Array.isArray(metrics)) return metrics;
    return [metrics];
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: experiment?.id,
      title: experiment?.title || '',
      hypothesis: experiment?.hypothesis || '',
      method: experiment?.method || '',
      metrics: getMetricsArray(experiment?.metrics),
      status: experiment?.status || 'planned',
      category: experiment?.category || experimentType,
      results: experiment?.results || '',
      insights: experiment?.insights || '',
      decisions: experiment?.decisions || '',
      project_id: projectId,
      hypothesis_id: hypothesisId || experiment?.hypothesis_id || null,
      created_at: experiment?.created_at,
      updated_at: experiment?.updated_at,
      isGrowthExperiment: isGrowthExperiment,
      originalGrowthExperiment: experiment?.originalGrowthExperiment,
      originalId: experiment?.originalId,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      console.log("Form submitted with data:", data);
      
      const sanitizedHypothesisId = 
        data.hypothesis_id === "" || data.hypothesis_id === "none" ? null : data.hypothesis_id;
      
      if (isGrowthExperiment) {
        onSave({
          ...data,
          hypothesis_id: sanitizedHypothesisId,
          isGrowthExperiment: true,
          originalGrowthExperiment: experiment?.originalGrowthExperiment
        });
        onClose();
        return;
      }
      
      if (isEditing && experiment) {
        const dbData = adaptExperimentForDb({
          ...data,
          hypothesis_id: sanitizedHypothesisId,
          updated_at: new Date().toISOString()
        });
        
        const { isGrowthExperiment, originalGrowthExperiment, originalId, ...dbReadyData } = dbData as any;
        
        const { error } = await supabase
          .from('experiments')
          .update(dbReadyData)
          .eq('id', experiment.id);
          
        if (error) throw error;
        
        toast({
          title: 'Experiment updated',
          description: 'The experiment has been successfully updated.',
        });
      } else {
        const dbData = adaptExperimentForDb({
          ...data,
          hypothesis_id: sanitizedHypothesisId,
          project_id: projectId,
        });
        
        const { isGrowthExperiment, originalGrowthExperiment, originalId, ...dbReadyData } = dbData as any;
        
        const { error } = await supabase
          .from('experiments')
          .insert(dbReadyData);
          
        if (error) throw error;
        
        toast({
          title: 'Experiment created',
          description: 'The experiment has been successfully created.',
        });
      }
      
      onSave(data);
      onClose();
    } catch (error: any) {
      console.error('Error saving experiment:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the experiment.',
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
