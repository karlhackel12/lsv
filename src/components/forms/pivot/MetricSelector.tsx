
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtendedMetric } from './types';

interface MetricSelectorProps {
  metrics: ExtendedMetric[];
  selectedMetricId: string;
  onMetricChange: (value: string) => void;
}

const MetricSelector = ({ metrics, selectedMetricId, onMetricChange }: MetricSelectorProps) => {
  return (
    <div className="mt-4">
      <Label htmlFor="metric" className="text-sm font-medium">Linked Metric</Label>
      <div className="mt-1.5">
        <Select value={selectedMetricId} onValueChange={onMetricChange}>
          <SelectTrigger id="metric">
            <SelectValue placeholder="Select a metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {metrics.map((metric) => (
              <SelectItem key={metric.id} value={metric.id || ''}>
                {metric.name} - {metric.description || 'No description'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MetricSelector;
