
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Metric } from '@/types/database';

interface MetricsAtRiskProps {
  metrics: Metric[];
  hasActiveTriggers: boolean;
}

const MetricsAtRisk = ({ metrics, hasActiveTriggers }: MetricsAtRiskProps) => {
  // Only show metrics at risk if there are no active triggers
  if (hasActiveTriggers || metrics.length === 0) return null;
  
  return (
    <Card className="mb-8 p-6 bg-yellow-50 border-yellow-200">
      <h3 className="text-xl font-bold mb-4 text-yellow-800 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Metrics Approaching Pivot Triggers
      </h3>
      <div className="space-y-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-white p-4 rounded-md border border-yellow-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{metric.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Current: {metric.current || 'N/A'} / Target: {metric.target}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                metric.status === 'error' 
                  ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                  : 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200'
              }`}>
                {metric.status === 'error' ? 'Critical' : 'Warning'}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Recommended Action:</p>
              <p className="text-sm text-gray-600">
                {metric.status === 'error' 
                  ? 'Schedule an immediate pivot planning session to evaluate options.' 
                  : 'Monitor closely and prepare contingency plans.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MetricsAtRisk;
