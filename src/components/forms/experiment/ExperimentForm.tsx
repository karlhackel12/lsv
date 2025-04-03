
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusRadioGroup from './StatusRadioGroup';
import CategorySelect from './CategorySelect';
import TextFieldGroup from './TextFieldGroup';
import HypothesisSelect from './HypothesisSelect';
import ResultsFields from './ResultsFields';
import InfoTooltip from '@/components/InfoTooltip';

const experimentSchema = z.object({
  title: z.string().min(5, {
    message: 'Title must be at least 5 characters.',
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  method: z.string().min(5, {
    message: 'Method must be at least 5 characters.',
  }),
  hypothesis: z.string().min(10, {
    message: 'Hypothesis must be at least 10 characters.',
  }),
  status: z.enum(['planned', 'in-progress', 'completed']),
  results: z.string().optional(),
  metrics: z.array(z.string()).optional(),
  learnings: z.string().optional(),
  decisions: z.string().optional(),
  insights: z.string().optional(),
  hypothesis_id: z.string().uuid().optional().nullable(),
});

type ExperimentFormValues = z.infer<typeof experimentSchema>;

interface ExperimentFormProps {
  onSubmit?: (data: ExperimentFormValues) => void;
  onCancel?: () => void;
  prefillData?: Partial<ExperimentFormValues>;
  isSubmitting?: boolean;
}

export default function ExperimentForm({
  onSubmit,
  onCancel,
  prefillData,
  isSubmitting = false,
}: ExperimentFormProps) {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have prefill data from location state (for recommendations)
  const locationPrefill = location.state?.prefillData;
  const combinedPrefill = { ...prefillData, ...locationPrefill };
  
  const form = useForm<ExperimentFormValues>({
    resolver: zodResolver(experimentSchema),
    defaultValues: {
      title: combinedPrefill?.title || '',
      description: combinedPrefill?.description || '',
      category: combinedPrefill?.category || 'problem',
      method: combinedPrefill?.method || '',
      hypothesis: combinedPrefill?.hypothesis || '',
      status: combinedPrefill?.status || 'planned',
      results: combinedPrefill?.results || '',
      metrics: combinedPrefill?.metrics || [],
      learnings: combinedPrefill?.learnings || '',
      decisions: combinedPrefill?.decisions || '',
      insights: combinedPrefill?.insights || '',
      hypothesis_id: combinedPrefill?.hypothesis_id || null,
    },
  });

  const handleSubmit = async (values: ExperimentFormValues) => {
    if (!currentProject) {
      toast({
        title: 'Error',
        description: 'No project selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create experiment in Supabase
      const { data, error } = await supabase
        .from('experiments')
        .insert([
          {
            title: values.title,
            description: values.description,
            category: values.category,
            method: values.method,
            hypothesis: values.hypothesis,
            status: values.status,
            results: values.results,
            metrics: values.metrics || [],
            learnings: values.learnings,
            decisions: values.decisions,
            insights: values.insights,
            project_id: currentProject.id,
            hypothesis_id: values.hypothesis_id,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Experiment created successfully',
      });

      if (onSubmit) {
        onSubmit(values);
      } else {
        navigate('/experiments');
      }
    } catch (error) {
      console.error('Error creating experiment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create experiment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title
                <InfoTooltip 
                  content="A clear, specific title that describes what you're testing" 
                  className="ml-2"
                />
              </FormLabel>
              <FormControl>
                <Input placeholder="E.g., User Interview with 5 potential customers" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description
                <InfoTooltip 
                  content="Provide more context about the experiment and what you hope to learn" 
                  className="ml-2"
                />
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description of the experiment..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategorySelect control={form.control} />

          <HypothesisSelect 
            control={form.control} 
            projectId={currentProject?.id} 
            setValue={form.setValue}
          />
        </div>

        <TextFieldGroup control={form.control} />

        <div className="mt-6">
          <StatusRadioGroup control={form.control} />
        </div>

        {form.watch('status') === 'completed' && (
          <ResultsFields control={form.control} />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate('/experiments'))}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Experiment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
