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
import { GrowthExperiment, GrowthMetric, GrowthModel } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface GrowthExperimentFormProps {
  growthModel?: GrowthModel; // Make growthModel optional
  projectId: string;
  metrics: GrowthMetric[];
  experiment?: GrowthExperiment | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const GrowthExperimentForm = ({ 
  growthModel, 
  projectId, 
  metrics,
  experiment, 
  onSave, 
  onClose 
}: GrowthExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;

  const defaultStartDate = experiment?.start_date 
    ? new Date(experiment.start_date) 
    : new Date();
  
  const defaultEndDate = experiment?.end_date 
    ? new Date(experiment.end_date) 
    : new Date(new Date().setDate(new Date().getDate() + 14)); // Default to 2 weeks from now

  const form = useForm<GrowthExperiment>({
    defaultValues: experiment || {
      title: '',
      hypothesis: '',
      metric_id: metrics.length > 0 ? metrics[0].id : '',
      expected_lift: 10,
      actual_lift: undefined,
      start_date: defaultStartDate.toISOString(),
      end_date: defaultEndDate.toISOString(),
      status: 'planned',
      notes: '',
      growth_model_id: growthModel?.id, // Use optional chaining
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthExperiment,
  });

  const handleSubmit = async (data: GrowthExperiment) => {
    try {
      if (isEditing && experiment) {
        // Update existing experiment
        const { error } = await supabase
          .from('growth_experiments')
          .update({
            title: data.title,
            hypothesis: data.hypothesis,
            metric_id: data.metric_id,
            expected_lift: data.expected_lift,
            actual_lift: data.actual_lift,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', experiment.originalId || experiment.id);
          
        if (error) throw error;
        
        toast({
          title: 'Experiment updated',
          description: 'Your experiment has been successfully updated',
        });
      } else {
        // Create new experiment
        const { error } = await supabase
          .from('growth_experiments')
          .insert({
            title: data.title,
            hypothesis: data.hypothesis,
            metric_id: data.metric_id,
            expected_lift: data.expected_lift,
            actual_lift: data.actual_lift,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            notes: data.notes,
            project_id: projectId,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Experiment created',
          description: 'Your new experiment has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving experiment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save experiment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiment Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Redesign Onboarding Flow"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hypothesis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="We believe that [change] will result in [outcome]..."
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metric_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Metric</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a metric" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metrics.map((metric) => (
                          <SelectItem key={metric.id} value={metric.id}>
                            {metric.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expected_lift"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Lift (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(isEditing || form.watch('status') === 'completed') && (
                  <FormField
                    control={form.control}
                    name="actual_lift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Actual Lift (%)
                          {form.watch('status') !== 'completed' && (
                            <span className="text-xs text-gray-500 ml-1">(optional)</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder={form.watch('status') === 'completed' ? 'Required' : 'Optional'}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value !== undefined ? field.value : ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date.toISOString());
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date.toISOString());
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Notes
                      <span className="text-xs text-gray-500 ml-1">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details, implementation notes, or results observations..."
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
                {isEditing ? 'Update Experiment' : 'Create Experiment'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GrowthExperimentForm;

