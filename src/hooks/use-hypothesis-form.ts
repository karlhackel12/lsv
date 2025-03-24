
import { useForm } from 'react-hook-form';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import {
  TEMPLATE_PROBLEM_HYPOTHESES,
  TEMPLATE_SOLUTION_HYPOTHESES,
  TEMPLATE_PROBLEM_CRITERIA,
  TEMPLATE_SOLUTION_CRITERIA
} from '@/types/pivot';

export const useHypothesisForm = (
  hypothesis: Hypothesis | undefined, 
  onSave: (data: Hypothesis) => Promise<void>, 
  onClose: () => void,
  phaseType: 'problem' | 'solution' = 'problem'
) => {
  const { toast } = useToast();
  const isEditing = !!hypothesis;

  // Create default values object with appropriate typing
  const defaultValues: Partial<Hypothesis> = hypothesis || {
    statement: '',
    category: phaseType === 'problem' ? 'problem' : 'solution',
    criteria: '',
    experiment: '',
    status: 'not-started',
    evidence: '',
    result: '',
    phase: phaseType,
  };

  const form = useForm<Hypothesis>({
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = async (data: Hypothesis) => {
    try {
      // Validation checks
      if (!data.statement.trim()) {
        form.setError('statement', { 
          type: 'required', 
          message: 'Hypothesis statement is required' 
        });
        return;
      }

      if (!data.criteria.trim()) {
        form.setError('criteria', { 
          type: 'required', 
          message: 'Success criteria is required' 
        });
        return;
      }

      // Ensure phase is set
      data.phase = phaseType;
      
      // Ensure we're not sending empty strings for UUID fields
      // This prevents database validation errors when inserting data
      Object.keys(data).forEach(key => {
        const k = key as keyof Hypothesis;
        if (typeof data[k] === 'string' && (data[k] as string) === '') {
          if (key.endsWith('_id')) {
            // @ts-ignore: We know this is safe because we're checking for '_id' suffix
            data[k] = null;
          }
        }
      });

      await onSave(data);
      toast({
        title: isEditing ? 'Hypothesis updated' : 'Hypothesis created',
        description: isEditing 
          ? 'Your hypothesis has been successfully updated' 
          : 'Your new hypothesis has been created',
      });
      onClose();
    } catch (error) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving your hypothesis. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const applyHypothesisTemplate = (template: string) => {
    // Check if this is likely a criteria template
    if (template.includes('%') || template.includes('>')) {
      form.setValue('criteria', template);
      form.trigger('criteria');
    } else {
      form.setValue('statement', template);
      form.trigger('statement');
    }
  };

  const getHypothesisTemplates = () => {
    return phaseType === 'problem'
      ? TEMPLATE_PROBLEM_HYPOTHESES
      : TEMPLATE_SOLUTION_HYPOTHESES;
  };

  const getCriteriaTemplates = () => {
    return phaseType === 'problem'
      ? TEMPLATE_PROBLEM_CRITERIA 
      : TEMPLATE_SOLUTION_CRITERIA;
  };

  return {
    form,
    isEditing,
    handleSubmit,
    applyHypothesisTemplate,
    getHypothesisTemplates,
    getCriteriaTemplates
  };
};
