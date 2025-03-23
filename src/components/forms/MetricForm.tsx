import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FormDescription,
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
import { Info, HelpCircle, AlertTriangle, BarChart3, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const metricSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  target: z.string().min(1, 'Target value is required'),
  current: z.string().nullable(),
  status: z.string(),
  warning_threshold: z.string().optional(),
  error_threshold: z.string().optional(),
  description: z.string().optional(),
  pivotTrigger: z.boolean().default(false),
});

type FormData = z.infer<typeof metricSchema>;

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
  const [previewStatus, setPreviewStatus] = useState<'not-started' | 'success' | 'warning' | 'error'>('not-started');
  const [autoCalculateStatus, setAutoCalculateStatus] = useState(true);
  const [metricDirection, setMetricDirection] = useState<'higher' | 'lower'>('higher');

  const form = useForm<FormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: metric ? {
      category: metric.category,
      name: metric.name,
      target: metric.target,
      current: metric.current,
      status: metric.status,
      warning_threshold: '',
      error_threshold: '',
      description: metric.description || '',
      pivotTrigger: false,
    } : {
      category: 'acquisition',
      name: '',
      target: '',
      current: null,
      status: 'not-started',
      warning_threshold: '',
      error_threshold: '',
      description: '',
      pivotTrigger: false,
    }
  });

  const watchedValues = {
    current: form.watch('current'),
    target: form.watch('target'),
    warning: form.watch('warning_threshold'),
    error: form.watch('error_threshold'),
  };

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
      
      // Determine metric direction from existing values
      if (metric.target && metric.target.includes('%')) {
        const targetNum = parseFloat(metric.target.replace('%', ''));
        setMetricDirection(targetNum >= 0 ? 'higher' : 'lower');
      }
    } else {
      setThresholds(null);
      form.setValue('warning_threshold', '');
      form.setValue('error_threshold', '');
    }
  }, [metric, isEditing, form]);

  useEffect(() => {
    if (autoCalculateStatus && watchedValues.current && watchedValues.target) {
      const warningThreshold = watchedValues.warning || watchedValues.target;
      const errorThreshold = watchedValues.error || watchedValues.target;
      
      const calculatedStatus = calculateStatus(
        watchedValues.current, 
        watchedValues.target, 
        warningThreshold, 
        errorThreshold,
        metricDirection
      );
      
      setPreviewStatus(calculatedStatus);
      
      if (calculatedStatus !== form.getValues('status')) {
        form.setValue('status', calculatedStatus);
      }
    }
  }, [watchedValues, metricDirection, autoCalculateStatus, form]);

  const calculateStatus = (
    current: string | null, 
    target: string, 
    warningThreshold: string, 
    errorThreshold: string,
    direction: 'higher' | 'lower' = 'higher'
  ): 'success' | 'warning' | 'error' | 'not-started' => {
    if (!current) return 'not-started';
    
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
      
      const isHigherBetter = direction === 'higher';
      
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
    const { warning_threshold, error_threshold, pivotTrigger, ...metricData } = data;
    
    try {
      if (data.current && autoCalculateStatus && warning_threshold && error_threshold) {
        const calculatedStatus = calculateStatus(
          data.current, 
          data.target, 
          warning_threshold, 
          error_threshold,
          metricDirection
        );
        
        metricData.status = calculatedStatus as "not-started" | "success" | "warning" | "error";
      }
      
      if (isEditing && metric) {
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
        
        await saveMetricHistory(metric.id, metricData.current, metricData.status);
        
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

        if (pivotTrigger && metricData.status === 'error') {
          const { data: existingTrigger } = await supabase
            .from('pivot_metric_triggers')
            .select('*')
            .eq('metric_id', metric.id)
            .single();
            
          if (!existingTrigger) {
            const { data: newPivotOption } = await supabase
              .from('pivot_options')
              .insert({
                type: 'customer-need',
                description: `Pivot option triggered by metric: ${metricData.name}`,
                trigger: `Metric "${metricData.name}" is in error state`,
                likelihood: 'medium',
                project_id: projectId,
              })
              .select()
              .single();
              
            if (newPivotOption) {
              await supabase
                .from('pivot_metric_triggers')
                .insert({
                  pivot_option_id: newPivotOption.id,
                  metric_id: metric.id,
                  threshold_type: 'error'
                });
            }
          }
        }

        toast({
          title: 'Metric updated',
          description: 'The metric has been successfully updated.',
        });
      } else {
        const { data: newMetric, error } = await supabase
          .from('metrics')
          .insert({
            category: metricData.category || 'acquisition',
            name: metricData.name || '',
            target: metricData.target || '',
            current: metricData.current,
            status: metricData.status || 'not-started',
            project_id: projectId,
            description: metricData.description
          })
          .select()
          .single();

        if (error) throw error;
        
        await saveMetricHistory(newMetric.id, metricData.current, metricData.status);
        
        if (warning_threshold && error_threshold) {
          await supabase
            .from('metric_thresholds')
            .insert({
              metric_id: newMetric.id,
              warning_threshold,
              error_threshold,
            });
        }
        
        if (pivotTrigger && metricData.status === 'error') {
          const { data: newPivotOption } = await supabase
            .from('pivot_options')
            .insert({
              type: 'customer-need',
              description: `Pivot option triggered by metric: ${metricData.name}`,
              trigger: `Metric "${metricData.name}" is in error state`,
              likelihood: 'medium',
              project_id: projectId,
            })
            .select()
            .single();
            
          if (newPivotOption) {
            await supabase
              .from('pivot_metric_triggers')
              .insert({
                pivot_option_id: newPivotOption.id,
                metric_id: newMetric.id,
                threshold_type: 'error'
              });
          }
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const suggestThresholds = () => {
    const targetValue = form.getValues('target');
    
    if (!targetValue) {
      toast({
        title: 'Enter target first',
        description: 'Please enter a target value before generating thresholds.',
      });
      return;
    }
    
    try {
      let targetNum = parseFloat(targetValue.replace('%', ''));
      const isPercentage = targetValue.includes('%');
      
      const isHigherBetter = metricDirection === 'higher';
      
      let warningValue, errorValue;
      
      if (isHigherBetter) {
        warningValue = Math.round(targetNum * 0.8);
        errorValue = Math.round(targetNum * 0.6);
      } else {
        warningValue = Math.round(targetNum * 1.2);
        errorValue = Math.round(targetNum * 1.4);
      }
      
      const warningThreshold = isPercentage ? `${warningValue}%` : `${warningValue}`;
      const errorThreshold = isPercentage ? `${errorValue}%` : `${errorValue}`;
      
      form.setValue('warning_threshold', warningThreshold);
      form.setValue('error_threshold', errorThreshold);
      
      toast({
        title: 'Thresholds suggested',
        description: `Warning: ${warningThreshold}, Error: ${errorThreshold}`,
      });
    } catch (e) {
      toast({
        title: 'Error generating thresholds',
        description: 'Please enter a valid numeric target value.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Metric' : 'Create New Metric'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="thresholds" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Thresholds</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Category
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>Choose from the AARRR framework categories</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
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
                          <Input placeholder="e.g., Conversion Rate" {...field} />
                        </FormControl>
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
                      <FormLabel className="flex items-center gap-1">
                        Description
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Describe what this metric measures and why it's important</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this metric measures and why it's important"
                          {...field} 
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Value</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 20%" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          What value do you want to achieve?
                        </FormDescription>
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
                            placeholder="e.g., 18%" 
                            value={field.value || ''} 
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Leave blank if not yet measured
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-3 bg-muted p-3 rounded-md">
                  <div className="flex-grow">
                    <Label htmlFor="metric-direction" className="text-sm font-medium mb-1 block">
                      Metric Direction
                    </Label>
                    <div className="text-xs text-muted-foreground mb-2">
                      Is a higher or lower value better for this metric?
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Button
                      type="button"
                      variant={metricDirection === 'higher' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMetricDirection('higher')}
                    >
                      Higher is better
                    </Button>
                    <Button
                      type="button"
                      variant={metricDirection === 'lower' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMetricDirection('lower')}
                    >
                      Lower is better
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="thresholds" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Threshold Settings</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={suggestThresholds}
                      >
                        Suggest Thresholds
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-blue-800 flex items-start gap-2">
                        <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>
                          Set threshold values that will automatically determine the status of your metric. 
                          The status will be calculated based on the current value relative to these thresholds.
                        </span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Label htmlFor="auto-calculate" className="flex items-center gap-2 cursor-pointer">
                        <span>Auto-calculate status</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>When enabled, the status will be automatically determined based on the current value and thresholds</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Switch
                        id="auto-calculate"
                        checked={autoCalculateStatus}
                        onCheckedChange={setAutoCalculateStatus}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="warning_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <span>Warning Threshold</span>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                Warning
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={metricDirection === 'higher' ? "e.g., 15% (lower than target)" : "e.g., 25% (higher than target)"} 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {metricDirection === 'higher' 
                                ? "When current value falls to this level" 
                                : "When current value rises to this level"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="error_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <span>Error Threshold</span>
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                                Error
                              </Badge>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={metricDirection === 'higher' ? "e.g., 10% (lower than warning)" : "e.g., 30% (higher than warning)"} 
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {metricDirection === 'higher' 
                                ? "When current value falls below warning level" 
                                : "When current value rises above warning level"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <FormField
                  control={form.control}
                  name="pivotTrigger"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Create pivot trigger</FormLabel>
                        <FormDescription>
                          When this metric reaches error status, automatically suggest a pivot option
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Metric Preview</h3>
                    
                    <div className="rounded-md bg-gray-50 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {form.watch('name') || 'Untitled Metric'}
                        </h4>
                        <Badge className={getStatusBadgeColor(previewStatus)}>
                          {previewStatus === 'not-started' ? 'Not Started' : 
                           previewStatus === 'success' ? 'Success' : 
                           previewStatus === 'warning' ? 'Warning' : 'Error'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {form.watch('category')?.charAt(0).toUpperCase() + form.watch('category')?.slice(1) || 'Category'}
                        </Badge>
                        {form.watch('pivotTrigger') && previewStatus === 'error' && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                            Pivot Trigger
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Current:</span>
                          <span className="font-medium">{form.watch('current') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Target:</span>
                          <span className="font-medium">{form.watch('target') || 'N/A'}</span>
                        </div>
                        {form.watch('warning_threshold') && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Warning at:</span>
                            <span className="font-medium text-yellow-600">{form.watch('warning_threshold')}</span>
                          </div>
                        )}
                        {form.watch('error_threshold') && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Error at:</span>
                            <span className="font-medium text-red-600">{form.watch('error_threshold')}</span>
                          </div>
                        )}
                      </div>
                      
                      {form.watch('description') && (
                        <div className="mt-3 text-sm text-gray-500">
                          {form.watch('description')}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Status Override</h4>
                      {autoCalculateStatus ? (
                        <div className="text-sm text-muted-foreground">
                          Status is being automatically calculated. Disable auto-calculation in the Thresholds tab to manually set the status.
                        </div>
                      ) : (
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
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
