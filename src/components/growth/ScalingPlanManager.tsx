import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ScalingPlan, 
  ScalingPlanAction, 
  ScalingReadinessMetric, 
  GrowthModel,
  SCALING_METRIC_CATEGORIES
} from '@/types/database';
import { 
  Rocket, 
  PlusCircle,
  Check,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScalingPlanManagerProps {
  projectId: string;
  growthModel: GrowthModel;
  metrics: ScalingReadinessMetric[];
  refreshData: () => Promise<void>;
}

const ScalingPlanManager: React.FC<ScalingPlanManagerProps> = ({ 
  projectId, 
  growthModel,
  metrics,
  refreshData
}) => {
  const [plans, setPlans] = useState<ScalingPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ScalingPlan | null>(null);
  const [actions, setActions] = useState<ScalingPlanAction[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [editingAction, setEditingAction] = useState<ScalingPlanAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const planForm = useForm<ScalingPlan>({
    defaultValues: {
      id: '',
      project_id: projectId,
      growth_model_id: growthModel.id,
      title: '',
      description: '',
      overall_readiness: 0,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScalingPlan,
  });

  const actionForm = useForm<ScalingPlanAction>({
    defaultValues: {
      id: '',
      scaling_plan_id: '',
      title: '',
      description: '',
      metric_id: null,
      priority: 'medium',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScalingPlanAction,
  });

  useEffect(() => {
    if (growthModel) {
      fetchPlans();
    }
  }, [growthModel]);

  useEffect(() => {
    if (currentPlan) {
      fetchActions();
      
      planForm.reset({
        ...currentPlan,
      });
    }
  }, [currentPlan]);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('scaling_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPlans(data);
      
      if (data.length > 0) {
        setCurrentPlan(data[0]);
      }
    } catch (err) {
      console.error('Error fetching scaling plans:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scaling plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActions = async () => {
    if (!currentPlan) return;
    
    try {
      const { data, error } = await supabase
        .from('scaling_plan_actions')
        .select('*')
        .eq('scaling_plan_id', currentPlan.id)
        .order('priority', { ascending: false });
        
      if (error) throw error;
      
      setActions(data);
    } catch (err) {
      console.error('Error fetching plan actions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load plan actions',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePlan = async (data: ScalingPlan) => {
    try {
      // Calculate overall readiness from metrics
      const readiness = Math.round(
        metrics.reduce((sum, metric) => {
          const progress = Math.min((metric.current_value / metric.target_value) * 100, 100);
          return sum + (progress * metric.importance);
        }, 0) / Math.max(1, metrics.reduce((sum, m) => sum + m.importance, 0))
      );
      
      const { data: newPlan, error } = await supabase
        .from('scaling_plans')
        .insert({
          project_id: projectId,
          growth_model_id: growthModel.id,
          title: data.title,
          description: data.description,
          overall_readiness: readiness,
          status: 'draft'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Plan created',
        description: 'Your scaling plan has been created',
      });
      
      await fetchPlans();
      setCurrentPlan(newPlan);
      setIsEditingPlan(false);
      
      // Generate initial recommended actions
      await generateRecommendedActions(newPlan.id);
    } catch (error) {
      console.error('Error creating scaling plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create scaling plan',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePlan = async (data: ScalingPlan) => {
    if (!currentPlan) return;
    
    try {
      const { error } = await supabase
        .from('scaling_plans')
        .update({
          title: data.title,
          description: data.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPlan.id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan updated',
        description: 'Your scaling plan has been updated',
      });
      
      await fetchPlans();
      setIsEditingPlan(false);
    } catch (error) {
      console.error('Error updating scaling plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update scaling plan',
        variant: 'destructive',
      });
    }
  };

  const handleCreateAction = async (data: ScalingPlanAction) => {
    if (!currentPlan) return;
    
    try {
      const { error } = await supabase
        .from('scaling_plan_actions')
        .insert({
          scaling_plan_id: currentPlan.id,
          title: data.title,
          description: data.description,
          metric_id: data.metric_id || null,
          priority: data.priority,
          status: 'pending',
          due_date: data.due_date
        });
        
      if (error) throw error;
      
      toast({
        title: 'Action added',
        description: 'The action item has been added to your plan',
      });
      
      await fetchActions();
      setIsAddingAction(false);
      actionForm.reset({
        id: '',
        scaling_plan_id: currentPlan.id,
        title: '',
        description: '',
        metric_id: null,
        priority: 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add action item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAction = async (data: ScalingPlanAction) => {
    if (!editingAction) return;
    
    try {
      const { error } = await supabase
        .from('scaling_plan_actions')
        .update({
          title: data.title,
          description: data.description,
          metric_id: data.metric_id || null,
          priority: data.priority,
          due_date: data.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAction.id);
        
      if (error) throw error;
      
      toast({
        title: 'Action updated',
        description: 'The action item has been updated',
      });
      
      await fetchActions();
      setIsAddingAction(false);
      setEditingAction(null);
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action item',
        variant: 'destructive',
      });
    }
  };

  const handleEditAction = (action: ScalingPlanAction) => {
    setEditingAction(action);
    setIsAddingAction(true);
    actionForm.reset({
      ...action,
    });
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('scaling_plan_actions')
        .delete()
        .eq('id', actionId);
        
      if (error) throw error;
      
      toast({
        title: 'Action deleted',
        description: 'The action item has been removed from your plan',
      });
      
      await fetchActions();
    } catch (error) {
      console.error('Error deleting action item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete action item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActionStatus = async (action: ScalingPlanAction) => {
    const newStatus = action.status === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('scaling_plan_actions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', action.id);
        
      if (error) throw error;
      
      await fetchActions();
    } catch (error) {
      console.error('Error updating action status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action status',
        variant: 'destructive',
      });
    }
  };

  const handleMarkPlanActive = async () => {
    if (!currentPlan) return;
    
    try {
      const { error } = await supabase
        .from('scaling_plans')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPlan.id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan activated',
        description: 'Your scaling plan is now active',
      });
      
      await fetchPlans();
    } catch (error) {
      console.error('Error activating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      // First delete all associated actions
      const { error: actionsError } = await supabase
        .from('scaling_plan_actions')
        .delete()
        .eq('scaling_plan_id', planId);
        
      if (actionsError) throw actionsError;
      
      // Then delete the plan
      const { error } = await supabase
        .from('scaling_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      toast({
        title: 'Plan deleted',
        description: 'The scaling plan has been deleted',
      });
      
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  const generateRecommendedActions = async (planId: string) => {
    // Get metrics that need improvement
    const metricsNeedingImprovement = metrics.filter(m => 
      (m.current_value / m.target_value) < 0.8
    );
    
    if (metricsNeedingImprovement.length === 0) return;
    
    try {
      // Create action items based on metrics that need improvement
      const actions = metricsNeedingImprovement.map(metric => {
        let title = '';
        let description = '';
        
        switch (metric.category) {
          case 'unit_economics':
            title = `Improve ${metric.name}`;
            description = `Work on strategies to bring ${metric.name} from ${metric.current_value} to the target of ${metric.target_value}`;
            break;
          case 'retention':
            title = `Boost ${metric.name}`;
            description = `Implement retention strategies to increase ${metric.name}`;
            break;
          case 'acquisition':
            title = `Optimize acquisition channels`;
            description = `Test and validate more acquisition channels to improve ${metric.name}`;
            break;
          case 'team':
            title = `Build team capacity`;
            description = `Strengthen the team to prepare for scaling`;
            break;
          case 'infrastructure':
            title = `Scale infrastructure`;
            description = `Ensure infrastructure can handle growth`;
            break;
          default:
            title = `Improve ${metric.name}`;
            description = `Work to bring ${metric.name} from ${metric.current_value} to the target of ${metric.target_value}`;
        }
        
        const priority = (metric.current_value / metric.target_value) < 0.5 ? 'high' : 'medium';
        
        return {
          scaling_plan_id: planId,
          title,
          description,
          metric_id: metric.id,
          priority,
          status: 'pending'
        };
      });
      
      if (actions.length > 0) {
        const { error } = await supabase
          .from('scaling_plan_actions')
          .insert(actions);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error generating recommended actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommended actions',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateProgress = () => {
    if (actions.length === 0) return 0;
    
    const completed = actions.filter(a => a.status === 'completed').length;
    return Math.round((completed / actions.length) * 100);
  };

  return (
    <div className="space-y-6">
      {!isLoading && plans.length === 0 && !isEditingPlan && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rocket className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scaling Plan Yet</h3>
            <p className="text-center text-gray-500 mb-6 max-w-md">
              Create a structured scaling plan to prepare your startup for growth
            </p>
            <Button onClick={() => setIsEditingPlan(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Scaling Plan
            </Button>
          </CardContent>
        </Card>
      )}
      
      {isEditingPlan && (
        <Card>
          <CardHeader>
            <CardTitle>{currentPlan ? 'Edit Scaling Plan' : 'Create New Scaling Plan'}</CardTitle>
            <CardDescription>
              Define your plan for scaling your startup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...planForm}>
              <form 
                onSubmit={planForm.handleSubmit(currentPlan ? handleUpdatePlan : handleCreatePlan)} 
                className="space-y-6"
              >
                <FormField
                  control={planForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Q4 2023 Scaling Strategy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={planForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the goals and scope of this scaling plan" 
                          className="resize-none min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditingPlan(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {currentPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && currentPlan && !isEditingPlan && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{currentPlan.title}</h2>
              <p className="text-gray-500">{currentPlan.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={currentPlan.id}
                onValueChange={(value) => {
                  const selected = plans.find(p => p.id === value);
                  if (selected) setCurrentPlan(selected);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsEditingPlan(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => handleDeletePlan(currentPlan.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Action Plan</CardTitle>
                  <Button size="sm" onClick={() => setIsAddingAction(true)}>
                    <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                    Add Action
                  </Button>
                </div>
                <CardDescription>
                  Tasks and initiatives to become scaling-ready
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {isAddingAction ? (
                  <Form {...actionForm}>
                    <form 
                      onSubmit={actionForm.handleSubmit(editingAction ? handleUpdateAction : handleCreateAction)} 
                      className="space-y-4"
                    >
                      <FormField
                        control={actionForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Improve LTV:CAC Ratio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={actionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what needs to be done" 
                                className="resize-none min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={actionForm.control}
                          name="metric_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Related Metric (Optional)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value?.toString() || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a metric" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  {metrics.map(metric => (
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
                        
                        <FormField
                          control={actionForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
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
                      </div>
                      
                      <FormField
                        control={actionForm.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
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
                                  onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingAction(false);
                            setEditingAction(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingAction ? 'Update Action' : 'Add Action'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : actions.length > 0 ? (
                  <div className="space-y-4">
                    <Accordion type="multiple" className="w-full">
                      {actions.map(action => (
                        <AccordionItem key={action.id} value={action.id} className="border-b">
                          <AccordionTrigger className="py-3 px-2 data-[state=open]:bg-gray-50">
                            <div className="flex items-center mr-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActionStatus(action);
                                }}
                                className={cn(
                                  "h-4 w-4 rounded border mr-2 flex items-center justify-center",
                                  action.status === 'completed' 
                                    ? "bg-primary border-primary" 
                                    : "border-gray-300"
                                )}
                              >
                                {action.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                              </button>
                              <span className={cn(
                                "font-medium",
                                action.status === 'completed' && "line-through text-gray-500"
                              )}>
                                {action.title}
                              </span>
                            </div>
                            <div className="flex items-center ml-auto mr-2 space-x-2">
                              <Badge className={`ml-auto ${getPriorityColor(action.priority)}`}>
                                {action.priority}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-8 pb-4 pt-2">
                            <div className="text-sm text-gray-600 mb-3">
                              {action.description}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              {action.metric_id && (
                                <Badge variant="outline">
                                  Related to: {
                                    metrics.find(m => m.id === action.metric_id)?.name || 'Unknown metric'
                                  }
                                </Badge>
                              )}
                              
                              {action.due_date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  Due: {format(new Date(action.due_date), "MMM d, yyyy")}
                                </Badge>
                              )}
                              
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getStatusIcon(action.status)}
                                Status: {action.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-end space-x-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEditAction(action)}
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-700" 
                                onClick={() => handleDeleteAction(action.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Action Items</h3>
                    <p className="text-gray-500 mb-4">
                      Add action items to your scaling plan to track progress
                    </p>
                    <Button onClick={() => setIsAddingAction(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Action Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Progress</CardTitle>
                {currentPlan.status === 'draft' ? (
                  <Badge variant="outline" className="w-fit">Draft</Badge>
                ) : (
                  <Badge className="bg-green-600 w-fit">Active</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Check className="h-3.5 w-3.5 text-green-600 mr-1" />
                      Completed
                    </span>
                    <span>
                      {actions.filter(a => a.status === 'completed').length} / {actions.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 text-yellow-600 mr-1" />
                      Pending
                    </span>
                    <span>
                      {actions.filter(a => a.status === 'pending').length} / {actions.length}
                    </span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  {Object.entries(
                    actions.reduce((acc, action) => {
                      const key = action.priority as string;
                      if (!acc[key]) acc[key] = 0;
                      acc[key]++;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([priority, count]) => (
                    <div key={priority} className="flex justify-between text-sm">
                      <span className={`capitalize ${getPriorityColor(priority)}`}>{priority}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                
                {currentPlan.status === 'draft' && actions.length > 0 && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleMarkPlanActive}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Activate Plan
                  </Button>
                )}
                
                {actions.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    Add actions to track plan progress
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t pt-4 block">
                <div className="
