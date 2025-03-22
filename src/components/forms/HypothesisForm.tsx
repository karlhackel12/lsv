
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Hypothesis } from '@/types/database';
import { useHypothesisForm } from '@/hooks/use-hypothesis-form';
import CategoryField from './hypothesis/CategoryField';
import HypothesisStatementField from './hypothesis/HypothesisStatementField';
import TextField from './hypothesis/TextField';
import StatusField from './hypothesis/StatusField';

export interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Hypothesis) => Promise<void>;
  hypothesis?: Hypothesis;
  projectId?: string; 
}

const HypothesisForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  hypothesis, 
  projectId 
}: HypothesisFormProps) => {
  const { 
    form, 
    isEditing, 
    handleSubmit, 
    applyHypothesisTemplate, 
    getHypothesisTemplates 
  } = useHypothesisForm(hypothesis, onSave, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hypothesis' : 'Create New Hypothesis'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <CategoryField form={form} />

            <HypothesisStatementField 
              form={form} 
              templates={getHypothesisTemplates()} 
              onApplyTemplate={applyHypothesisTemplate} 
            />

            <TextField 
              form={form} 
              name="criteria" 
              label="Success Criteria" 
              placeholder="What would make this hypothesis true?" 
            />

            <TextField 
              form={form} 
              name="experiment" 
              label="Experiment Plan" 
              placeholder="How will you test this hypothesis?" 
            />

            {isEditing && (
              <>
                <StatusField form={form} />

                <TextField 
                  form={form} 
                  name="evidence" 
                  label="Evidence" 
                  placeholder="What evidence did you collect?" 
                />

                <TextField 
                  form={form} 
                  name="result" 
                  label="Result" 
                  placeholder="What was the outcome of testing this hypothesis?" 
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HypothesisForm;
