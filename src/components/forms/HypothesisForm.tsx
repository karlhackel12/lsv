
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Hypothesis } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type FormData = Omit<Hypothesis, 'id' | 'created_at' | 'updated_at' | 'project_id'>;

interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  hypothesis?: Hypothesis;
  projectId: string;
}

const HypothesisForm = ({ isOpen, onClose, onSave, hypothesis, projectId }: HypothesisFormProps) => {
  const { toast } = useToast();
  const isEditing = !!hypothesis;

  const form = useForm<FormData>({
    defaultValues: hypothesis ? {
      category: hypothesis.category,
      statement: hypothesis.statement,
      experiment: hypothesis.experiment,
      criteria: hypothesis.criteria,
      status: hypothesis.status,
      result: hypothesis.result || null,
      evidence: hypothesis.evidence || null,
    } : {
      category: 'value',
      statement: '',
      experiment: '',
      criteria: '',
      status: 'not-started',
      result: null,
      evidence: null,
    }
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && hypothesis) {
        // Update existing hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', hypothesis.id);

        if (error) throw error;
        toast({
          title: 'Hypothesis updated',
          description: 'The hypothesis has been successfully updated.',
        });
      } else {
        // Create new hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .insert({
            ...data,
            project_id: projectId,
          });

        if (error) throw error;
        toast({
          title: 'Hypothesis created',
          description: 'A new hypothesis has been created successfully.',
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

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hypothesis' : 'Create New Hypothesis'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="value">Value Hypothesis</SelectItem>
                      <SelectItem value="growth">Growth Hypothesis</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="statement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hypothesis Statement</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter hypothesis statement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="experiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Experiment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How will you test this hypothesis?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What defines success for this hypothesis?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="validating">Validating</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(form.watch('status') === 'validated' || form.watch('status') === 'invalid') && (
              <>
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What were the results?"
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What evidence supports the results?"
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HypothesisForm;
