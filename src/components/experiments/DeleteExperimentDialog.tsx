
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

interface DeleteExperimentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  experimentToDelete: any | null;
  refreshData: () => void;
}

const DeleteExperimentDialog = ({ 
  isOpen, 
  onOpenChange, 
  experimentToDelete, 
  refreshData 
}: DeleteExperimentDialogProps) => {
  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!experimentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', experimentToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Experiment deleted',
        description: 'The experiment has been successfully deleted.',
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this experiment and all associated data. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
            onClick={confirmDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExperimentDialog;
