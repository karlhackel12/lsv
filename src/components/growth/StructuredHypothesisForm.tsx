import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GrowthModel, GrowthMetric, GrowthHypothesis } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormSheet } from '@/components/ui/form-sheet';

const formSchema = z.object({
  action: z.string().min(10, 'Action must be at least 10 characters'),
  outcome: z.string().min(10, 'Outcome must be at least 10 characters'),
  success_criteria: z.string().optional(),
  stage: z.string().min(1, 'Stage is required'),
  metric_id: z.string().optional(),
});

export interface StructuredHypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  hypothesis: GrowthHypothesis | null;
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
}

const StructuredHypothesisForm: React.FC<StructuredHypothesisFormProps> = ({
  isOpen,
  onClose,
  onSave,
  hypothesis,
  growthModel,
  projectId,
  metrics,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: hypothesis?.action || '',
      outcome: hypothesis?.outcome || '',
      success_criteria: hypothesis?.success_criteria || '',
      stage: hypothesis?.stage || 'channel',
      metric_id: hypothesis?.metric_id || '',
    },
  });

  useEffect(() => {
    if (isOpen && hypothesis) {
      console.log("Loading hypothesis data into form:", hypothesis);
      
      setTimeout(() => {
        form.reset({
          action: hypothesis.action || '',
          outcome: hypothesis.outcome || '',
          success_criteria: hypothesis.success_criteria || '',
          stage: hypothesis.stage || 'channel',
          metric_id: hypothesis.metric_id || '',
        });
      }, 0);
    }
  }, [isOpen, hypothesis, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        action: values.action,
        outcome: values.outcome,
        success_criteria: values.success_criteria || '',
        stage: values.stage,
        metric_id: values.metric_id || null,
        growth_model_id: growthModel.id,
        project_id: projectId,
      };

      if (hypothesis) {
        const { error } = await supabase
          .from('growth_hypotheses')
          .update(formData)
          .eq('id', hypothesis.id);

        if (error) throw error;

        toast({
          title: 'Hypothesis updated',
          description: 'Your growth hypothesis has been updated',
        });
      } else {
        const { error } = await supabase
          .from('growth_hypotheses')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Hypothesis created',
          description: 'Your growth hypothesis has been created',
        });
      }

      form.reset();
      await onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save hypothesis',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageOptions = [
    { id: 'channel', name: 'Channel Validation' },
    { id: 'activation', name: 'Activation Optimization' },
    { id: 'monetization', name: 'Monetization Testing' },
    { id: 'retention', name: 'Retention Engineering' },
    { id: 'referral', name: 'Referral Engine' },
    { id: 'scaling', name: 'Scaling Readiness' },
  ];

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={hypothesis ? 'Edit Growth Hypothesis' : 'Create Growth Hypothesis'}
      description="Structure your growth hypothesis to make it testable"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectValue placeholder="Select a growth stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stageOptions.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
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
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>We believe that</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., implementing a referral program with cash incentives"
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
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Will result in</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., a 30% increase in user acquisition from word-of-mouth channels"
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
            name="success_criteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>We'll know we're right when</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., we see the customer acquisition cost drop by at least 15% within 30 days"
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
            name="metric_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Growth Metric</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a growth metric" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {metrics.map((metric) => (
                      <SelectItem key={metric.id} value={metric.id || ''}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : hypothesis
                ? 'Update Hypothesis'
                : 'Create Hypothesis'}
            </Button>
          </div>
        </form>
      </Form>
    </FormSheet>
  );
};

export default StructuredHypothesisForm;
