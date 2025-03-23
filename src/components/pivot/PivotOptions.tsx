
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';

interface PivotOptionsProps {
  pivotOptions: PivotOption[];
  metrics: Metric[];
  metricTriggers: PivotMetricTrigger[];
  onAddTrigger: (option: PivotOption) => void;
  onEditTrigger: (trigger: PivotMetricTrigger, option: PivotOption) => void;
  onEdit: (option: PivotOption) => void;
  onDelete: (option: PivotOption) => void;
  onCreateNew: () => void;
}

const PivotOptions = ({
  pivotOptions,
  metrics,
  metricTriggers,
  onAddTrigger,
  onEditTrigger,
  onEdit,
  onDelete,
  onCreateNew
}: PivotOptionsProps) => {
  if (pivotOptions.length === 0) {
    return (
      <Card className="p-12 text-center mb-8">
        <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Pivot Options Yet</h3>
        <p className="text-validation-gray-600 mb-6">Plan ahead by identifying potential pivot strategies.</p>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Pivot Option
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {pivotOptions.map((option) => {
        const linkedMetricIds = metricTriggers
          .filter(t => t.pivot_option_id === option.id || t.pivot_option_id === option.originalId)
          .map(t => t.metric_id);
          
        const linkedMetrics = metrics.filter(m => 
          linkedMetricIds.includes(m.id) || (m.originalId && linkedMetricIds.includes(m.originalId))
        );
        
        const optionTriggers = metricTriggers.filter(t => 
          t.pivot_option_id === option.id || t.pivot_option_id === option.originalId
        );
        
        return (
          <Card 
            key={option.id} 
            className="p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-lg text-validation-gray-900">{option.type}</h4>
              <div className="flex space-x-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  option.likelihood === 'high' 
                    ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                    : option.likelihood === 'medium' 
                      ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' 
                      : 'bg-validation-green-50 text-validation-green-700 border border-validation-green-200'
                }`}>
                  {option.likelihood} likelihood
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => onEdit(option)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                  onClick={() => onDelete(option)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
            <p className="text-validation-gray-600 mb-5">{option.description}</p>
            
            {linkedMetrics.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-validation-gray-700">Triggered by metrics:</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onAddTrigger(option)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Trigger
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {linkedMetrics.map(metric => (
                    <Badge 
                      key={metric.id} 
                      variant="outline"
                      className={`${
                        metric.status === 'error' 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : metric.status === 'warning'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : ''
                      }`}
                    >
                      {metric.name}
                    </Badge>
                  ))}
                </div>
                
                {optionTriggers.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                    {optionTriggers.map((trigger, idx) => {
                      const relatedMetric = metrics.find(m => m.id === trigger.metric_id);
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{relatedMetric?.name || 'General'}:</span>
                            <span>{trigger.threshold_type}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => onEditTrigger(trigger, option)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {linkedMetrics.length === 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-validation-gray-700">No metric triggers</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onAddTrigger(option)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Trigger
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add metric triggers to automatically detect when this pivot option should be considered.
                </p>
              </div>
            )}
            
            <div className="bg-validation-gray-50 p-4 rounded-lg border border-validation-gray-200">
              <p className="text-sm font-semibold text-validation-red-600 mb-1">Trigger Point:</p>
              <p className="text-validation-gray-700 text-sm">{option.trigger}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PivotOptions;
