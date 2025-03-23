
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
import { GrowthModel, GrowthMetric } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StructuredHypothesisFormProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  onSave: () => Promise<void>;
  onClose: () => void;
  hypothesis?: any | null; // Would be GrowthHypothesis in a full implementation
}

interface HypothesisFormValues {
  id?: string;
  action: string;
  outcome: string;
  success_criteria: string;
  metric_id: string;
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
  const isEditing = !!hypothesis;

  const form = useForm<HypothesisFormValues>({
    defaultValues: hypothesis || {
      action: '',
      outcome: '',
      success_criteria: '',
      metric_id: metrics.length > 0 ? metrics[0].id : '',
      stage: 'channel',
      growth_model_id: growthModel.id,
      project_id: projectId,
    },
  });

  const handleSubmit = async (data: HypothesisFormValues) => {
    try {
      if (isEditing && hypothesis?.id) {
        await supabase
          .from('hypotheses')
          .update({
            action: data.action,
            outcome: data.outcome,
            success_criteria: data.success_criteria,
            metric_id: data.metric_id,
            stage: data.stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', hypothesis.id);
      } else {
        await supabase
          .from('hypotheses')
          .insert({
            statement: `We believe that ${data.action} will result in ${data.outcome}.`,
            category: 'growth',
            criteria: data.success_criteria || `We'll know we're right when we see improvement.`,
            experiment: 'To be defined',
            status: 'not-started',
            phase: 'solution',
            project_id: projectId
          });
      }
      
      toast({
        title: isEditing ? 'Hypothesis updated' : 'Hypothesis created',
        description: 'Your growth hypothesis has been saved.',
      });
      
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
                        <SelectItem value="monetization">Monetization Testing</SelectItem>
                        <SelectItem value="retention">Retention Engineering</SelectItem>
                        <SelectItem value="referral">Referral Engine</SelectItem>
                        <SelectItem value="scaling">Scaling Readiness</SelectItem>
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
                    <FormLabel>Specific Action or Feature</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., implementing a personalized onboarding flow"
                        className="resize-none min-h-[80px]"
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
                    <FormLabel>Expected Outcome</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., increasing user activation rate from 40% to 60%"
                        className="resize-none min-h-[80px]"
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
                    <FormLabel>Success Criteria</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., a 50% increase in daily active users within 30 days"
                        className="resize-none min-h-[80px]"
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
                    <FormLabel>Target Metric</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              {/* Preview the formatted hypothesis */}
              {(form.watch('action') || form.watch('outcome')) && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
                  <p className="font-medium text-sm text-blue-900 mb-1">Formatted Hypothesis:</p>
                  <p className="text-sm whitespace-pre-line text-blue-800">
                    {generateFormattedHypothesis()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Hypothesis' : 'Create Hypothesis'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StructuredHypothesisForm;
