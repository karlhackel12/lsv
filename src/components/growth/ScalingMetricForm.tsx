
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SCALING_METRIC_CATEGORIES, ScalingReadinessMetric } from '@/types/database';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  current_value: z.number().min(0, "Current value must be a positive number"),
  target_value: z.number().min(0, "Target value must be a positive number"),
  unit: z.string().min(1, "Please select a unit"),
  status: z.string().min(1, "Please select a status"),
  importance: z.number().min(1).max(10, "Importance must be between 1 and 10"),
  notes: z.string().optional(),
});

interface ScalingMetricFormProps {
  projectId: string;
  metric?: ScalingReadinessMetric | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const ScalingMetricForm: React.FC<ScalingMetricFormProps> = ({ 
  projectId,
  metric,
  onSave,
  onClose
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!metric;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: metric?.name || "",
      description: metric?.description || "",
      category: metric?.category || "product_market_fit",
      current_value: metric?.current_value || 0,
      target_value: metric?.target_value || 0,
      unit: metric?.unit || "number",
      status: metric?.status || "pending",
      importance: metric?.importance || 3,
      notes: metric?.notes || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && metric) {
        // Update existing metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .update({
            name: values.name,
            description: values.description,
            category: values.category,
            current_value: values.current_value,
            target_value: values.target_value,
            unit: values.unit,
            status: values.status,
            importance: values.importance,
            notes: values.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', metric.id);
        
        if (error) throw error;
        
        toast({
          title: 'Metric updated',
          description: 'The scaling readiness metric has been updated',
        });
      } else {
        // Create new metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .insert({
            project_id: projectId,
            name: values.name,
            description: values.description,
            category: values.category,
            current_value: values.current_value,
            target_value: values.target_value,
            unit: values.unit,
            status: values.status,
            importance: values.importance,
            notes: values.notes
          });
        
        if (error) throw error;
        
        toast({
          title: 'Metric created',
          description: 'The scaling readiness metric has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the metric',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Scaling Metric' : 'Add Scaling Metric'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Customer Acquisition Cost" {...field} />
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
                      placeholder="Explain what this metric measures and why it's important..." 
                      className="min-h-[80px]"
                      {...field} 
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
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  <FormLabel>Importance (1-10)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
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
                    How important is this metric for scaling? Higher values indicate greater importance.
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
                      placeholder="Additional notes about this metric" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Metric' : 'Create Metric'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ScalingMetricForm;
