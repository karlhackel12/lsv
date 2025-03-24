
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  hypothesis: z.string().min(10, "Hypothesis should be more detailed"),
  success_criteria: z.string().min(2, "Success criteria must be defined"),
  status: z.string(),
  stage: z.string(),
  metrics: z.string().optional(),
  results: z.string().optional(),
  scaling_metric_id: z.string().nullable().optional(),
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

  const form = useForm<ExtendedGrowthExperiment>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: experiment?.id || '',
      name: experiment?.name || '',
      hypothesis: experiment?.hypothesis || '',
      success_criteria: experiment?.success_criteria || '',
      status: experiment?.status || 'planned',
      stage: experiment?.stage || 'channel',
      metrics: experiment?.metrics || '',
      results: experiment?.results || '',
      project_id: projectId,
      growth_model_id: growthModelId,
      scaling_metric_id: experiment?.scaling_metric_id || null,
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
      if (isEditing && experiment) {
        // Update experiment
        const { error } = await supabase
          .from('growth_experiments')
          .update({
            name: data.name,
            hypothesis: data.hypothesis,
            success_criteria: data.success_criteria,
            status: data.status,
            stage: data.stage,
            metrics: data.metrics,
            results: data.results,
            scaling_metric_id: data.scaling_metric_id,
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
            name: data.name,
            hypothesis: data.hypothesis,
            success_criteria: data.success_criteria,
            status: data.status,
            stage: data.stage,
            metrics: data.metrics,
            results: data.results,
            growth_model_id: growthModelId,
            project_id: projectId,
            scaling_metric_id: data.scaling_metric_id
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
              name="name"
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
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Growth Stage</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="channel">Acquisition Channel</SelectItem>
                        <SelectItem value="activation">Activation</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="abandoned">Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
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
            
            <FormField
              control={form.control}
              name="success_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="How will you know if the experiment was successful?" 
                      className="min-h-[80px]"
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
                  <FormLabel>Metrics to Track</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="What metrics will you use to measure success?" 
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
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="What were the results of the experiment?" 
                        className="min-h-[100px]"
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
