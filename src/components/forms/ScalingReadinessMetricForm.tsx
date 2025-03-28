
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
  FormDescription,
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
import { ScalingReadinessMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormSheet } from '@/components/ui/form-sheet';
import { Slider } from '@/components/ui/slider';
import { predefinedScalingMetrics } from '@/lib/scaling-metrics';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description should be more detailed'),
  category: z.string().min(1, 'Category is required'),
  current_value: z.number().min(0, 'Current value must be a positive number'),
  target_value: z.number().min(0, 'Target value must be a positive number'),
  unit: z.string().min(1, 'Unit is required'),
  status: z.string().min(1, 'Status is required'),
  importance: z.number().min(1).max(5, 'Importance must be between 1 and 5'),
  notes: z.string().optional(),
  predefined_metric: z.string().optional(),
});

interface ScalingReadinessMetricFormProps {
  projectId: string;
  metric?: ScalingReadinessMetric | null;
  onSave: () => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

const ScalingReadinessMetricForm: React.FC<ScalingReadinessMetricFormProps> = ({
  projectId,
  metric,
  onSave,
  onClose,
  isOpen
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: metric?.name || '',
      description: metric?.description || '',
      category: metric?.category || 'product_market_fit',
      current_value: metric?.current_value || 0,
      target_value: metric?.target_value || 0,
      unit: metric?.unit || 'number',
      status: metric?.status || 'pending',
      importance: metric?.importance || 3,
      notes: metric?.notes || '',
      predefined_metric: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        name: values.name,
        description: values.description,
        category: values.category,
        current_value: values.current_value,
        target_value: values.target_value,
        unit: values.unit,
        status: values.status,
        importance: values.importance,
        notes: values.notes || '',
        project_id: projectId,
      };

      if (metric) {
        // Update existing metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .update(formData)
          .eq('id', metric.id);

        if (error) throw error;

        toast({
          title: 'Metric updated',
          description: 'Your scaling readiness metric has been updated',
        });
      } else {
        // Create new metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Metric created',
          description: 'Your scaling readiness metric has been created',
        });
      }

      form.reset();
      await onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving metric:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save metric',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle selecting a predefined metric
  const handlePredefinedMetricChange = (value: string) => {
    if (!value || value === 'none') return;
    
    const selectedMetric = predefinedScalingMetrics.find(metric => 
      `${metric.category}:${metric.name}` === value
    );
    
    if (selectedMetric) {
      form.setValue('name', selectedMetric.name);
      form.setValue('description', selectedMetric.description);
      form.setValue('category', selectedMetric.category);
      form.setValue('unit', selectedMetric.unit);
      form.setValue('importance', selectedMetric.importance);
      form.setValue('target_value', selectedMetric.target_value || 0);
    }
  };

  const categoryOptions = [
    { id: 'product_market_fit', name: 'Product-Market Fit' },
    { id: 'unit_economics', name: 'Unit Economics' },
    { id: 'growth_engine', name: 'Growth Engine' },
    { id: 'team_capacity', name: 'Team Capacity' },
    { id: 'operational_scalability', name: 'Operational Scalability' },
    { id: 'financial_readiness', name: 'Financial Readiness' },
    { id: 'market_opportunity', name: 'Market Opportunity' },
  ];

  const unitOptions = [
    { id: 'number', name: 'Number' },
    { id: 'percentage', name: 'Percentage (%)' },
    { id: 'currency', name: 'Currency ($)' },
    { id: 'ratio', name: 'Ratio (x:1)' },
    { id: 'time', name: 'Time (days)' },
  ];

  const statusOptions = [
    { id: 'pending', name: 'Pending' },
    { id: 'needs-improvement', name: 'Needs Improvement' },
    { id: 'on-track', name: 'On Track' },
    { id: 'achieved', name: 'Achieved' },
    { id: 'critical', name: 'Critical' },
  ];

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={metric ? 'Edit Readiness Metric' : 'Add Readiness Metric'}
      description="Track metrics that indicate your startup's readiness to scale."
      onSubmit={() => form.handleSubmit(onSubmit)()}
      submitLabel={metric ? 'Update Metric' : 'Create Metric'}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="predefined_metric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose a Predefined Metric (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handlePredefinedMetricChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a predefined metric or create your own" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Custom Metric</SelectItem>
                    {predefinedScalingMetrics.map((metric) => (
                      <SelectItem 
                        key={`${metric.category}:${metric.name}`} 
                        value={`${metric.category}:${metric.name}`}
                      >
                        {`${metric.name} (${getCategoryName(metric.category)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a predefined metric or create your own custom metric
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metric Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Customer Acquisition Cost" />
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
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe what this metric measures and why it's important for scaling" 
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="current_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
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
            name="importance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importance (1-5)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  How important is this metric for your scaling readiness?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Additional notes about this metric" 
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormSheet>
  );
};

// Helper function to get category name from ID
function getCategoryName(categoryId: string): string {
  const categories: Record<string, string> = {
    'product_market_fit': 'Product-Market Fit',
    'unit_economics': 'Unit Economics',
    'growth_engine': 'Growth Engine',
    'team_capacity': 'Team Capacity',
    'operational_scalability': 'Operational Scalability',
    'financial_readiness': 'Financial Readiness',
    'market_opportunity': 'Market Opportunity'
  };
  
  return categories[categoryId] || categoryId;
}

export default ScalingReadinessMetricForm;
