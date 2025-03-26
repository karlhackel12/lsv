
import React from 'react';
import EmptyExperimentState from './EmptyExperimentState';
import { Experiment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Beaker } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';

interface ExperimentListProps {
  experiments: Experiment[];
  refreshData: () => void;
  onEdit: (experiment: Experiment) => void;
  onDelete?: (experiment: Experiment) => void;
  onCreateNew: () => void;
  onViewDetail: (experiment: Experiment) => void;
  isGrowthExperiment?: boolean;
}

const ExperimentList = ({ 
  experiments, 
  refreshData, 
  onEdit, 
  onDelete, 
  onCreateNew,
  onViewDetail,
  isGrowthExperiment = false
}: ExperimentListProps) => {
  if (experiments.length === 0) {
    return (
      <EmptyExperimentState 
        onCreateNew={onCreateNew} 
        isGrowthExperiment={isGrowthExperiment}
      />
    );
  }

  const TypeIcon = isGrowthExperiment ? TrendingUp : Beaker;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Hypothesis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Results</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.map((experiment) => (
            <TableRow key={experiment.id} className="cursor-pointer hover:bg-gray-50" onClick={() => onViewDetail(experiment)}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <TypeIcon className="h-4 w-4 text-blue-500 mr-2" />
                  {experiment.title}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={experiment.category === 'problem' ? 'secondary' : 'outline'} className="capitalize">
                  {experiment.category || 'problem'}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate">{experiment.hypothesis}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={experiment.status as any} />
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate">{experiment.method}</p>
              </TableCell>
              <TableCell>
                {experiment.results ? (
                  <p className="truncate max-w-xs">{experiment.results}</p>
                ) : (
                  <span className="text-gray-400">No results yet</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the row click from triggering
                    onViewDetail(experiment);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View details</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExperimentList;
