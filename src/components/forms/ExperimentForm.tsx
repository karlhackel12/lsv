
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
import { ChevronDown, Lightbulb, FlaskConical, Target, ArrowRight, ClipboardCheck } from 'lucide-react';
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
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);

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

  // Find selected hypothesis when form loads
  useEffect(() => {
    if (experiment?.hypothesis && relatedHypotheses.length > 0) {
      const found = relatedHypotheses.find(h => 
        h.statement.trim().toLowerCase() === experiment.hypothesis.trim().toLowerCase()
      );
      if (found) {
        setSelectedHypothesis(found);
      }
    }
  }, [experiment, relatedHypotheses]);

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

  const applyHypothesis = (hypothesis: Hypothesis) => {
    form.setValue('hypothesis', hypothesis.statement);
    setSelectedHypothesis(hypothesis);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'problem':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'solution':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'business-model':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fixed function to get the correct status color indicator
  const getHypothesisStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500';
      case 'invalid':
        return 'bg-red-500';
      case 'validating':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-500" />
            {isEditing ? 'Edit Experiment' : 'Create New Experiment'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Experiment Details</h3>
              
              <div className="space-y-4">
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
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${getCategoryColor(category)}`}>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                <Target className="h-4 w-4" />
                Hypothesis
              </h3>
              
              <FormField
                control={form.control}
                name="hypothesis"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-2">
                        <Textarea 
                          placeholder="Enter experiment hypothesis" 
                          className="h-24 bg-white/80"
                          {...field} 
                        />
                        
                        {relatedHypotheses.length > 0 && (
                          <div className="rounded-md bg-blue-50 p-3 mt-2">
                            <p className="text-xs text-blue-700 mb-2 font-medium">
                              Connect to an existing hypothesis:
                            </p>
                            <div className="max-h-36 overflow-y-auto space-y-2">
                              {relatedHypotheses.map((hypothesis) => (
                                <button
                                  key={hypothesis.id}
                                  type="button"
                                  className={`text-xs p-2 rounded w-full text-left transition-colors flex items-center gap-2
                                    ${selectedHypothesis?.id === hypothesis.id 
                                      ? 'bg-blue-200 border border-blue-300' 
                                      : 'bg-white border border-blue-100 hover:bg-blue-100'}`}
                                  onClick={() => applyHypothesis(hypothesis)}
                                >
                                  <div className={`w-2 h-2 rounded-full ${getHypothesisStatusColor(hypothesis.status)}`} />
                                  <span className="line-clamp-2">{hypothesis.statement}</span>
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
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-blue-700 font-medium flex items-center gap-1 m-0">
                        <FlaskConical className="h-4 w-4" />
                        Experiment Method
                      </FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 bg-white">
                            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
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
                    <p className="text-xs text-blue-600 mb-2">Describe how you will conduct this experiment</p>
                    <FormControl>
                      <Textarea 
                        placeholder="How will you conduct this experiment?" 
                        className="h-24 bg-white/80"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <FormField
                control={form.control}
                name="metrics"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-green-700 font-medium flex items-center gap-1 m-0">
                        <Target className="h-4 w-4" />
                        Success Criteria
                      </FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 bg-white">
                            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
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
                    <p className="text-xs text-green-600 mb-2">Define what will make this experiment successful</p>
                    <FormControl>
                      <Textarea 
                        placeholder="What defines success for this experiment?" 
                        className="h-24 bg-white/80"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <ClipboardCheck className="h-4 w-4" />
                      Status
                    </FormLabel>
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
                        <SelectItem value="planned">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                            Planned
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(form.watch('status') === 'completed') && (
              <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="text-sm font-medium text-amber-800 mb-2">Experiment Results & Learning</h3>
                
                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-700">Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What were the results of this experiment?" 
                          className="h-24 bg-white/80"
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
                  name="insights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-700">Insights</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What insights did you gain from this experiment?" 
                          className="h-24 bg-white/80"
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
                  name="decisions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-700">Decisions & Next Steps</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What decisions will you make based on these results?" 
                          className="h-24 bg-white/80"
                          value={field.value || ''} 
                          onChange={e => field.onChange(e.target.value)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter className="flex justify-between pt-2 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="gap-1">
                {isEditing ? 'Update' : 'Create'} 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExperimentForm;
