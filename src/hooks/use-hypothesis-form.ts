
import { useForm } from 'react-hook-form';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useHypothesisForm = (
  hypothesis: Hypothesis | undefined, 
  onSave: (data: Hypothesis) => Promise<void>, 
  onClose: () => void
) => {
  const { toast } = useToast();
  const isEditing = !!hypothesis;

  const form = useForm<Hypothesis>({
    defaultValues: hypothesis || {
      statement: '',
      category: 'value',
      criteria: '',
      experiment: '',
      status: 'not-started',
      evidence: '',
      result: '',
    },
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
    form.setValue('statement', template);
    // Trigger validation after setting the value
    form.trigger('statement');
  };

  const getHypothesisTemplates = () => {
    const category = form.watch('category');
    return category === 'value' 
      ? TEMPLATE_VALUE_HYPOTHESES 
      : TEMPLATE_GROWTH_HYPOTHESES;
  };

  return {
    form,
    isEditing,
    handleSubmit,
    applyHypothesisTemplate,
    getHypothesisTemplates
  };
};

// Import the templates here to avoid circular dependencies
import { 
  TEMPLATE_VALUE_HYPOTHESES, 
  TEMPLATE_GROWTH_HYPOTHESES 
} from '@/types/pivot';
