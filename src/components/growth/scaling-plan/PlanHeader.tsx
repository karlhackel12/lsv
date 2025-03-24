
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ScalingPlan } from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlanHeaderProps {
  currentPlan: ScalingPlan;
  plans: ScalingPlan[];
  onChangePlan: (planId: string) => void;
  onEditPlan: () => void;
  onDeletePlan: (planId: string) => void;
}

const PlanHeader: React.FC<PlanHeaderProps> = ({
  currentPlan,
  plans,
  onChangePlan,
  onEditPlan,
  onDeletePlan
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold">{currentPlan.title}</h2>
        <p className="text-gray-500">{currentPlan.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Select
          value={currentPlan.id}
          onValueChange={(value) => onChangePlan(value)}
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
          onClick={onEditPlan}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="destructive" 
          size="icon"
          onClick={() => onDeletePlan(currentPlan.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlanHeader;
