
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';
import { Check, AlertTriangle, GitFork, Target, Info, BarChart3, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const pivotFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  pivot_type: z.string().min(1, { message: 'Please select a pivot type' }),
  potential_impact: z.string().min(1, { message: 'Please select potential impact' }),
  implementation_effort: z.string().min(1, { message: 'Please select implementation effort' }),
  evidence: z.string().min(10, { message: 'Evidence must be at least 10 characters' }),
  status: z.string().min(1, { message: 'Please select a status' }),
});

type FormValues = z.infer<typeof pivotFormSchema>;

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
  const [filterBy, setFilterBy] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(pivotFormSchema),
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

  const watchedValues = {
    name: form.watch('name'),
    type: form.watch('pivot_type'),
    impact: form.watch('potential_impact'),
    effort: form.watch('implementation_effort'),
    status: form.watch('status'),
  };

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
        potential_impact: pivotOption.potential_impact || pivotOption.likelihood || '',
        implementation_effort: pivotOption.implementation_effort || '',
        evidence: pivotOption.evidence || pivotOption.trigger || '',
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

  const getFilteredMetrics = () => {
    let filtered = [...metrics];
    
    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(m => m.category === filterBy);
    }
    
    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) || 
        (m.description && m.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'very-high': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very-high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'evaluating': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'implemented': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork className="h-5 w-5 text-primary" />
            {pivotOption ? 'Edit Pivot Option' : 'Add New Pivot Option'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span>Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Metric Triggers</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Name
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>A clear, concise name for this pivot option</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pivot option name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pivot_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Pivot Type
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>The type of pivot strategy you're considering</p>
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
                      <FormDescription>
                        The type of pivot you're considering for your product or business model
                      </FormDescription>
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
                      <FormDescription>
                        Explain what this pivot would involve and how it would change your current approach
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        <FormDescription>
                          How significant an impact could this pivot have on your business?
                        </FormDescription>
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
                        <FormDescription>
                          How much effort would this pivot require to implement?
                        </FormDescription>
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
                      <FormDescription>
                        What data or observations suggest this pivot might be necessary or beneficial?
                      </FormDescription>
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
                      <FormDescription>
                        Current status of this pivot option in your decision process
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="metrics" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      Link metrics to this pivot option. When a metric's status changes to "error", 
                      it will automatically trigger this pivot option for review.
                    </span>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Input
                          placeholder="Search metrics..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select
                        value={filterBy}
                        onValueChange={setFilterBy}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="activation">Activation</SelectItem>
                          <SelectItem value="retention">Retention</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-medium">Select Metric Triggers</h3>
                        <div className="text-sm text-gray-500">
                          {selectedMetricIds.length} selected
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[300px]">
                        {getFilteredMetrics().length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            No metrics match your search criteria
                          </div>
                        ) : (
                          <div className="grid gap-1 p-2">
                            {getFilteredMetrics().map(metric => {
                              const isSelected = selectedMetricIds.includes(metric.id) || 
                                              (metric.originalId && selectedMetricIds.includes(metric.originalId));
                              
                              return (
                                <div 
                                  key={metric.id} 
                                  className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => toggleMetricSelection(metric.id)}
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{metric.name}</span>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {metric.category}
                                      </Badge>
                                      {metric.status === 'error' && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                                          Error
                                        </Badge>
                                      )}
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
                                      onClick={(e) => e.stopPropagation()}
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
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Preview Pivot Option</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-md p-4 border">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium">
                            {watchedValues.name || "Untitled Pivot Option"}
                          </h3>
                          <Badge className={getStatusColor(watchedValues.status)}>
                            {watchedValues.status.charAt(0).toUpperCase() + watchedValues.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {watchedValues.type && (
                            <Badge variant="outline" className="capitalize">
                              {watchedValues.type.replace(/-/g, ' ')} Pivot
                            </Badge>
                          )}
                          {watchedValues.impact && (
                            <Badge variant="outline" className={getImpactColor(watchedValues.impact)}>
                              Impact: {watchedValues.impact.charAt(0).toUpperCase() + watchedValues.impact.slice(1)}
                            </Badge>
                          )}
                          {watchedValues.effort && (
                            <Badge variant="outline" className={getEffortColor(watchedValues.effort)}>
                              Effort: {watchedValues.effort.charAt(0).toUpperCase() + watchedValues.effort.slice(1)}
                            </Badge>
                          )}
                        </div>
                        
                        {form.watch('description') && (
                          <div className="mt-3 text-sm">
                            <div className="font-medium text-gray-700 mb-1">Description:</div>
                            <p className="text-gray-600">{form.watch('description')}</p>
                          </div>
                        )}
                        
                        {form.watch('evidence') && (
                          <div className="mt-3 text-sm">
                            <div className="font-medium text-gray-700 mb-1">Evidence:</div>
                            <p className="text-gray-600">{form.watch('evidence')}</p>
                          </div>
                        )}
                        
                        {selectedMetricIds.length > 0 && (
                          <div className="mt-4">
                            <div className="font-medium text-gray-700 mb-2">Linked Metrics:</div>
                            <div className="grid gap-2">
                              {selectedMetricIds.map(id => {
                                const metric = getMetricById(id);
                                if (!metric) return null;
                                
                                return (
                                  <div key={id} className="flex items-center gap-2 text-sm border border-gray-200 rounded p-2 bg-white">
                                    <span className="font-medium">{metric.name}</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {metric.category}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium">Decision Matrix</h4>
                        <p className="text-sm text-gray-500 mb-3">
                          Based on impact and effort, this pivot option is:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-1 max-w-md border rounded-md overflow-hidden">
                          <div className="bg-gray-100 p-3 font-medium text-center border-b border-r">
                            Low Effort
                          </div>
                          <div className="bg-gray-100 p-3 font-medium text-center border-b">
                            High Effort
                          </div>
                          
                          <div className={`p-3 text-center border-r ${
                            watchedValues.impact === 'high' && watchedValues.effort === 'low' ? 
                            'bg-green-100 font-medium' : ''
                          }`}>
                            High Impact: <br />
                            <span className="text-sm">Quick Win</span>
                          </div>
                          <div className={`p-3 text-center ${
                            watchedValues.impact === 'high' && watchedValues.effort === 'high' ? 
                            'bg-yellow-100 font-medium' : ''
                          }`}>
                            High Impact: <br />
                            <span className="text-sm">Major Project</span>
                          </div>
                          
                          <div className={`p-3 text-center border-r border-t ${
                            watchedValues.impact === 'low' && watchedValues.effort === 'low' ? 
                            'bg-blue-100 font-medium' : ''
                          }`}>
                            Low Impact: <br />
                            <span className="text-sm">Fill-in Task</span>
                          </div>
                          <div className={`p-3 text-center border-t ${
                            watchedValues.impact === 'low' && watchedValues.effort === 'high' ? 
                            'bg-red-100 font-medium' : ''
                          }`}>
                            Low Impact: <br />
                            <span className="text-sm">Not Worth It</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
