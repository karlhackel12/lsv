
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Metric } from '@/types/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const formSchema = z.object({
  metric_id: z.string().optional(),
  threshold: z.string().min(1, { message: 'Please specify a threshold value' }),
  trigger_description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  action_plan: z.string().min(10, { message: 'Action plan must be at least 10 characters' }),
  severity: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof formSchema>;

interface PivotTriggerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pivotTrigger?: any;
  projectId: string;
  metrics: Metric[];
}

const PivotTriggerForm = ({ isOpen, onClose, onSave, pivotTrigger, projectId, metrics }: PivotTriggerFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metric_id: '',
      threshold: '',
      trigger_description: '',
      action_plan: '',
      severity: 'medium',
    },
  });

  useEffect(() => {
    if (pivotTrigger) {
      form.reset({
        metric_id: pivotTrigger.metric_id || '',
        threshold: pivotTrigger.threshold || '',
        trigger_description: pivotTrigger.trigger_description || '',
        action_plan: pivotTrigger.action_plan || '',
        severity: pivotTrigger.severity || 'medium',
      });
    } else {
      form.reset({
        metric_id: '',
        threshold: '',
        trigger_description: '',
        action_plan: '',
        severity: 'medium',
      });
    }
  }, [pivotTrigger, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      
      if (pivotTrigger) {
        // Update existing trigger
        const { error } = await supabase
          .from('pivot_metric_triggers')
          .update({
            metric_id: values.metric_id === 'none' ? null : values.metric_id,
            threshold_type: values.threshold,
            updated_at: now
          })
          .eq('id', pivotTrigger.id);
          
        if (error) throw error;
        
        toast({
          title: 'Trigger updated',
          description: 'The pivot trigger has been updated successfully.',
        });
      } else {
        // Create new trigger
        const { error } = await supabase
          .from('pivot_metric_triggers')
          .insert({
            metric_id: values.metric_id === 'none' ? null : values.metric_id,
            pivot_option_id: pivotTrigger?.pivot_option_id,
            threshold_type: values.threshold,
            created_at: now,
            updated_at: now
          });
          
        if (error) throw error;
        
        toast({
          title: 'Trigger created',
          description: 'The pivot trigger has been created successfully.',
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <DialogTitle className="text-xl font-bold">
            {pivotTrigger ? 'Edit Pivot Trigger' : 'Add Pivot Trigger'} 
          </DialogTitle>
          <DialogDescription className="text-sm opacity-90 mt-1 text-white">
            Define specific conditions that would trigger consideration of this pivot option
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="conditions" className="w-full">
              <div className="px-6">
                <TabsList className="w-full mt-4 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="conditions" className="flex-1">Trigger Conditions</TabsTrigger>
                  <TabsTrigger value="response" className="flex-1">Response Plan</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <TabsContent value="conditions" className="space-y-6 mt-0">
                  <FormField
                    control={form.control}
                    name="metric_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Metric</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a metric to monitor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No specific metric</SelectItem>
                            {metrics.map(metric => (
                              <SelectItem key={metric.id} value={metric.id || ''}>
                                {metric.name} ({metric.category})
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
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Threshold Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'CAC exceeds $50' or '< 5% conversion rate'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trigger_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the specific conditions that would trigger a pivot consideration" 
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
                    name="severity"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Severity</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="low" id="r1" />
                              <label htmlFor="r1" className="text-sm font-medium">
                                Low - Consider pivoting
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medium" id="r2" />
                              <label htmlFor="r2" className="text-sm font-medium">
                                Medium - Strongly consider pivoting
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="high" id="r3" />
                              <label htmlFor="r3" className="text-sm font-medium">
                                High - Immediate pivot recommended
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                    <h4 className="font-medium text-red-800 flex items-center mb-1">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      When To Define Trigger Points
                    </h4>
                    <p className="text-sm text-red-700">
                      Set triggers when your metrics indicate your core assumptions may be wrong:
                      <ul className="list-disc pl-5 mt-1">
                        <li>CAC exceeds LTV</li>
                        <li>Retention falls below break-even point</li>
                        <li>Conversion rate doesn't meet minimum viable threshold</li>
                      </ul>
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="response" className="space-y-6 mt-0">
                  <FormField
                    control={form.control}
                    name="action_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action Plan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What specific steps should be taken if this trigger is activated?" 
                            className="min-h-[150px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                    <h4 className="font-medium text-amber-800 flex items-center mb-1">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Pivot Planning Guidance
                    </h4>
                    <p className="text-sm text-amber-700">
                      Your action plan should include:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Who needs to be involved in the decision</li>
                        <li>Data that should be reviewed before deciding</li>
                        <li>Timeline for making the pivot decision</li>
                        <li>Resources needed to implement the pivot</li>
                      </ul>
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : pivotTrigger ? 'Update Trigger' : 'Create Trigger'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PivotTriggerForm;
