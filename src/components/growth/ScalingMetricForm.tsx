
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScalingReadinessMetric, SCALING_METRIC_CATEGORIES, SCALING_METRIC_UNITS } from '@/types/database';

interface ScalingMetricFormProps {
  projectId: string;
  growthModelId?: string;
  metric?: ScalingReadinessMetric;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const ScalingMetricForm = ({ 
  projectId, 
  growthModelId, 
  metric, 
  onSave, 
  onClose 
}: ScalingMetricFormProps) => {
  const { toast } = useToast();
  const isEditing = !!metric;

  const form = useForm<ScalingReadinessMetric>({
    defaultValues: metric || {
      id: '',
      project_id: projectId,
      growth_model_id: growthModelId || null,
      category: 'unit_economics',
      name: '',
      description: '',
      current_value: 0,
      target_value: 0,
      unit: 'percentage',
      importance: 2,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScalingReadinessMetric,
  });

  const handleSubmit = async (data: ScalingReadinessMetric) => {
    try {
      if (isEditing && metric) {
        // Update existing metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .update({
            category: data.category,
            name: data.name,
            description: data.description,
            current_value: data.current_value,
            target_value: data.target_value,
            unit: data.unit,
            importance: data.importance,
            status: calculateStatus(data.current_value, data.target_value),
            updated_at: new Date().toISOString(),
          })
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
          .insert({
            project_id: projectId,
            growth_model_id: growthModelId || null,
            category: data.category,
            name: data.name,
            description: data.description,
            current_value: data.current_value,
            target_value: data.target_value,
            unit: data.unit,
            importance: data.importance,
            status: calculateStatus(data.current_value, data.target_value)
          });
          
        if (error) throw error;
        
        toast({
          title: 'Metric created',
          description: 'Your new scaling readiness metric has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving scaling metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to save scaling metric. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateStatus = (current: number, target: number): string => {
    const ratio = current / target;
    if (ratio >= 1) return 'achieved';
    if (ratio >= 0.7) return 'on-track';
    if (ratio >= 0.4) return 'needs-improvement';
    return 'critical';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Scaling Metric' : 'Add New Scaling Metric'}</CardTitle>
        <CardDescription>
          Define metrics that measure your startup's readiness to scale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. LTV:CAC Ratio" {...field} />
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
                      placeholder="Brief description of what this metric measures and why it's important for scaling" 
                      className="resize-none min-h-[80px]"
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
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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
                        {SCALING_METRIC_UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
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
              name="importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importance (1-3)</FormLabel>
                  <div className="pt-2">
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={3}
                          step={1}
                          onValueChange={value => field.onChange(value[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4 flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Metric' : 'Add Metric'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ScalingMetricForm;
