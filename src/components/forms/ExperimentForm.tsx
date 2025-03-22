
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
import { Experiment } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type FormData = Omit<Experiment, 'id' | 'created_at' | 'updated_at' | 'project_id'>;

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  experiment?: Experiment;
  projectId: string;
}

const ExperimentForm = ({ isOpen, onClose, onSave, experiment, projectId }: ExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const form = useForm<FormData>({
    defaultValues: experiment ? {
      title: experiment.title,
      hypothesis: experiment.hypothesis,
      status: experiment.status,
      method: experiment.method,
      metrics: experiment.metrics,
      results: experiment.results,
      insights: experiment.insights,
      decisions: experiment.decisions,
    } : {
      title: '',
      hypothesis: '',
      status: 'planned',
      method: '',
      metrics: '',
      results: null,
      insights: null,
      decisions: null,
    }
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && experiment) {
        // Update existing experiment
        const { error } = await supabase
          .from('experiments')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.id);

        if (error) throw error;
        toast({
          title: 'Experiment updated',
          description: 'The experiment has been successfully updated.',
        });
      } else {
        // Create new experiment
        const { error } = await supabase
          .from('experiments')
          .insert({
            ...data,
            project_id: projectId,
          });

        if (error) throw error;
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

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Experiment' : 'Create New Experiment'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Experiment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hypothesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hypothesis</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What hypothesis is being tested?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How will you conduct this experiment?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="metrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Metrics</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Which metrics will you track?" {...field} />
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
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(form.watch('status') === 'in-progress' || form.watch('status') === 'completed') && (
              <>
                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What were the experiment results?"
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
                  name="insights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insights</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What insights did you gain?"
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
            
            {form.watch('status') === 'completed' && (
              <FormField
                control={form.control}
                name="decisions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decisions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What decisions were made based on this experiment?"
                        value={field.value || ''} 
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default ExperimentForm;
