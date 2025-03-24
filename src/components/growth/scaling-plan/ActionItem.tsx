
import React from 'react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScalingPlanAction, ScalingReadinessMetric } from '@/types/database';
import { 
  Check, 
  CalendarIcon, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';

interface ActionItemProps {
  action: ScalingPlanAction;
  metrics: ScalingReadinessMetric[];
  onToggleStatus: (action: ScalingPlanAction) => void;
  onEdit: (action: ScalingPlanAction) => void;
  onDelete: (actionId: string) => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ 
  action, 
  metrics, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}) => {
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
        return <Check className="h-4 w-4 text-yellow-600" />;
      default:
        return <Check className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AccordionItem key={action.id} value={action.id} className="border-b">
      <AccordionTrigger className="py-3 px-2 data-[state=open]:bg-gray-50">
        <div className="flex items-center mr-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(action);
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
            onClick={() => onEdit(action)}
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-600 hover:text-red-700" 
            onClick={() => onDelete(action.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ActionItem;
