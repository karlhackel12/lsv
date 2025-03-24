
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GrowthMetric, ScalingReadinessMetric, SCALING_METRIC_CATEGORIES } from '@/types/database';
import { Edit2, Trash2, TrendingUp, Link2Off, Link2 } from 'lucide-react';

interface MetricCardProps {
  metric: GrowthMetric;
  scalingMetric?: ScalingReadinessMetric | null;
  onEdit: (metric: GrowthMetric) => void;
  onDelete: (metric: GrowthMetric) => void;
}

const MetricCard = ({ 
  metric, 
  scalingMetric,
  onEdit, 
  onDelete 
}: MetricCardProps) => {
  // Calculate progress
  const progress = metric.target_value > 0 
    ? Math.min(Math.round((metric.current_value / metric.target_value) * 100), 100) 
    : 0;
  
  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'off-track': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format unit display
  const formatValue = (value: number) => {
    switch (metric.unit) {
      case 'percentage': return `${value}%`;
      case 'currency': return `$${value}`;
      case 'count': return value.toLocaleString();
      case 'ratio': return `${value}:1`;
      case 'time': return `${value} days`;
      default: return value.toLocaleString();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium">{metric.name}</h3>
            {metric.description && (
              <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
            )}
          </div>
          <Badge className={getStatusColor(metric.status)}>
            {metric.status.replace('-', ' ')}
          </Badge>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">Current</span>
          <span className="text-sm text-gray-500">Target</span>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span className="font-medium">{formatValue(metric.current_value)}</span>
          <span className="font-medium">{formatValue(metric.target_value)}</span>
        </div>

        <Progress value={progress} className="h-2 mb-4" />
        
        {scalingMetric && (
          <div className="flex items-center text-xs text-gray-600 mt-4">
            <Link2 className="h-3 w-3 mr-1" />
            <span>Linked to scaling metric: </span>
            <Badge variant="outline" className="ml-1 font-normal bg-blue-50">
              {scalingMetric.name} ({SCALING_METRIC_CATEGORIES[scalingMetric.category as keyof typeof SCALING_METRIC_CATEGORIES] || scalingMetric.category})
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 px-6 py-3">
        <div className="flex justify-end gap-2 w-full">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(metric)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => onEdit(metric)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetricCard;
