
import React from 'react';
import { GrowthMetric } from '@/types/database';
import MetricCard from './MetricCard';

interface MetricCategoryGroupProps {
  category: string;
  metrics: GrowthMetric[];
  onEdit: (metric: GrowthMetric) => void;
  onDelete: (metric: GrowthMetric) => void;
}

const MetricCategoryGroup = ({ 
  category, 
  metrics, 
  onEdit, 
  onDelete 
}: MetricCategoryGroupProps) => {
  const CATEGORY_COLORS = {
    'acquisition': 'bg-blue-500',
    'activation': 'bg-green-500',
    'retention': 'bg-purple-500',
    'referral': 'bg-yellow-500',
    'revenue': 'bg-red-500',
    'custom': 'bg-gray-500'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}></div>
        <h3 className="text-md font-medium capitalize">{category}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard 
            key={metric.id}
            metric={metric}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricCategoryGroup;
