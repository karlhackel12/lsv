
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Metric, MetricThreshold } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';

type FormData = Omit<Metric, 'id' | 'created_at' | 'updated_at' | 'project_id'> & {
  warning_threshold?: string;
  error_threshold?: string;
};

interface MetricFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  metric?: Metric;
  projectId: string;
}

const MetricForm = ({ isOpen, onClose, onSave, metric, projectId }: MetricFormProps) => {
  const { toast } = useToast();
  const isEditing = !!metric;
  const [thresholds, setThresholds] = useState<MetricThreshold | null>(null);
  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);

  const form = useForm<FormData>({
    defaultValues: metric ? {
      category: metric.category,
      name: metric.name,
      target: metric.target,
      current: metric.current,
      status: metric.status,
      warning_threshold: '',
      error_threshold: '',
    } : {
      category: 'acquisition',
      name: '',
      target: '',
      current: null,
      status: 'not-started',
      warning_threshold: '',
      error_threshold: '',
    }
  });

  const fetchThresholds = async (metricId: string) => {
    setIsLoadingThresholds(true);
    try {
      const { data, error } = await supabase
        .from('metric_thresholds')
        .select('*')
        .eq('metric_id', metricId)
        .single();
      
      if (error && error.code !== 'PGSQL_ERROR') {
        console.error('Error fetching thresholds:', error);
      } else if (data) {
        setThresholds(data);
        form.setValue('warning_threshold', data.warning_threshold);
        form.setValue('error_threshold', data.error_threshold);
      }
    } catch (err) {
      console.error('Error in fetchThresholds:', err);
    } finally {
      setIsLoadingThresholds(false);
    }
  };

  useEffect(() => {
    if (isEditing && metric?.id) {
      fetchThresholds(metric.id);
    } else {
      setThresholds(null);
      form.setValue('warning_threshold', '');
      form.setValue('error_threshold', '');
    }
  }, [metric, isEditing, form]);

  // Automatically calculate status based on current value and thresholds
  const calculateStatus = (current: string | null, target: string, warningThreshold: string, errorThreshold: string): 'success' | 'warning' | 'error' | 'not-started' => {
    if (!current) return 'not-started';
    
    // Handle percentage values
    const normalizeValue = (val: string): number => {
      if (val.includes('%')) {
        return parseFloat(val.replace('%', ''));
      }
      return parseFloat(val);
    };

    try {
      const currentNum = normalizeValue(current);
      const targetNum = normalizeValue(target);
      const warningNum = normalizeValue(warningThreshold || target);
      const errorNum = normalizeValue(errorThreshold || target);
      
      // Different logic based on if higher or lower numbers are better
      const isHigherBetter = targetNum > 0;
      
      if (isHigherBetter) {
        if (currentNum >= targetNum) return 'success';
        if (currentNum >= warningNum) return 'warning';
        return 'error';
      } else {
        if (currentNum <= targetNum) return 'success';
        if (currentNum <= warningNum) return 'warning';
        return 'error';
      }
    } catch (e) {
      console.log('Error calculating status:', e);
      return 'not-started';
    }
  };

  const saveMetricHistory = async (metricId: string, value: string | null, status: string) => {
    try {
      const { error } = await supabase
        .from('metric_history')
        .insert({
          metric_id: metricId,
          value,
          status
        });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving metric history:', err);
    }
  };

  const handleSubmit = async (data: FormData) => {
    const { warning_threshold, error_threshold, ...metricData } = data;
    
    try {
      // Calculate status if thresholds and current value are provided
      if (data.current && warning_threshold && error_threshold) {
        metricData.status = calculateStatus(
          data.current, 
          data.target, 
          warning_threshold, 
          error_threshold
        );
      }
      
      if (isEditing && metric) {
        // Update existing metric
        const { data: updatedMetric, error } = await supabase
          .from('metrics')
          .update({
            ...metricData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', metric.id)
          .select()
          .single();

        if (error) throw error;
        
        // Save metric history
        await saveMetricHistory(metric.id, metricData.current, metricData.status);
        
        // Update or create thresholds
        if (warning_threshold && error_threshold) {
          if (thresholds) {
            await supabase
              .from('metric_thresholds')
              .update({
                warning_threshold,
                error_threshold,
                updated_at: new Date().toISOString(),
              })
              .eq('id', thresholds.id);
          } else {
            await supabase
              .from('metric_thresholds')
              .insert({
                metric_id: metric.id,
                warning_threshold,
                error_threshold,
              });
          }
        }

        toast({
          title: 'Metric updated',
          description: 'The metric has been successfully updated.',
        });
      } else {
        // Create new metric
        const { data: newMetric, error } = await supabase
          .from('metrics')
          .insert({
            ...metricData,
            project_id: projectId,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Save metric history
        await saveMetricHistory(newMetric.id, metricData.current, metricData.status);
        
        // Create thresholds if provided
        if (warning_threshold && error_threshold) {
          await supabase
            .from('metric_thresholds')
            .insert({
              metric_id: newMetric.id,
              warning_threshold,
              error_threshold,
            });
        }

        toast({
          title: 'Metric created',
          description: 'A new metric has been created successfully.',
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Metric' : 'Create New Metric'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
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
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="activation">Activation</SelectItem>
                          <SelectItem value="retention">Retention</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="Metric name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. >20%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="current"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 18%" 
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Info className="h-3.5 w-3.5 mr-1" />
                          <span>Will be auto-calculated if thresholds are set</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="thresholds" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    Set threshold values that will automatically determine the status of your metric. 
                    The status will be calculated based on the current value relative to these thresholds.
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="warning_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 15%" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="error_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 10%" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-2 text-sm text-gray-500">
                  <p>For values like conversion rates or retention rates:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>If target is 20%, warning might be 15%, error might be 10%</li>
                  </ul>
                  <p className="mt-2">For cost metrics (where lower is better):</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>If target is $20, warning might be $25, error might be $30</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MetricForm;
