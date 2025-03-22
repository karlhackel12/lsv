
import React from 'react';
import { Button } from '@/components/ui/button';
import { Experiment } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExperimentStatusActionsProps {
  experiment: Experiment;
  refreshData: () => void;
  onEdit: (experiment: Experiment) => void;
}

const ExperimentStatusActions = ({ experiment, refreshData, onEdit }: ExperimentStatusActionsProps) => {
  const { toast } = useToast();

  const updateExperimentStatus = async (newStatus: 'completed' | 'in-progress' | 'planned') => {
    try {
      // Use originalId if available, otherwise fallback to id
      const idToUse = experiment.originalId || experiment.id;
      
      const { error } = await supabase
        .from('experiments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', idToUse);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Experiment status changed to ${newStatus}.`,
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      {experiment.status === 'planned' && (
        <Button 
          className="mt-2 bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
          onClick={() => updateExperimentStatus('in-progress')}
        >
          Start Experiment
        </Button>
      )}
      
      {experiment.status === 'in-progress' && (
        <Button 
          className="mt-2 bg-validation-yellow-500 hover:bg-validation-yellow-600 text-white"
          onClick={() => onEdit(experiment)}
        >
          Log Results
        </Button>
      )}
      
      {(experiment.status === 'in-progress' && experiment.results) && (
        <Button 
          className="mt-2 ml-2 bg-validation-green-600 hover:bg-validation-green-700 text-white"
          onClick={() => updateExperimentStatus('completed')}
        >
          Complete Experiment
        </Button>
      )}
    </div>
  );
};

export default ExperimentStatusActions;
