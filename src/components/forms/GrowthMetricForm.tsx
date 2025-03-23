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
import { GrowthMetric, GrowthModel, GROWTH_METRIC_TEMPLATES } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface GrowthMetricFormProps {
  growthModel: GrowthModel;
  projectId: string;
  metric?: GrowthMetric | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const GrowthMetricForm = ({ 
  growthModel, 
  projectId, 
  metric, 
  onSave, 
  onClose 
}: GrowthMetricFormProps) => {
  const { toast } = useToast();
  const isEditing = !!metric;

  const form = useForm<GrowthMetric>({
    defaultValues: metric || {
      name: '',
      description: '',
      category: 'acquisition',
      current_value: 0,
      target_value: 0,
      unit: 'count',
      growth_model_id: growthModel.id,
      project_id: projectId,
      status: 'on-track',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthMetric,
  });

  const handleSubmit = async (data: GrowthMetric) => {
    try {
      if (isEditing && metric) {
        const { error } = await supabase
          .from('growth_metrics')
          .update({
            name: data.name,
            description: data.description,
            category: data.category,
            current_value: data.current_value,
            target_value: data.target_value,
            unit: data.unit,
            status: determineStatus(data.current_value, data.target_value),
            updated_at: new Date().toISOString(),
          })
          .eq('id', metric.originalId || metric.id);
          
        if (error) throw error;
        
        toast({
          title: 'Metric updated',
          description: 'Your metric has been successfully updated',
        });
      } else {
        const { error } = await supabase
          .from('growth_metrics')
          .insert({
            name: data.name,
            description: data.description,
            category: data.category,
            current_value: data.current_value,
            target_value: data.target_value,
            unit: data.unit,
            growth_model_id: growthModel.id,
            project_id: projectId,
            status: determineStatus(data.current_value, data.target_value),
          });
          
        if (error) throw error;
        
        toast({
          title: 'Metric created',
          description: 'Your new metric has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to save metric. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const determineStatus = (current: number, target: number): 'on-track' | 'at-risk' | 'off-track' => {
    const progress = (current / target) * 100;
    
    if (progress >= 80) {
      return 'on-track';
    } else if (progress >= 50) {
      return 'at-risk';
    } else {
      return 'off-track';
    }
  };

  const handleTemplateSelect = (template: { name: string; unit: string; description?: string }) => {
    form.setValue('name', template.name);
    form.setValue('unit', template.unit as any);
    if (template.description) {
      form.setValue('description', template.description);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1 mr-2">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="activation">Activation</SelectItem>
                          <SelectItem value="retention">Retention</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-7 whitespace-nowrap">
                      Templates <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                      <h4 className="text-sm font-semibold mb-1">Metric Templates</h4>
                      <p className="text-xs text-gray-500">
                        Choose from common metrics for your selected category
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {GROWTH_METRIC_TEMPLATES && 
                       GROWTH_METRIC_TEMPLATES[form.watch('category') as keyof typeof GROWTH_METRIC_TEMPLATES]?.map((template, index) => (
                        <div 
                          key={index} 
                          className="p-2.5 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <h5 className="text-sm font-medium">{template.name}</h5>
                          <p className="text-xs text-gray-500 mt-1">{template.description || ''}</p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Conversion Rate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="current_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
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
                          step="any"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        <SelectItem value="count">Count (#)</SelectItem>
                        <SelectItem value="currency">Currency ($)</SelectItem>
                        <SelectItem value="ratio">Ratio</SelectItem>
                        <SelectItem value="time">Time (days)</SelectItem>
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
                    <FormLabel className="flex items-center">
                      Description
                      <span className="text-xs text-gray-500 ml-1">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Details about how this metric is calculated..."
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Metric' : 'Add Metric'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GrowthMetricForm;
