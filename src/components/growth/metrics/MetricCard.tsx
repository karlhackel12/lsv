
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { GrowthMetric } from '@/types/database';

interface MetricCardProps {
  metric: GrowthMetric;
  onEdit: (metric: GrowthMetric) => void;
  onDelete: (metric: GrowthMetric) => void;
}

const MetricCard = ({ metric, onEdit, onDelete }: MetricCardProps) => {
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'ratio':
        return value.toFixed(2);
      case 'time':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const STATUS_COLORS = {
    'on-track': 'bg-green-500',
    'at-risk': 'bg-yellow-500',
    'off-track': 'bg-red-500'
  };

  return (
    <Card key={metric.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => onEdit(metric)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => onDelete(metric)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        {metric.description && (
          <CardDescription className="text-xs">{metric.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="flex justify-between items-baseline mb-1">
          <div className="text-2xl font-semibold">
            {formatValue(metric.current_value, metric.unit)}
          </div>
          <div className="text-sm text-gray-500">
            Target: {formatValue(metric.target_value, metric.unit)}
          </div>
        </div>
        <Progress 
          value={calculateProgress(metric.current_value, metric.target_value)} 
          className="h-2" 
        />
      </CardContent>
      <CardFooter className="pt-2 pb-3">
        <div className="flex items-center gap-1 text-xs">
          <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[metric.status as keyof typeof STATUS_COLORS]}`}></div>
          <span className="capitalize">{metric.status}</span>
          {metric.current_value < metric.target_value ? (
            <TrendingUp className="h-3 w-3 ml-auto text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 ml-auto text-gray-400" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MetricCard;
