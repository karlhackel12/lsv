
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';

interface ExperimentLogFormProps {
  experimentId: string;
  onSuccess: () => void;
}

const logSchema = z.object({
  type: z.enum(['note', 'result', 'insight']),
  content: z.string().min(3, 'Content is required'),
  metrics: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

const ExperimentLogForm = ({ experimentId, onSuccess }: ExperimentLogFormProps) => {
  const { toast } = useToast();
  const { currentProject } = useProject();
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      type: 'note',
      content: '',
      metrics: '',
    },
  });
  
  const onSubmit = async (values: LogFormValues) => {
    try {
      if (!currentProject) {
        throw new Error('No project selected');
      }
      
      const newLog = {
        experiment_id: experimentId,
        type: values.type,
        content: values.content,
        metrics: values.metrics || null,
        project_id: currentProject.id,
        created_by_name: 'Team member',
      };
      
      const { error } = await supabase
        .from('experiment_logs')
        .insert(newLog)
        .select('experiment_logs.id')
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Log entry added successfully',
      });
      
      form.reset({
        type: 'note',
        content: '',
        metrics: '',
      });
      
      onSuccess();
    } catch (err) {
      console.error('Error saving log entry:', err);
      toast({
        title: 'Error',
        description: 'Failed to save log entry',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">Add Experiment Journal Entry</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Entry Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="note" id="note" />
                      <Label htmlFor="note">Note</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="result" id="result" />
                      <Label htmlFor="result">Result</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="insight" id="insight" />
                      <Label htmlFor="insight">Insight</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What happened in your experiment? Record results, insights, or notes..."
                    className="min-h-[100px]"
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
                <FormLabel>Metrics (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Record any metrics or measurements from this experiment..."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit">
              Add Entry
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default ExperimentLogForm;
