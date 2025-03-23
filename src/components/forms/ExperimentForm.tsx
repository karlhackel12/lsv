import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription,
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

const experimentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  hypothesis: z.string().min(2, 'Hypothesis must be at least 2 characters'),
  method: z.string().min(2, 'Method must be at least 2 characters'),
  metrics: z.string().min(2, 'Metrics must be at least 2 characters'),
  status: z.string(),
  category: z.string().nullable(),
  results: z.string().optional(),
  decisions: z.string().optional(),
  insights: z.string().optional(),
});

type FormData = z.infer<typeof experimentSchema>;

export interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  experiment?: Experiment;
  projectId: string;
}

const ExperimentForm = ({ isOpen, onClose, onSave, experiment, projectId }: ExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const form = useForm<FormData>({
    resolver: zodResolver(experimentSchema),
    defaultValues: experiment ? {
      title: experiment.title,
      hypothesis: experiment.hypothesis,
      method: experiment.method,
      metrics: experiment.metrics,
      status: experiment.status,
      category: experiment.category || null,
      results: experiment.results || '',
      decisions: experiment.decisions || '',
      insights: experiment.insights || '',
    } : {
      title: '',
      hypothesis: '',
      method: '',
      metrics: '',
      status: 'planned',
      category: null,
      results: '',
      decisions: '',
      insights: '',
    }
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && experiment) {
        // Update existing experiment
        const { error } = await supabase
          .from('experiments')
          .update({
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            status: data.status,
            category: data.category,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.originalId || experiment.id);

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
            title: data.title,
            hypothesis: data.hypothesis,
            method: data.method,
            metrics: data.metrics,
            status: data.status,
            category: data.category,
            project_id: projectId,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
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
                    <Textarea placeholder="Experiment hypothesis" {...field} className="min-h-[80px]" />
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
                    <Textarea placeholder="Experiment method" {...field} className="min-h-[80px]" />
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
                  <FormLabel>Metrics</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Experiment metrics" {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="results"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Results</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Experiment results" {...field} className="min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="decisions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decisions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Experiment decisions" {...field} className="min-h-[80px]" />
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
                    <Textarea placeholder="Experiment insights" {...field} className="min-h-[80px]" />
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

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Experiment category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
