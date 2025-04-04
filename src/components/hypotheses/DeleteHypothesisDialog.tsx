
import React from 'react';
import { Hypothesis } from '@/types/database';
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
import { InfoIcon } from 'lucide-react';

interface DeleteHypothesisDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hypothesisToDelete: Hypothesis | null;
  onConfirmDelete: () => void;
}

const DeleteHypothesisDialog = ({
  isOpen,
  setIsOpen,
  hypothesisToDelete,
  onConfirmDelete,
}: DeleteHypothesisDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the hypothesis "{hypothesisToDelete?.statement}".
            This action cannot be undone.
          </AlertDialogDescription>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <InfoIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Note:</strong> If this hypothesis has linked experiments, you must delete those experiments first.
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirmDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteHypothesisDialog;
