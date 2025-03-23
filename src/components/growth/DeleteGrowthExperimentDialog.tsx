
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthExperiment } from '@/types/database';
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

interface DeleteGrowthExperimentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  experimentToDelete: GrowthExperiment | null;
  refreshData: () => Promise<void>;
}

const DeleteGrowthExperimentDialog = ({ 
  isOpen, 
  onOpenChange, 
  experimentToDelete, 
  refreshData 
}: DeleteGrowthExperimentDialogProps) => {
  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!experimentToDelete) return;
    
    try {
      // Use originalId if available, otherwise fallback to id
      const idToUse = experimentToDelete.originalId || experimentToDelete.id;
      
      const { error } = await supabase
        .from('growth_experiments')
        .delete()
        .eq('id', idToUse);
      
      if (error) throw error;
      
      toast({
        title: 'Experiment deleted',
        description: 'The growth experiment has been successfully deleted.',
      });
      
      await refreshData();
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
            This will permanently delete this growth experiment and all associated data. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={confirmDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGrowthExperimentDialog;
