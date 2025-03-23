
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, PlusCircle } from 'lucide-react';

interface EmptyMetricStateProps {
  onAddMetric: () => void;
}

const EmptyMetricState = ({ onAddMetric }: EmptyMetricStateProps) => {
  return (
    <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
      <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
        <BarChart2 className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Metrics Yet</h3>
        <p className="text-gray-500 mb-4 max-w-md">
          Add metrics to track your growth performance and measure progress towards your goals.
        </p>
        <Button onClick={onAddMetric} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add First Metric
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyMetricState;
