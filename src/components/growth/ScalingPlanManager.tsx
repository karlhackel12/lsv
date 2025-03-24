
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ScalingPlan, 
  ScalingPlanAction, 
  ScalingReadinessMetric, 
  GrowthModel
} from '@/types/database';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Import the new component files
import EmptyPlanState from './scaling-plan/EmptyPlanState';
import PlanForm from './scaling-plan/PlanForm';
import ActionForm from './scaling-plan/ActionForm';
import ActionList from './scaling-plan/ActionList';
import PlanProgress from './scaling-plan/PlanProgress';
import PlanHeader from './scaling-plan/PlanHeader';

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

  useEffect(() => {
    if (growthModel) {
      fetchPlans();
    }
  }, [growthModel]);

  useEffect(() => {
    if (currentPlan) {
      fetchActions();
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
      setEditingAction(null);
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

  const handlePlanSelect = (planId: string) => {
    const selected = plans.find(p => p.id === planId);
    if (selected) setCurrentPlan(selected);
  };

  return (
    <div className="space-y-6">
      {!isLoading && plans.length === 0 && !isEditingPlan && (
        <EmptyPlanState onCreatePlan={() => setIsEditingPlan(true)} />
      )}
      
      {isEditingPlan && (
        <PlanForm
          currentPlan={currentPlan}
          projectId={projectId}
          growthModelId={growthModel.id}
          onCancel={() => setIsEditingPlan(false)}
          onSubmit={currentPlan ? handleUpdatePlan : handleCreatePlan}
        />
      )}
      
      {!isLoading && currentPlan && !isEditingPlan && (
        <>
          <PlanHeader
            currentPlan={currentPlan}
            plans={plans}
            onChangePlan={handlePlanSelect}
            onEditPlan={() => setIsEditingPlan(true)}
            onDeletePlan={handleDeletePlan}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Action Plan</CardTitle>
                  <Button size="sm" onClick={() => {
                    setIsAddingAction(true);
                    setEditingAction(null);
                  }}>
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
                  <ActionForm
                    action={editingAction}
                    scalingPlanId={currentPlan.id}
                    metrics={metrics}
                    onCancel={() => {
                      setIsAddingAction(false);
                      setEditingAction(null);
                    }}
                    onSubmit={editingAction ? handleUpdateAction : handleCreateAction}
                  />
                ) : (
                  <ActionList
                    actions={actions}
                    metrics={metrics}
                    onAddAction={() => setIsAddingAction(true)}
                    onToggleStatus={handleToggleActionStatus}
                    onEdit={handleEditAction}
                    onDelete={handleDeleteAction}
                  />
                )}
              </CardContent>
            </Card>
            
            <PlanProgress
              plan={currentPlan}
              actions={actions}
              onActivatePlan={handleMarkPlanActive}
            />
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Grid with action cards for quick navigation could go here */}
          </div>
        </>
      )}
    </div>
  );
};

export default ScalingPlanManager;
