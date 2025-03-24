
import React from 'react';
import { Check, Clock, Rocket } from 'lucide-react';
import { ScalingPlan, ScalingPlanAction } from '@/types/database';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PlanProgressProps {
  plan: ScalingPlan;
  actions: ScalingPlanAction[];
  onActivatePlan: () => Promise<void>;
}

const PlanProgress: React.FC<PlanProgressProps> = ({
  plan,
  actions,
  onActivatePlan
}) => {
  const calculateProgress = () => {
    if (actions.length === 0) return 0;
    
    const completed = actions.filter(a => a.status === 'completed').length;
    return Math.round((completed / actions.length) * 100);
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

  const priorityCounts = actions.reduce((acc, action) => {
    const key = action.priority as string;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan Progress</CardTitle>
        {plan.status === 'draft' ? (
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
          
          {Object.entries(priorityCounts).map(([priority, count]) => (
            <div key={priority} className="flex justify-between text-sm">
              <span className={`capitalize ${getPriorityColor(priority)}`}>{priority}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
        
        {plan.status === 'draft' && actions.length > 0 && (
          <Button 
            className="w-full mt-4" 
            onClick={onActivatePlan}
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
        <div className="text-xs text-gray-500">
          Last updated: {new Date(plan.updated_at).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlanProgress;
