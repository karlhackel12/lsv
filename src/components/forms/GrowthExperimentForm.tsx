
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GrowthExperiment, ScalingReadinessMetric } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Update the GrowthExperiment type to include scaling_metric_id
interface ExtendedGrowthExperiment extends GrowthExperiment {
  scaling_metric_id?: string | null;
}

const formSchema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  hypothesis: z.string().min(10, "Hypothesis should be more detailed"),
  status: z.string(),
  notes: z.string().optional(),
  scaling_metric_id: z.string().nullable().optional(),
  expected_lift: z.number().min(0, "Expected lift must be a positive number"),
  actual_lift: z.number().nullable().optional(),
  start_date: z.string(),
  end_date: z.string(),
});

interface GrowthExperimentFormProps {
  experiment?: ExtendedGrowthExperiment | null;
  projectId: string;
  growthModelId: string;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const GrowthExperimentForm: React.FC<GrowthExperimentFormProps> = ({
  experiment,
  projectId,
  growthModelId,
  onSave,
  onClose
}) => {
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!experiment;

  // Get the current date in ISO format for the date inputs
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14); // Default end date 2 weeks in the future
  const defaultEndDate = futureDate.toISOString().split('T')[0];

  const form = useForm<ExtendedGrowthExperiment>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: experiment?.id || '',
      title: experiment?.title || '',
      hypothesis: experiment?.hypothesis || '',
      status: experiment?.status || 'planned',
      notes: experiment?.notes || '',
      project_id: projectId,
      growth_model_id: growthModelId,
      scaling_metric_id: experiment?.scaling_metric_id || null,
      // Add required fields with proper defaults
      start_date: experiment?.start_date ? new Date(experiment.start_date).toISOString() : new Date().toISOString(),
      end_date: experiment?.end_date ? new Date(experiment.end_date).toISOString() : futureDate.toISOString(),
      expected_lift: experiment?.expected_lift ?? 0, // Default to 0 if null
      actual_lift: experiment?.actual_lift || null,
      metric_id: experiment?.metric_id || null,
    }
  });

  useEffect(() => {
    fetchScalingMetrics();
  }, [projectId]);

  const fetchScalingMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      setScalingMetrics(data as ScalingReadinessMetric[]);
    } catch (err) {
      console.error('Error fetching scaling metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ExtendedGrowthExperiment) => {
    try {
      // Ensure expected_lift is a number and not null
      const expectedLift = Number(data.expected_lift) || 0;
      
      // Format the dates properly
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (isEditing && experiment) {
        // Update experiment
        const { error } = await supabase
          .from('growth_experiments')
          .update({
            title: data.title,
            hypothesis: data.hypothesis,
            status: data.status,
            notes: data.notes,
            scaling_metric_id: data.scaling_metric_id,
            // Include additional required fields
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            expected_lift: expectedLift,
            actual_lift: data.actual_lift !== null ? Number(data.actual_lift) : null,
            metric_id: data.metric_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', experiment.id);
          
        if (error) throw error;
        
        toast({
          title: 'Experiment updated',
          description: 'Growth experiment has been updated'
        });
      } else {
        // Create experiment
        const { error } = await supabase
          .from('growth_experiments')
          .insert({
            title: data.title,
            hypothesis: data.hypothesis,
            status: data.status,
            notes: data.notes,
            growth_model_id: growthModelId,
            project_id: projectId,
            scaling_metric_id: data.scaling_metric_id,
            // Include additional required fields
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            expected_lift: expectedLift,
            metric_id: data.metric_id
          });
          
        if (error) throw error;
        
        toast({
          title: 'Experiment created',
          description: 'Growth experiment has been created'
        });
      }
      
      // Create or update entity dependency if scaling metric is selected
      if (data.scaling_metric_id) {
        await supabase
          .from('entity_dependencies')
          .upsert({
            project_id: projectId,
            source_type: 'growth_experiment',
            source_id: experiment?.id || '', // For new experiments, this won't have an ID yet
            target_type: 'scaling_readiness_metric',
            target_id: data.scaling_metric_id,
            relationship_type: 'validates',
            strength: 2.0,
          }, {
            onConflict: 'source_id, target_id, relationship_type'
          });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving experiment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save experiment',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiment Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Multi-channel acquisition test" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="running">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expected_lift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Lift (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        value={field.value?.toString() || '0'} 
                        placeholder="e.g., 10" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hypothesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hypothesis</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="What do you expect to happen?" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : today}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date.toISOString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : defaultEndDate}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date.toISOString());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional notes about this experiment" 
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scaling_metric_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Scaling Metric</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    value={field.value || "none"}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a scaling metric" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {scalingMetrics.map(metric => (
                        <SelectItem key={metric.id} value={metric.id}>
                          {metric.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('status') === 'completed' && (
              <FormField
                control={form.control}
                name="actual_lift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Lift (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        value={field.value?.toString() || ''} 
                        placeholder="e.g., 5.2" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Experiment' : 'Create Experiment'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GrowthExperimentForm;
