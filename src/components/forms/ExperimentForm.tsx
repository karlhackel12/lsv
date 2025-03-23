
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { FlaskConical } from 'lucide-react';
import { Experiment } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type FormData = Omit<Experiment, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'typeform_id' | 'typeform_url' | 'typeform_workspace_id' | 'typeform_responses_count' | 'originalId'>;

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  experiment?: Experiment | null;
  projectId: string;
  hypothesisId?: string;
}

const EXPERIMENT_CATEGORIES = [
  { value: 'problem', label: 'Problem' },
  { value: 'solution', label: 'Solution' },
  { value: 'business-model', label: 'Business Model' },
  { value: 'growth', label: 'Growth' },
  { value: 'other', label: 'Other' }
];

const ExperimentForm = ({ isOpen, onClose, onSave, experiment, projectId, hypothesisId }: ExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const form = useForm<FormData>({
    defaultValues: experiment ? {
      title: experiment.title,
      hypothesis: experiment.hypothesis,
      method: experiment.method,
      metrics: experiment.metrics,
      category: experiment.category || '',
      results: experiment.results || '',
      decisions: experiment.decisions || '',
      insights: experiment.insights || '',
      status: experiment.status,
    } : {
      title: '',
      hypothesis: '',
      method: '',
      metrics: '',
      category: '',
      results: '',
      decisions: '',
      insights: '',
      status: 'planned',
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
            category: data.category,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
            status: data.status as 'planned' | 'in-progress' | 'completed', 
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.id);

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to update experiment. Please try again.',
            variant: 'destructive',
          });
          return;
        }

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
            category: data.category,
            hypothesis_id: hypothesisId,
            project_id: projectId,
            results: data.results,
            decisions: data.decisions,
            insights: data.insights,
            status: data.status as 'planned' | 'in-progress' | 'completed',
          });

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to create experiment. Please try again.',
            variant: 'destructive',
          });
          return;
        }

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-500" />
            {isEditing ? 'Edit Experiment' : 'Create New Experiment'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="A descriptive title for your experiment" {...field} />
                  </FormControl>
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
                      {EXPERIMENT_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Textarea 
                      placeholder="What are you trying to validate?" 
                      className="min-h-[80px]"
                      {...field} 
                    />
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
                    <Textarea 
                      placeholder="How will you conduct this experiment?" 
                      className="min-h-[80px]"
                      {...field} 
                    />
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
                    <Textarea 
                      placeholder="What data will you collect? How will you measure success?" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="planned" id="planned" />
                        <FormLabel htmlFor="planned" className="font-normal cursor-pointer">
                          Planned
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-progress" id="in-progress" />
                        <FormLabel htmlFor="in-progress" className="font-normal cursor-pointer">
                          In Progress
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="completed" id="completed" />
                        <FormLabel htmlFor="completed" className="font-normal cursor-pointer">
                          Completed
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Results, Decisions and Insights sections - shown only for in-progress or completed experiments */}
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
                          placeholder="What were the outcomes of your experiment?" 
                          className="min-h-[80px]"
                          {...field} 
                        />
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
                        <Textarea 
                          placeholder="What decisions were made based on the results?" 
                          className="min-h-[80px]"
                          {...field} 
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
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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
