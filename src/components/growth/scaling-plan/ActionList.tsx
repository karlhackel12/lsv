
import React from 'react';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import { ScalingPlanAction, ScalingReadinessMetric } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import ActionItem from './ActionItem';

interface ActionListProps {
  actions: ScalingPlanAction[];
  metrics: ScalingReadinessMetric[];
  onAddAction: () => void;
  onToggleStatus: (action: ScalingPlanAction) => void;
  onEdit: (action: ScalingPlanAction) => void;
  onDelete: (actionId: string) => void;
}

const ActionList: React.FC<ActionListProps> = ({
  actions,
  metrics,
  onAddAction,
  onToggleStatus,
  onEdit,
  onDelete
}) => {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Action Items</h3>
        <p className="text-gray-500 mb-4">
          Add action items to your scaling plan to track progress
        </p>
        <Button onClick={onAddAction}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add First Action Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {actions.map(action => (
          <ActionItem
            key={action.id}
            action={action}
            metrics={metrics}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default ActionList;
