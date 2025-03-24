
import React from 'react';
import { ScalingReadinessMetric, GrowthMetric } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, LinkIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ScalingReadinessTableProps {
  metrics: ScalingReadinessMetric[];
  onEdit: (metric: ScalingReadinessMetric) => void;
  onDelete: (metricId: string) => void;
  linkedGrowthMetrics: Record<string, GrowthMetric[]>;
}

const ScalingReadinessTable: React.FC<ScalingReadinessTableProps> = ({
  metrics,
  onEdit,
  onDelete,
  linkedGrowthMetrics
}) => {
  const getProgressValue = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-amber-500';
      case 'at-risk':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Metric</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Linked Growth Metrics</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => {
            const progressValue = getProgressValue(Number(metric.current_value), Number(metric.target_value));
            const linkedMetrics = linkedGrowthMetrics[metric.id] || [];
            
            return (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{metric.name}</span>
                    {metric.description && (
                      <span className="text-xs text-gray-500 mt-1">{metric.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{metric.category}</Badge>
                </TableCell>
                <TableCell>
                  {metric.current_value} {metric.unit}
                </TableCell>
                <TableCell>
                  {metric.target_value} {metric.unit}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="flex flex-col gap-1">
                    <Progress value={progressValue} className={getStatusColor(metric.status)} />
                    <span className="text-xs text-gray-500">{progressValue}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {linkedMetrics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {linkedMetrics.map((growthMetric) => (
                        <Badge key={growthMetric.id} variant="secondary" className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          {growthMetric.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(metric)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(metric.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ScalingReadinessTable;
