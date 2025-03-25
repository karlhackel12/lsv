
import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExtendedPivotOption, PivotOptionFormProps } from './pivot/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { PIVOT_TYPES } from '@/types/pivot';
import { FormSheet } from '@/components/ui/form-sheet';

const formSchema = z.object({
  type: z.string().min(2, "Pivot type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  trigger: z.string().min(10, "Trigger conditions must be at least 10 characters"),
  likelihood: z.enum(["high", "medium", "low"]),
  evidence: z.string().optional(),
});

const PivotOptionForm = ({
  isOpen,
  pivotOption,
  projectId,
  metrics,
  onSave,
  onClose,
}: PivotOptionFormProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [selectedMetricId, setSelectedMetricId] = React.useState<string>('none');
  const [error, setError] = React.useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: pivotOption?.type || '',
      description: pivotOption?.description || '',
      trigger: pivotOption?.trigger || '',
      likelihood: pivotOption?.likelihood || 'medium',
      evidence: pivotOption?.evidence || '',
    },
  });

  useEffect(() => {
    if (isOpen && pivotOption) {
      form.reset({
        type: pivotOption.type || pivotOption.pivot_type || '',
        description: pivotOption.description || '',
        trigger: pivotOption.trigger || '',
        likelihood: pivotOption.likelihood || 'medium',
        evidence: pivotOption.evidence || '',
      });
    } else if (isOpen) {
      form.reset({
        type: '',
        description: '',
        trigger: '',
        likelihood: 'medium',
        evidence: '',
      });
    }
  }, [pivotOption, isOpen, form]);

  const handleMetricChange = (value: string) => {
    setSelectedMetricId(value);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    setError(null);

    try {
      if (pivotOption) {
        // Update existing pivot option
        const updates = {
          type: values.type,
          description: values.description,
          trigger: values.trigger,
          likelihood: values.likelihood,
          evidence: values.evidence,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('pivot_options')
          .update(updates)
          .eq('id', pivotOption.id || pivotOption.originalId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option has been updated.`,
        });
      } else {
        // Create new pivot option
        const newPivotOption = {
          type: values.type,
          description: values.description,
          trigger: values.trigger,
          likelihood: values.likelihood,
          evidence: values.evidence,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('pivot_options')
          .insert(newPivotOption);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option has been created.`,
        });
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving pivot option:', err);
      setError('Failed to save pivot option. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePivotTypeChange = (type: string) => {
    form.setValue('type', type);
    
    // Auto-fill description based on pivot type
    const pivotType = PIVOT_TYPES.find(p => p.value === type);
    if (pivotType) {
      const currentDescription = form.getValues('description');
      // Only auto-fill if description is empty or user hasn't modified it
      if (!currentDescription || currentDescription === '') {
        form.setValue('description', `${pivotType.label}: ${pivotType.description}`);
      }
    }
  };

  const formTitle = pivotOption ? 'Edit Pivot Option' : 'Create Pivot Option';
  const formDescription = pivotOption ? 
    'Update this potential pivot option and its trigger conditions' : 
    'Define a potential strategic pivot option in case current plans don\'t work';

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={formTitle}
      description={formDescription}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full mb-4 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="details" className="flex-1">Option Details</TabsTrigger>
              <TabsTrigger value="triggers" className="flex-1">Triggers & Metrics</TabsTrigger>
            </TabsList>
            
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <TabsContent value="details" className="space-y-6 mt-0">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pivot Type</FormLabel>
                      <Select
                        onValueChange={(value) => handlePivotTypeChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pivot type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PIVOT_TYPES.map((pivotType) => (
                            <SelectItem key={pivotType.value} value={pivotType.value}>
                              {pivotType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value && PIVOT_TYPES.find(p => p.value === field.value)?.description}
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
                          placeholder="Describe this pivot option in detail"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select likelihood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How likely is it that this pivot will be needed?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What evidence supports this potential pivot direction?"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="triggers" className="space-y-6 mt-0">
                <FormField
                  control={form.control}
                  name="trigger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What specific conditions would trigger this pivot?"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <h4 className="font-medium text-amber-800 flex items-center mb-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pivot Trigger Guidance
                  </h4>
                  <p className="text-sm text-amber-700">
                    Define specific, measurable conditions that would trigger considering this pivot.
                    Examples: "CAC exceeds LTV", "Churn rate above 15% for 3 consecutive months",
                    "Less than 5% activation rate after 10,000 visitors".
                  </p>
                </div>

                <div className="mt-4">
                  <FormLabel htmlFor="metric" className="text-sm font-medium">Linked Metric</FormLabel>
                  <div className="mt-1.5">
                    <Select value={selectedMetricId} onValueChange={handleMetricChange}>
                      <SelectTrigger id="metric">
                        <SelectValue placeholder="Select a metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {metrics.map((metric) => (
                          <SelectItem key={metric.id} value={metric.id || ''}>
                            {metric.name} - {metric.description || 'No description'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : pivotOption ? 'Update Pivot Option' : 'Create Pivot Option'}
            </Button>
          </div>
        </form>
      </Form>
    </FormSheet>
  );
};

export default PivotOptionForm;
