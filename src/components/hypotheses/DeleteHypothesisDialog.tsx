
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
import { Hypothesis } from '@/types/database';

interface DeleteHypothesisDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hypothesisToDelete: Hypothesis | null;
  onConfirmDelete: () => Promise<void>;
}

const DeleteHypothesisDialog = ({ 
  isOpen, 
  setIsOpen, 
  hypothesisToDelete, 
  onConfirmDelete 
}: DeleteHypothesisDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this hypothesis and all associated data. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
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
