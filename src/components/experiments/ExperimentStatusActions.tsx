
import React from 'react';
import { Button } from '@/components/ui/button';
import { Experiment } from '@/types/database';
import { Play, CheckSquare, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExperimentStatusActionsProps {
  experiment: Experiment;
  refreshData: () => void;
  onEdit?: (experiment: Experiment) => void;
  isGrowthExperiment?: boolean;
}

const ExperimentStatusActions: React.FC<ExperimentStatusActionsProps> = ({ 
  experiment, 
  refreshData,
  onEdit,
  isGrowthExperiment = false
}) => {
  const { toast } = useToast();
  
  const updateStatus = async (newStatus: 'planned' | 'in-progress' | 'completed') => {
    try {
      if (isGrowthExperiment && experiment.originalGrowthExperiment) {
        // Map experiment status to growth experiment status
        let growthStatus: 'planned' | 'running' | 'completed' | 'failed';
        if (newStatus === 'in-progress') {
          growthStatus = 'running';
        } else if (newStatus === 'completed') {
          // For simplicity we're setting it to completed, but in a real app,
          // we might want to check the actual_lift to decide between completed/failed
          growthStatus = 'completed';
        } else {
          growthStatus = 'planned';
        }

        const { error } = await supabase
          .from('growth_experiments')
          .update({ 
            status: growthStatus,
            updated_at: new Date().toISOString() 
          })
          .eq('id', experiment.originalGrowthExperiment.id);
          
        if (error) throw error;
      } else {
        // Regular experiment
        const { error } = await supabase
          .from('experiments')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString() 
          })
          .eq('id', experiment.id);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Status Updated',
        description: `Experiment is now ${newStatus}`,
      });
      
      refreshData();
    } catch (err) {
      console.error('Error updating experiment status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update experiment status',
        variant: 'destructive',
      });
    }
  };
  
  // Don't show buttons if already completed
  if (experiment.status === 'completed') {
    return (
      <div className="bg-green-50 text-green-700 p-2 rounded-md text-center text-sm">
        <CheckSquare className="h-4 w-4 inline-block mr-1" />
        Experiment completed
      </div>
    );
  }

  // Status is 'planned' 
  if (experiment.status === 'planned') {
    return (
      <Button 
        onClick={() => updateStatus('in-progress')}
        className="flex items-center justify-center"
        size="sm"
      >
        <Play className="h-3.5 w-3.5 mr-1" />
        Start Experiment
      </Button>
    );
  }
  
  // Status is 'in-progress'
  return (
    <Button 
      onClick={() => updateStatus('completed')}
      className="flex items-center justify-center"
      variant="success"
      size="sm"
    >
      <CheckSquare className="h-3.5 w-3.5 mr-1" />
      Mark as Completed
    </Button>
  );
};

export default ExperimentStatusActions;
