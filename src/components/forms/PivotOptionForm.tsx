
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';
import { Check, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  pivot_type: z.string().min(1, { message: 'Please select a pivot type' }),
  potential_impact: z.string().min(1, { message: 'Please select potential impact' }),
  implementation_effort: z.string().min(1, { message: 'Please select implementation effort' }),
  evidence: z.string().min(10, { message: 'Evidence must be at least 10 characters' }),
  status: z.string().min(1, { message: 'Please select a status' }),
});

type FormValues = z.infer<typeof formSchema>;

interface PivotOptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pivotOption?: PivotOption;
  projectId: string;
}

const PivotOptionForm = ({ isOpen, onClose, onSave, pivotOption, projectId }: PivotOptionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>([]);
  const [metricTriggers, setMetricTriggers] = useState<PivotMetricTrigger[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      pivot_type: '',
      potential_impact: '',
      implementation_effort: '',
      evidence: '',
      status: 'proposed',
    },
  });

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('category', { ascending: true });
        
      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const fetchMetricTriggers = async (pivotOptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('pivot_metric_triggers')
        .select('*')
        .eq('pivot_option_id', pivotOptionId);
        
      if (error) throw error;
      
      setMetricTriggers(data || []);
      setSelectedMetricIds(data.map((trigger: PivotMetricTrigger) => trigger.metric_id));
    } catch (err) {
      console.error('Error fetching metric triggers:', err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMetrics();
    }
  }, [projectId]);

  useEffect(() => {
    if (pivotOption) {
      form.reset({
        name: pivotOption.name || '',
        description: pivotOption.description || '',
        pivot_type: pivotOption.pivot_type || pivotOption.type || '',
        potential_impact: pivotOption.potential_impact || '',
        implementation_effort: pivotOption.implementation_effort || '',
        evidence: pivotOption.evidence || '',
        status: pivotOption.status || 'proposed',
      });
      
      if (pivotOption.id || pivotOption.originalId) {
        fetchMetricTriggers(pivotOption.originalId || pivotOption.id);
      }
    } else {
      form.reset({
        name: '',
        description: '',
        pivot_type: '',
        potential_impact: '',
        implementation_effort: '',
        evidence: '',
        status: 'proposed',
      });
      setSelectedMetricIds([]);
      setMetricTriggers([]);
    }
  }, [pivotOption, form]);

  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetricIds(prev => 
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const getMetricById = (id: string) => {
    return metrics.find(m => m.id === id || m.originalId === id);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (pivotOption) {
        // Update existing pivot option
        const idToUse = pivotOption.originalId || pivotOption.id;
        
        const { data: updatedPivotOption, error } = await supabase
          .from('pivot_options')
          .update({
            // Map form values to database column names
            type: values.pivot_type,
            description: values.description,
            trigger: values.evidence, // Using evidence as trigger
            likelihood: values.potential_impact as 'high' | 'medium' | 'low',
            updated_at: new Date().toISOString(),
          })
          .eq('id', idToUse)
          .select()
          .single();

        if (error) throw error;

        // Update metric triggers
        // First, remove all existing triggers
        await supabase
          .from('pivot_metric_triggers')
          .delete()
          .eq('pivot_option_id', idToUse);
          
        // Then add new ones
        if (selectedMetricIds.length > 0) {
          const metricsToInsert = selectedMetricIds.map(metricId => ({
            pivot_option_id: idToUse,
            metric_id: metricId,
            threshold_type: 'error' // Default to error threshold
          }));
          
          await supabase
            .from('pivot_metric_triggers')
            .insert(metricsToInsert);
        }

        toast({
          title: 'Pivot option updated',
          description: 'The pivot option has been successfully updated.',
        });
      } else {
        // Create new pivot option
        const { data: newPivotOption, error } = await supabase
          .from('pivot_options')
          .insert({
            // Map form values to database column names
            type: values.pivot_type,
            description: values.description,
            trigger: values.evidence, // Using evidence as trigger
            likelihood: values.potential_impact as 'high' | 'medium' | 'low',
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Add metric triggers if metrics are selected
        if (selectedMetricIds.length > 0) {
          const metricsToInsert = selectedMetricIds.map(metricId => ({
            pivot_option_id: newPivotOption.id,
            metric_id: metricId,
            threshold_type: 'error' // Default to error threshold
          }));
          
          await supabase
            .from('pivot_metric_triggers')
            .insert(metricsToInsert);
        }

        toast({
          title: 'Pivot option created',
          description: 'The pivot option has been successfully created.',
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the pivot option.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{pivotOption ? 'Edit Pivot Option' : 'Add New Pivot Option'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="metrics">Metric Triggers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pivot option name" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the pivot option in detail" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pivot_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pivot Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pivot type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="zoom-in">Zoom-in Pivot</SelectItem>
                            <SelectItem value="zoom-out">Zoom-out Pivot</SelectItem>
                            <SelectItem value="customer-segment">Customer Segment Pivot</SelectItem>
                            <SelectItem value="customer-need">Customer Need Pivot</SelectItem>
                            <SelectItem value="platform">Platform Pivot</SelectItem>
                            <SelectItem value="business-architecture">Business Architecture Pivot</SelectItem>
                            <SelectItem value="value-capture">Value Capture Pivot</SelectItem>
                            <SelectItem value="engine-of-growth">Engine of Growth Pivot</SelectItem>
                            <SelectItem value="channel">Channel Pivot</SelectItem>
                            <SelectItem value="technology">Technology Pivot</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="proposed">Proposed</SelectItem>
                            <SelectItem value="evaluating">Evaluating</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="implemented">Implemented</SelectItem>
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
                    name="potential_impact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potential Impact</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select impact level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="very-high">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="implementation_effort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Implementation Effort</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select effort level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="very-high">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What evidence supports this pivot option?" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    Link metrics to this pivot option. When a metric's status changes to "error", 
                    it will automatically trigger this pivot option for review.
                  </p>
                </div>
                
                {isLoadingMetrics ? (
                  <div className="py-8 text-center">
                    <Button variant="ghost" disabled className="gap-2">
                      <span className="animate-spin">⟳</span> Loading metrics...
                    </Button>
                  </div>
                ) : metrics.length === 0 ? (
                  <div className="border rounded-md p-6 text-center">
                    <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                    <h4 className="font-medium">No metrics available</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Create metrics first to link them as pivot triggers.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="font-medium">Select metrics that should trigger this pivot option:</div>
                    <div className="grid gap-3">
                      {metrics.map(metric => {
                        const isSelected = selectedMetricIds.includes(metric.id) || 
                                          (metric.originalId && selectedMetricIds.includes(metric.originalId));
                        
                        return (
                          <div 
                            key={metric.id} 
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{metric.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Target: {metric.target} | Current: {metric.current || 'N/A'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`metric-${metric.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleMetricSelection(metric.id)}
                              />
                              <Label htmlFor={`metric-${metric.id}`} className="sr-only">
                                Link this metric
                              </Label>
                              {isSelected && <Check className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : pivotOption ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PivotOptionForm;
