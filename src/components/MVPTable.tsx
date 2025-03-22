
import React, { useState, useMemo } from 'react';
import { MvpFeature, TEMPLATE_FEATURE_STATUS } from '@/types/database';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MVPTableProps {
  features: MvpFeature[];
  onEdit: (feature: MvpFeature) => void;
  onDelete: (feature: MvpFeature) => void;
  isLoading?: boolean;
}

type SortField = 'feature' | 'priority' | 'status' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const MVPTable: React.FC<MVPTableProps> = ({ features, onEdit, onDelete, isLoading = false }) => {
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      let compareResult = 0;
      
      if (sortField === 'updated_at') {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        compareResult = dateA - dateB;
      } else if (sortField === 'priority') {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        compareResult = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else if (sortField === 'status') {
        const statusOrder: Record<string, number> = { 'in-progress': 3, 'planned': 2, 'completed': 1, 'post-mvp': 0 };
        compareResult = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      } else {
        // String comparison for other fields (like 'feature')
        compareResult = String(a[sortField]).localeCompare(String(b[sortField]));
      }

      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [features, sortField, sortDirection]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading features...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">
              <Button variant="ghost" onClick={() => handleSort('feature')} className="flex items-center">
                Feature Name
                <ArrowUpDown size={14} className={cn(
                  "ml-2",
                  sortField === 'feature' && "text-primary"
                )} />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">
              <Button variant="ghost" onClick={() => handleSort('priority')} className="flex items-center">
                Priority
                <ArrowUpDown size={14} className={cn(
                  "ml-2",
                  sortField === 'priority' && "text-primary"
                )} />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">
              <Button variant="ghost" onClick={() => handleSort('status')} className="flex items-center">
                Status
                <ArrowUpDown size={14} className={cn(
                  "ml-2",
                  sortField === 'status' && "text-primary"
                )} />
              </Button>
            </TableHead>
            <TableHead className="w-[15%]">
              <Button variant="ghost" onClick={() => handleSort('updated_at')} className="flex items-center">
                Last Updated
                <ArrowUpDown size={14} className={cn(
                  "ml-2",
                  sortField === 'updated_at' && "text-primary"
                )} />
              </Button>
            </TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFeatures.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No features found.
              </TableCell>
            </TableRow>
          ) : (
            sortedFeatures.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell className="font-medium">
                  <div>
                    {feature.feature}
                    <div className="text-xs text-muted-foreground mt-1">
                      {feature.notes && feature.notes.length > 50 
                        ? `${feature.notes.substring(0, 50)}...` 
                        : feature.notes}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(feature.priority)}`}>
                    {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <StatusBadge status={feature.status} />
                    <div className="text-xs text-muted-foreground mt-1">
                      {TEMPLATE_FEATURE_STATUS[feature.status]}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(feature.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(feature)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(feature)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MVPTable;
