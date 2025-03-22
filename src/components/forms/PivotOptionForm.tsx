
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Create a schema for form validation
const formSchema = z.object({
  type: z.string().min(2, {
    message: "Type must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  trigger: z.string().min(10, {
    message: "Trigger point must be at least 10 characters.",
  }),
  likelihood: z.enum(['high', 'medium', 'low']),
});

type FormData = z.infer<typeof formSchema>;

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
    resolver: zodResolver(formSchema),
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
            
            {isEditing && (
              <div className="mt-6">
                <Label className="mb-2 block">Previous Pivot Options</Label>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Likelihood</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">{pivotOption?.type}</TableCell>
                        <TableCell>{pivotOption?.likelihood}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
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
