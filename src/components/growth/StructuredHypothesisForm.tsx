
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthHypothesis } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface StructuredHypothesisFormProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  onSave: () => Promise<void>;
  onClose: () => void;
  hypothesis?: GrowthHypothesis | null;
}

interface HypothesisFormValues {
  id?: string;
  action: string;
  outcome: string;
  success_criteria: string;
  metric_id: string | null;
  stage: string;
  growth_model_id: string;
  project_id: string;
}

const StructuredHypothesisForm: React.FC<StructuredHypothesisFormProps> = ({ 
  growthModel, 
  projectId, 
  metrics,
  onSave, 
  onClose,
  hypothesis
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!hypothesis;

  const form = useForm<HypothesisFormValues>({
    defaultValues: hypothesis || {
      action: '',
      outcome: '',
      success_criteria: '',
      metric_id: metrics.length > 0 ? metrics[0].id : null,
      stage: 'channel',
      growth_model_id: growthModel.id,
      project_id: projectId,
    },
  });

  const handleSubmit = async (data: HypothesisFormValues) => {
    try {
      console.log('Submitting hypothesis data:', data);
      
      // Validate required fields
      if (!data.action.trim()) {
        form.setError('action', { type: 'required', message: 'Action is required' });
        return;
      }
      
      if (!data.outcome.trim()) {
        form.setError('outcome', { type: 'required', message: 'Outcome is required' });
        return;
      }
      
      // Ensure we're not sending empty strings for UUID fields
      // This prevents database validation errors when inserting data
      const cleanedData = { ...data };
      if (cleanedData.metric_id === '') {
        cleanedData.metric_id = null;
      }
      
      if (isEditing && hypothesis?.id) {
        console.log('Updating hypothesis:', cleanedData);
        const { error } = await supabase
          .from('growth_hypotheses')
          .update({
            action: cleanedData.action,
            outcome: cleanedData.outcome,
            success_criteria: cleanedData.success_criteria,
            metric_id: cleanedData.metric_id,
            stage: cleanedData.stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', hypothesis.id);
          
        if (error) {
          console.error('Error updating hypothesis:', error);
          throw error;
        }
          
        toast({
          title: 'Hypothesis updated',
          description: 'Your growth hypothesis has been updated.',
        });
      } else {
        // First, create the growth hypothesis
        console.log('Creating new hypothesis:', cleanedData);
        const { data: growthHypothesis, error: growthError } = await supabase
          .from('growth_hypotheses')
          .insert({
            action: cleanedData.action,
            outcome: cleanedData.outcome,
            success_criteria: cleanedData.success_criteria || 'We\'ll know we\'re right when we see improvement.',
            metric_id: cleanedData.metric_id,
            stage: cleanedData.stage,
            growth_model_id: growthModel.id,
            project_id: projectId
          })
          .select()
          .single();
          
        if (growthError) {
          console.error('Error creating growth hypothesis:', growthError);
          throw growthError;
        }
        
        console.log('Created growth hypothesis:', growthHypothesis);
        
        // Then, create a corresponding hypothesis in the main hypotheses table for cross-system compatibility
        const { error: hypothesisError } = await supabase
          .from('hypotheses')
          .insert({
            statement: `We believe that ${cleanedData.action} will result in ${cleanedData.outcome}.`,
            category: 'growth',
            criteria: cleanedData.success_criteria || `We'll know we're right when we see improvement.`,
            experiment: 'To be defined',
            status: 'not-started',
            phase: 'solution',
            project_id: projectId
          });
          
        if (hypothesisError) {
          console.error('Error creating corresponding hypothesis:', hypothesisError);
          throw hypothesisError;
        }
        
        toast({
          title: 'Hypothesis created',
          description: 'Your growth hypothesis has been saved.',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error saving hypothesis:", error);
      toast({
        title: 'Error',
        description: 'Failed to save hypothesis. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Navigate to experiments page to create an experiment for this hypothesis
  const handleCreateExperiment = () => {
    if (isEditing && hypothesis?.id) {
      navigate('/experiments', { 
        state: { 
          createExperiment: true, 
          hypothesisId: hypothesis.id,
          hypothesisType: 'growth'
        } 
      });
    } else {
      toast({
        title: 'Save hypothesis first',
        description: 'Please save your hypothesis before creating an experiment.',
      });
    }
  };

  // Generate the formatted hypothesis statement
  const generateFormattedHypothesis = () => {
    const action = form.watch('action');
    const outcome = form.watch('outcome');
    const criteria = form.watch('success_criteria');
    
    if (!action || !outcome) return '';
    
    let formattedStatement = `We believe that ${action} will result in ${outcome}.`;
    if (criteria) {
      formattedStatement += `\nWe'll know we're right when we see ${criteria}.`;
    }
    
    return formattedStatement;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-2">Structured Growth Hypothesis</h2>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <p className="font-medium text-sm text-gray-900 mb-1">Format:</p>
                <p className="text-sm text-gray-700">
                  We believe that [specific action/feature] will result in [specific measurable outcome].<br />
                  We'll know we're right when we see [specific success criteria].
                </p>
              </div>
              
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
                        <SelectItem value="channel">Channel Validation</SelectItem>
                        <SelectItem value="activation">Activation Optimization</SelectItem>
                        <SelectItem value="retention">Retention Improvement</SelectItem>
                        <SelectItem value="revenue">Revenue Optimization</SelectItem>
                        <SelectItem value="referral">Referral Growth</SelectItem>
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
                    <FormLabel>Action or Feature (We believe that...)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g., implementing a personalized onboarding flow" 
                        className="h-20"
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
                    <FormLabel>Expected Outcome (will result in...)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g., a 15% increase in user activation rate" 
                        className="h-20"
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
                    <FormLabel>Success Criteria (We'll know we're right when...)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g., the 7-day activation rate increases from 40% to 55% within 30 days" 
                        className="h-20"
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
                    <FormLabel>Related Metric</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || null)}
                      value={field.value || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {metrics.map((metric) => (
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
              
              {/* Preview hypothesis */}
              {(form.watch('action') && form.watch('outcome')) && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm font-medium text-blue-800 mb-1">Preview:</p>
                  <p className="text-sm text-blue-700 whitespace-pre-line">
                    {generateFormattedHypothesis()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCreateExperiment}
                >
                  Create Experiment
                </Button>
              )}
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'} Hypothesis
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StructuredHypothesisForm;
