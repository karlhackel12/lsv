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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  pivotOption?: any;
  projectId: string;
}

const PivotOptionForm = ({ isOpen, onClose, onSave, pivotOption, projectId }: PivotOptionFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (pivotOption) {
      form.reset({
        name: pivotOption.name || '',
        description: pivotOption.description || '',
        pivot_type: pivotOption.pivot_type || '',
        potential_impact: pivotOption.potential_impact || '',
        implementation_effort: pivotOption.implementation_effort || '',
        evidence: pivotOption.evidence || '',
        status: pivotOption.status || 'proposed',
      });
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
    }
  }, [pivotOption, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (pivotOption) {
        // Update existing pivot option
        const { error } = await supabase
          .from('pivot_options')
          .update({
            name: values.name,
            description: values.description,
            pivot_type: values.pivot_type,
            potential_impact: values.potential_impact,
            implementation_effort: values.implementation_effort,
            evidence: values.evidence,
            status: values.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pivotOption.id);

        if (error) throw error;

        toast({
          title: 'Pivot option updated',
          description: 'The pivot option has been successfully updated.',
        });
      } else {
        // Create new pivot option
        const { error } = await supabase
          .from('pivot_options')
          .insert({
            name: values.name,
            description: values.description,
            pivot_type: values.pivot_type,
            potential_impact: values.potential_impact,
            implementation_effort: values.implementation_effort,
            evidence: values.evidence,
            status: values.status,
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

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
