
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GrowthMetric } from '@/types/database';

interface DeleteMetricDialogProps {
  metricToDelete: GrowthMetric | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteMetricDialog = ({ metricToDelete, onClose, onConfirm }: DeleteMetricDialogProps) => {
  return (
    <AlertDialog open={!!metricToDelete} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Metric</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this metric? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMetricDialog;
