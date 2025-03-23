
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FlaskConical } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useExperimentForm } from '@/hooks/use-experiment-form';
import CategorySelect from './experiment/CategorySelect';
import StatusRadioGroup from './experiment/StatusRadioGroup';
import TextFieldGroup from './experiment/TextFieldGroup';
import ResultsFields from './experiment/ResultsFields';
import { supabase } from '@/integrations/supabase/client';

export type FormData = Omit<Experiment, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'typeform_id' | 'typeform_url' | 'typeform_workspace_id' | 'typeform_responses_count' | 'originalId'>;

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  experiment?: Experiment | null;
  projectId: string;
  hypothesisId?: string;
  experimentType?: 'problem' | 'solution' | 'business-model'; // Add experimentType prop
}

const ExperimentForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  experiment, 
  projectId, 
  hypothesisId,
  experimentType = 'problem' // Set default value
}: ExperimentFormProps) => {
  const { form, isEditing, handleSubmit } = useExperimentForm({
    experiment,
    projectId,
    hypothesisId,
    onSave,
    onClose,
    experimentType // Pass to the hook
  });

  // If we have a hypothesis ID but no experiment, let's fetch the hypothesis details
  // to pre-populate the form
  useEffect(() => {
    const fetchHypothesis = async () => {
      if (!hypothesisId || experiment) return;
      
      try {
        const { data, error } = await supabase
          .from('hypotheses')
          .select('*')
          .eq('id', hypothesisId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Pre-populate the form with hypothesis data
          form.setValue('hypothesis', data.statement);
          form.setValue('title', `Experiment: ${data.statement.substring(0, 50)}${data.statement.length > 50 ? '...' : ''}`);
          if (data.criteria) {
            form.setValue('metrics', data.criteria);
          }
          if (data.experiment) {
            form.setValue('method', data.experiment);
          }
        }
      } catch (err) {
        console.error('Error fetching hypothesis:', err);
      }
    };
    
    fetchHypothesis();
  }, [hypothesisId, form, experiment]);

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-500" />
            {isEditing ? 'Edit Experiment' : hypothesisId ? 'Create Experiment from Hypothesis' : 'Create New Experiment'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <TextFieldGroup form={form} />
            <CategorySelect form={form} />
            <StatusRadioGroup form={form} />
            
            {/* Results, Decisions and Insights sections - shown only for in-progress or completed experiments */}
            {(form.watch('status') === 'in-progress' || form.watch('status') === 'completed') && (
              <ResultsFields form={form} />
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExperimentForm;
