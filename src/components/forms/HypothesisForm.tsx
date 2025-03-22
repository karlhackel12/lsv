
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
import { Hypothesis } from '@/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { TEMPLATE_VALUE_HYPOTHESES, TEMPLATE_GROWTH_HYPOTHESES } from '@/types/pivot';

type FormData = Omit<Hypothesis, 'id' | 'created_at' | 'updated_at' | 'project_id' | 'originalId'>;

interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  hypothesis?: Hypothesis;
  projectId: string;
}

const HypothesisForm = ({ isOpen, onClose, onSave, hypothesis, projectId }: HypothesisFormProps) => {
  const { toast } = useToast();
  const isEditing = !!hypothesis;
  const [category, setCategory] = useState(hypothesis?.category || 'value');

  const form = useForm<FormData>({
    defaultValues: hypothesis ? {
      category: hypothesis.category,
      statement: hypothesis.statement,
      experiment: hypothesis.experiment,
      criteria: hypothesis.criteria,
      status: hypothesis.status,
      result: hypothesis.result || null,
      evidence: hypothesis.evidence || null,
    } : {
      category: 'value',
      statement: '',
      experiment: '',
      criteria: '',
      status: 'not-started',
      result: null,
      evidence: null,
    }
  });

  // Update templates when category changes
  useEffect(() => {
    setCategory(form.watch('category'));
  }, [form.watch('category')]);

  const handleSubmit = async (data: FormData) => {
    try {
      if (isEditing && hypothesis) {
        // Update existing hypothesis - use originalId if available
        const id = hypothesis.originalId || hypothesis.id;
        const { error } = await supabase
          .from('hypotheses')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast({
          title: 'Hypothesis updated',
          description: 'The hypothesis has been successfully updated.',
        });
      } else {
        // Create new hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .insert({
            ...data,
            project_id: projectId,
          });

        if (error) throw error;
        toast({
          title: 'Hypothesis created',
          description: 'A new hypothesis has been created successfully.',
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

  const applyTemplate = (template: string) => {
    form.setValue('statement', template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hypothesis' : 'Create New Hypothesis'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="value">Value Hypothesis</SelectItem>
                      <SelectItem value="growth">Growth Hypothesis</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="statement"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Hypothesis Statement</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Templates
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[400px]">
                        <DropdownMenuGroup>
                          {category === 'value' ? (
                            TEMPLATE_VALUE_HYPOTHESES.map((template, index) => (
                              <DropdownMenuItem 
                                key={index}
                                onClick={() => applyTemplate(template)}
                                className="cursor-pointer py-2"
                              >
                                {template}
                              </DropdownMenuItem>
                            ))
                          ) : (
                            TEMPLATE_GROWTH_HYPOTHESES.map((template, index) => (
                              <DropdownMenuItem 
                                key={index}
                                onClick={() => applyTemplate(template)}
                                className="cursor-pointer py-2"
                              >
                                {template}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter hypothesis statement or select a template"
                      {...field} 
                      className="h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="experiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Experiment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How will you test this hypothesis?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What defines success for this hypothesis?" {...field} />
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
                      <SelectItem value="validating">Validating</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="invalid">Invalid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(form.watch('status') === 'validated' || form.watch('status') === 'invalid') && (
              <>
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What were the results?"
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
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What evidence supports the results?"
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
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

export default HypothesisForm;
