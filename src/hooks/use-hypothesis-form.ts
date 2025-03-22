
import { useForm } from 'react-hook-form';
import { Hypothesis } from '@/types/database';

export const useHypothesisForm = (
  hypothesis: Hypothesis | undefined, 
  onSave: (data: Hypothesis) => Promise<void>, 
  onClose: () => void
) => {
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
  });

  const handleSubmit = async (data: Hypothesis) => {
    await onSave(data);
    onClose();
  };

  const applyHypothesisTemplate = (template: string) => {
    form.setValue('statement', template);
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
