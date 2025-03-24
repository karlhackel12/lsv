
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { GrowthMetric } from '@/types/database';

interface DerivedMetricsCardProps {
  derivedMetrics: GrowthMetric[];
  metrics: GrowthMetric[];
}

const DerivedMetricsCard = ({ derivedMetrics, metrics }: DerivedMetricsCardProps) => {
  if (derivedMetrics.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
          Key Growth Indicators
        </CardTitle>
        <CardDescription>
          Essential metrics for assessing your growth model
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics
            .filter(m => 
              m.name.toLowerCase().includes('cac') || 
              m.name.toLowerCase().includes('ltv') || 
              m.name.toLowerCase().includes('conversion rate')
            )
            .map(metric => (
              <div 
                key={metric.id} 
                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="text-sm text-gray-500 mb-1">{metric.name}</div>
                <div className="text-xl font-semibold">
                  {metric.unit === 'currency' && '$'}
                  {metric.current_value}
                  {metric.unit === 'percentage' && '%'}
                </div>
                <div className={`text-xs mt-1 font-medium ${
                  metric.current_value >= metric.target_value ? 'text-green-600' : 'text-amber-600'
                }`}>
                  Target: {metric.unit === 'currency' && '$'}{metric.target_value}{metric.unit === 'percentage' && '%'}
                </div>
              </div>
            ))}
          
          {derivedMetrics.map(metric => (
            <div 
              key={metric.id}
              className="p-3 bg-blue-50 rounded-lg border border-blue-100"
            >
              <div className="text-sm text-blue-500 mb-1">{metric.name}</div>
              <div className="text-xl font-semibold">
                {metric.current_value.toFixed(1)}:1
              </div>
              <div className={`text-xs mt-1 font-medium ${
                metric.current_value >= 3 ? 'text-green-600' : 
                metric.current_value >= 2 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {metric.current_value >= 3 ? 'Excellent' : 
                 metric.current_value >= 2 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-gray-500">
        Derived metrics like LTV:CAC ratio are calculated automatically from your core metrics
      </CardFooter>
    </Card>
  );
};

export default DerivedMetricsCard;
