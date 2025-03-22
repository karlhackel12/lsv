
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Experiment, Hypothesis } from '@/types/database';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { 
  TEMPLATE_PROBLEM_EXPERIMENTS, 
  TEMPLATE_SOLUTION_EXPERIMENTS, 
  TEMPLATE_BUSINESS_MODEL_EXPERIMENTS,
  TEMPLATE_PROBLEM_CRITERIA,
  TEMPLATE_SOLUTION_CRITERIA,
  TEMPLATE_BUSINESS_MODEL_CRITERIA
} from '@/types/pivot';

type FormData = {
  title: string;
  hypothesis: string;
  method: string;
  metrics: string;
  results: string | null;
  insights: string | null;
  decisions: string | null;
  status: 'planned' | 'in-progress' | 'completed';
  category?: 'problem' | 'solution' | 'business-model';
};

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  experiment?: Experiment;
  projectId: string;
}

const ExperimentForm = ({ isOpen, onClose, onSave, experiment, projectId }: ExperimentFormProps) => {
  const { toast } = useToast();
  const isEditing = !!experiment;
  const [category, setCategory] = useState(experiment?.category || 'problem');
  const [relatedHypotheses, setRelatedHypotheses] = useState<Hypothesis[]>([]);
  const [isLoadingHypotheses, setIsLoadingHypotheses] = useState(false);

  const form = useForm<FormData>({
    defaultValues: experiment ? {
      title: experiment.title || '',
      hypothesis: experiment.hypothesis || '',
      method: experiment.method || '',
      metrics: experiment.metrics || '',
      results: experiment.results || null,
      insights: experiment.insights || null,
      decisions: experiment.decisions || null,
      status: experiment.status || 'planned',
      category: experiment.category || 'problem',
    } : {
      title: '',
      hypothesis: '',
      method: '',
      metrics: '',
      results: null,
      insights: null,
      decisions: null,
      status: 'planned',
      category: 'problem',
    }
  });

  useEffect(() => {
    if (isOpen && projectId) {
      fetchRelatedHypotheses();
    }
  }, [isOpen, projectId]);

  const fetchRelatedHypotheses = async () => {
    try {
      setIsLoadingHypotheses(true);
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setRelatedHypotheses(data.map(h => ({
          ...h,
          originalId: h.id,
          id: h.id
        })));
      }
    } catch (error) {
      console.error('Error fetching hypotheses:', error);
    } finally {
      setIsLoadingHypotheses(false);
    }
  };

  React.useEffect(() => {
    setCategory(form.watch('category') || 'problem');
  }, [form.watch('category')]);

  const handleSubmit = async (data: FormData) => {
    try {
      const hypothesisText = data.hypothesis;
      let hypothesis_id = experiment?.hypothesis_id;
      
      const matchingHypothesis = relatedHypotheses.find(h => 
        h.statement.trim().toLowerCase() === hypothesisText.trim().toLowerCase()
      );
      
      if (matchingHypothesis) {
        hypothesis_id = matchingHypothesis.id;
      }
      
      if (isEditing && experiment) {
        const id = experiment.originalId || experiment.id;
        const { error } = await supabase
          .from('experiments')
          .update({
            ...data,
            hypothesis_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        toast({
          title: 'Experiment updated',
          description: 'The experiment has been successfully updated.',
        });
      } else {
        const { error } = await supabase
          .from('experiments')
          .insert({
            ...data,
            hypothesis_id,
            project_id: projectId,
          });

        if (error) throw error;
        toast({
          title: 'Experiment created',
          description: 'A new experiment has been created successfully.',
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

  const applyMethodTemplate = (template: string) => {
    form.setValue('method', template);
  };

  const applyCriteriaTemplate = (template: string) => {
    form.setValue('metrics', template);
  };

  const getExperimentTemplates = () => {
    switch (category) {
      case 'problem':
        return TEMPLATE_PROBLEM_EXPERIMENTS;
      case 'solution':
        return TEMPLATE_SOLUTION_EXPERIMENTS;
      case 'business-model':
        return TEMPLATE_BUSINESS_MODEL_EXPERIMENTS;
      default:
        return TEMPLATE_PROBLEM_EXPERIMENTS;
    }
  };

  const getCriteriaTemplates = () => {
    switch (category) {
      case 'problem':
        return TEMPLATE_PROBLEM_CRITERIA;
      case 'solution':
        return TEMPLATE_SOLUTION_CRITERIA;
      case 'business-model':
        return TEMPLATE_BUSINESS_MODEL_CRITERIA;
      default:
        return TEMPLATE_PROBLEM_CRITERIA;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Experiment' : 'Create New Experiment'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter experiment title" {...field} />
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
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Enter experiment hypothesis" 
                        className="h-24"
                        {...field} 
                      />
                      
                      {relatedHypotheses.length > 0 && (
                        <div className="rounded-md bg-blue-50 p-2 mt-2">
                          <p className="text-xs text-blue-700 mb-1">
                            Existing hypotheses in this project:
                          </p>
                          <div className="max-h-24 overflow-y-auto">
                            {relatedHypotheses.map((hypothesis) => (
                              <button
                                key={hypothesis.id}
                                type="button"
                                className="text-xs bg-white border border-blue-200 rounded px-2 py-1 mr-2 mb-1 hover:bg-blue-100 transition-colors"
                                onClick={() => form.setValue('hypothesis', hypothesis.statement)}
                              >
                                {hypothesis.statement.substring(0, 40)}
                                {hypothesis.statement.length > 40 ? '...' : ''}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                        <SelectValue placeholder="Select experiment category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="problem">Problem Validation</SelectItem>
                      <SelectItem value="solution">Solution Validation</SelectItem>
                      <SelectItem value="business-model">Business Model Validation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Experiment Method</FormLabel>
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
                          {getExperimentTemplates().map((template, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={() => applyMethodTemplate(template)}
                              className="cursor-pointer py-2"
                            >
                              {template}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="How will you conduct this experiment?" 
                      className="h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="metrics"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Success Criteria</FormLabel>
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
                          {getCriteriaTemplates().map((template, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={() => applyCriteriaTemplate(template)}
                              className="cursor-pointer py-2"
                            >
                              {template}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="What defines success for this experiment?" 
                      className="h-24"
                      {...field} 
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
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(form.watch('status') === 'completed') && (
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What were the results of this experiment?" 
                        className="h-24"
                        value={field.value || ''} 
                        onChange={e => field.onChange(e.target.value)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default ExperimentForm;
