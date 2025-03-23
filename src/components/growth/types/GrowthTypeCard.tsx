
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GrowthMetric } from '@/types/database';
import { LucideIcon } from 'lucide-react';

interface GrowthTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  metrics: GrowthMetric[];
  badgeColor: string;
}

const GrowthTypeCard = ({ 
  title, 
  description, 
  icon, 
  metrics, 
  badgeColor 
}: GrowthTypeCardProps) => {
  // Helper function to calculate progress
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Helper function to format values
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {icon}
            {title}
          </CardTitle>
          <span className={`text-xs px-2 py-1 ${badgeColor} rounded-full`}>
            {metrics.length} metrics
          </span>
        </div>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {metrics.length > 0 ? (
          <div className="space-y-4">
            {metrics.map(metric => (
              <div key={metric.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-sm">
                  <span>{metric.name}</span>
                  <span className="font-medium">
                    {formatValue(metric.current_value, metric.unit)} / {formatValue(metric.target_value, metric.unit)}
                  </span>
                </div>
                <Progress 
                  value={calculateProgress(metric.current_value, metric.target_value)} 
                  className="h-1.5" 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            {icon && React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 mx-auto mb-2 text-gray-400" })}
            <p>No {title.toLowerCase()} metrics defined yet</p>
            <p className="text-xs mt-1">Add metrics in the "Metrics" tab</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowthTypeCard;
