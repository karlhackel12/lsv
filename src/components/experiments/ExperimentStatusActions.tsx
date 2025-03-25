
import React from 'react';
import { Button } from '@/components/ui/button';
import { Experiment } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExperimentStatusActionsProps {
  experiment: Experiment;
  refreshData: () => void;
  onEdit: (experiment: Experiment) => void;
  isGrowthExperiment?: boolean;
}

const ExperimentStatusActions = ({ 
  experiment, 
  refreshData, 
  onEdit,
  isGrowthExperiment = false
}: ExperimentStatusActionsProps) => {
  const { toast } = useToast();

  const updateExperimentStatus = async (newStatus: 'completed' | 'in-progress' | 'planned') => {
    try {
      if (isGrowthExperiment && experiment.originalGrowthExperiment) {
        // Map regular experiment status to growth experiment status
        let growthStatus: 'planned' | 'running' | 'completed' | 'failed' = 'planned';
        
        if (newStatus === 'in-progress') growthStatus = 'running';
        else if (newStatus === 'completed') growthStatus = 'completed';
        else if (newStatus === 'planned') growthStatus = 'planned';
        
        const { error } = await supabase
          .from('growth_experiments')
          .update({ 
            status: growthStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', experiment.originalGrowthExperiment.id);
        
        if (error) throw error;
        
        toast({
          title: 'Status updated',
          description: `Growth experiment status changed to ${growthStatus}.`,
        });
      } else {
        // Handle regular experiment status update
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
        
        // Update corresponding growth experiment if it exists
        const { data: growthExperiments, error: fetchError } = await supabase
          .from('growth_experiments')
          .select('*')
          .eq('project_id', experiment.project_id)
          .eq('title', `From exp: ${experiment.title}`);
        
        if (fetchError) {
          console.error('Error fetching related growth experiments:', fetchError);
        } else if (growthExperiments && growthExperiments.length > 0) {
          // Map the status to appropriate growth experiment status
          let growthStatus: 'planned' | 'running' | 'completed' | 'failed' = 'planned';
          
          if (newStatus === 'in-progress') growthStatus = 'running';
          else if (newStatus === 'completed') growthStatus = 'completed';
          else if (newStatus === 'planned') growthStatus = 'planned';
          
          const { error: updateError } = await supabase
            .from('growth_experiments')
            .update({
              status: growthStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', growthExperiments[0].id);
          
          if (updateError) {
            console.error('Error updating related growth experiment:', updateError);
          }
        }
      }
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    }
  };

  const buttonLabels = isGrowthExperiment ? {
    planned: 'Start Growth Experiment',
    inProgress: 'Log Results',
    complete: 'Complete Growth Experiment'
  } : {
    planned: 'Start Experiment',
    inProgress: 'Log Results',
    complete: 'Complete Experiment'
  };

  return (
    <div>
      {experiment.status === 'planned' && (
        <Button 
          className="mt-2 bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
          onClick={() => updateExperimentStatus('in-progress')}
        >
          {buttonLabels.planned}
        </Button>
      )}
      
      {experiment.status === 'in-progress' && (
        <Button 
          className="mt-2 bg-validation-yellow-500 hover:bg-validation-yellow-600 text-white"
          onClick={() => onEdit(experiment)}
        >
          {buttonLabels.inProgress}
        </Button>
      )}
      
      {(experiment.status === 'in-progress' && experiment.results) && (
        <Button 
          className="mt-2 ml-2 bg-validation-green-600 hover:bg-validation-green-700 text-white"
          onClick={() => updateExperimentStatus('completed')}
        >
          {buttonLabels.complete}
        </Button>
      )}
    </div>
  );
};

export default ExperimentStatusActions;
