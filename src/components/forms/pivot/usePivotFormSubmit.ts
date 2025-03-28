
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ExtendedPivotOption } from './types';

interface UsePivotFormSubmitProps {
  pivotOption?: ExtendedPivotOption;
  onSave: () => void;
  onClose: () => void;
}

export const usePivotFormSubmit = ({ pivotOption, onSave, onClose }: UsePivotFormSubmitProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: ExtendedPivotOption, e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim() || !formData.description.trim() || !formData.trigger.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (pivotOption) {
        // Update existing pivot option
        const updates = {
          type: formData.type,
          description: formData.description,
          trigger: formData.trigger,
          likelihood: formData.likelihood,
          evidence: formData.evidence,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('pivot_options')
          .update(updates)
          .eq('id', pivotOption.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option "${formData.type}" has been updated.`,
        });
      } else {
        // Create new pivot option
        const newPivotOption = {
          type: formData.type,
          description: formData.description,
          trigger: formData.trigger,
          likelihood: formData.likelihood,
          evidence: formData.evidence,
          project_id: formData.project_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('pivot_options')
          .insert(newPivotOption)
          .select();

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option "${formData.type}" has been created.`,
        });
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving pivot option:', err);
      setError('Failed to save pivot option. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSubmit, isSaving, error };
};
