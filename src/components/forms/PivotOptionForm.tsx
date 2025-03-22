
import React from 'react';
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
import { PivotOption } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type FormData = Omit<PivotOption, 'id' | 'created_at' | 'updated_at' | 'project_id'>;

interface PivotOptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  pivotOption?: PivotOption;
  projectId: string;
}

const PivotOptionForm = ({ isOpen, onClose, onSave, pivotOption, projectId }: PivotOptionFormProps) => {
  const { toast } = useToast();
  const isEditing = !!pivotOption;

  const form = useForm<FormData>({
    defaultValues: pivotOption ? {
      type: pivotOption.type,
      description: pivotOption.description,
      trigger: pivotOption.trigger,
      likelihood: pivotOption.likelihood,
    } : {
      type: '',
      description: '',
      trigger: '',
      likelihood: 'medium',
    }
  });

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && pivotOption) {
        // Update existing pivot option
        const { error } = await supabase
          .from('pivot_options')
          .update({
            ...data,
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
            ...data,
            project_id: projectId,
          });

        if (error) throw error;
        toast({
          title: 'Pivot option created',
          description: 'A new pivot option has been created successfully.',
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
          <DialogTitle>{isEditing ? 'Edit Pivot Option' : 'Create New Pivot Option'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pivot Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Zoom-in Pivot, Platform Pivot" {...field} />
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
                    <Textarea placeholder="Describe the pivot option" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trigger Point</FormLabel>
                  <FormControl>
                    <Textarea placeholder="When should this pivot be considered?" {...field} />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
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

export default PivotOptionForm;
