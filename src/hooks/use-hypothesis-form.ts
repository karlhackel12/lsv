
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Hypothesis } from '@/types/database';

interface UseHypothesisFormProps {
  hypothesis: Hypothesis | null | undefined;
  projectId: string;
  onSave: (hypothesis: Hypothesis) => void;
  onClose: () => void;
  phaseType?: 'problem' | 'solution';
}

export function useHypothesisForm({
  hypothesis,
  projectId,
  onSave,
  onClose,
  phaseType = 'problem'
}: UseHypothesisFormProps) {
  const { toast } = useToast();
  const isEditing = !!hypothesis;
  
  // Enhanced validation schema
  const formSchema = z.object({
    id: z.string().optional(),
    statement: z.string().min(1, 'Statement is required'),
    category: z.string(),
    status: z.string(),
    criteria: z.string().min(1, 'Success criteria is required'),
    experiment: z.string().min(1, 'Experiment design is required'),
    evidence: z.string().optional(),
    result: z.string().optional(),
    phase: z.enum(['problem', 'solution']),
    project_id: z.string(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: hypothesis?.id,
      statement: hypothesis?.statement || '',
      category: hypothesis?.category || 'customer',
      status: hypothesis?.status || 'not-started',
      criteria: hypothesis?.criteria || '',
      experiment: hypothesis?.experiment || '',
      evidence: hypothesis?.evidence || '',
      result: hypothesis?.result || '',
      phase: hypothesis?.phase || phaseType,
      project_id: projectId,
      created_at: hypothesis?.created_at,
      updated_at: hypothesis?.updated_at,
    },
  });

  // When the form opens, ensure it gets reset with the correct data
  React.useEffect(() => {
    if (hypothesis) {
      console.log("Resetting hypothesis form with data:", hypothesis);
      // Force a reset to ensure all fields are correctly populated
      setTimeout(() => {
        form.reset({
          id: hypothesis.id,
          statement: hypothesis.statement || '',
          category: hypothesis.category || 'customer',
          status: hypothesis.status || 'not-started',
          criteria: hypothesis.criteria || '',
          experiment: hypothesis.experiment || '',
          evidence: hypothesis.evidence || '',
          result: hypothesis.result || '',
          phase: hypothesis.phase || phaseType,
          project_id: projectId,
          created_at: hypothesis.created_at,
          updated_at: hypothesis.updated_at,
        });
      }, 0);
    } else {
      form.reset({
        statement: '',
        category: 'customer',
        status: 'not-started',
        criteria: '',
        experiment: '',
        evidence: '',
        result: '',
        phase: phaseType,
        project_id: projectId,
      });
    }
  }, [hypothesis, form, phaseType, projectId]);

  const handleSubmit = async (data: any) => {
    try {
      console.log("Form submitted with data:", data);
      
      if (isEditing) {
        const { error } = await supabase
          .from('hypotheses')
          .update({
            statement: data.statement,
            category: data.category,
            status: data.status,
            criteria: data.criteria,
            experiment: data.experiment,
            evidence: data.evidence || null,
            result: data.result || null,
            phase: data.phase,
            updated_at: new Date().toISOString()
          })
          .eq('id', hypothesis!.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Hypothesis updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('hypotheses')
          .insert({
            statement: data.statement,
            category: data.category,
            status: data.status,
            criteria: data.criteria,
            experiment: data.experiment,
            project_id: projectId,
            phase: data.phase,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'New hypothesis created successfully',
        });
      }
      
      onSave(data);
      onClose();
    } catch (error: any) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save hypothesis',
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
