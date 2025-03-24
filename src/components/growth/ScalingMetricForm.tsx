
import React from 'react';
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
  const isEditMode = !!metric;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: metric?.name || "",
      description: metric?.description || "",
      category: metric?.category || "",
      current_value: metric?.current_value || 0,
      target_value: metric?.target_value || 0,
      unit: metric?.unit || "",
      status: metric?.status || "pending",
      importance: metric?.importance || 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
            importance: values.importance
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
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Scaling Metric' : 'Add Scaling Metric'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {Object.entries(SCALING_METRIC_CATEGORIES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain what this metric measures and why it's important..." 
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
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="currency">Currency ($)</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="ratio">Ratio (x:1)</SelectItem>
                        <SelectItem value="time">Time (days)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        <SelectItem value="achieved">Achieved</SelectItem>
                        <SelectItem value="on-track">On Track</SelectItem>
                        <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Higher values indicate greater importance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update Metric' : 'Create Metric'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ScalingMetricForm;
