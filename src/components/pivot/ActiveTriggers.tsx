
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';

interface ActiveTrigger {
  pivotOption: PivotOption;
  metric: Metric;
  trigger?: PivotMetricTrigger;
}

interface ActiveTriggersProps {
  activeTriggers: ActiveTrigger[];
  onEditTrigger: (trigger: PivotMetricTrigger, pivotOption: PivotOption) => void;
  onReviewOption: (pivotOption: PivotOption) => void;
}

const ActiveTriggers = ({ activeTriggers, onEditTrigger, onReviewOption }: ActiveTriggersProps) => {
  if (activeTriggers.length === 0) return null;

  return (
    <Card className="mb-8 p-6 bg-red-50 border-red-200">
      <h3 className="text-xl font-bold mb-4 text-red-800 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Active Pivot Triggers
      </h3>
      <div className="space-y-4">
        {activeTriggers.map((trigger, index) => (
          <div key={index} className="bg-white p-4 rounded-md border border-red-200">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{trigger.metric.name}</h4>
                  <Badge variant={trigger.metric.status === 'error' ? 'destructive' : 'default'}>
                    {trigger.metric.status === 'error' ? 'Critical' : 'Warning'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Current: {trigger.metric.current || 'N/A'} / Target: {trigger.metric.target}
                </p>
              </div>
              
              <div className="flex items-center">
                <ArrowRight className="h-5 w-5 text-gray-400 mx-2 hidden md:block" />
                <div className="md:ml-4">
                  <h4 className="font-semibold">Suggests Pivot: {trigger.pivotOption.type}</h4>
                  <p className="text-sm text-gray-600 truncate max-w-[300px]">
                    {trigger.pivotOption.description}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => trigger.trigger && onEditTrigger(trigger.trigger, trigger.pivotOption)}
                >
                  Edit Trigger
                </Button>
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => onReviewOption(trigger.pivotOption)}
                >
                  Review
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActiveTriggers;
