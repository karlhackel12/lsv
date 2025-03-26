
import React from 'react';
import { PivotOption } from '@/types/pivot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface PivotOptionsTableProps {
  pivotOptions: PivotOption[];
  onEdit: (option: PivotOption) => void;
  onDelete: (option: PivotOption) => void;
}

const PivotOptionsTable: React.FC<PivotOptionsTableProps> = ({
  pivotOptions,
  onEdit,
  onDelete
}) => {
  if (pivotOptions.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No pivot options defined yet. Click the "Add Pivot Option" button to create one.</p>
      </div>
    );
  }

  const getLikelihoodBadge = (likelihood: 'high' | 'medium' | 'low') => {
    switch (likelihood) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Trigger Condition</TableHead>
            <TableHead>Likelihood</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pivotOptions.map((option) => (
            <TableRow key={option.id}>
              <TableCell className="font-medium">{option.type}</TableCell>
              <TableCell className="max-w-[300px]">
                <div className="truncate">{option.description}</div>
              </TableCell>
              <TableCell>{option.trigger}</TableCell>
              <TableCell>{getLikelihoodBadge(option.likelihood)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(option)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(option)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PivotOptionsTable;
