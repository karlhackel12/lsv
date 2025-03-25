
import React, { useState } from 'react';
import { Experiment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  BeakerIcon, 
  CheckCircle, 
  ClipboardList, 
  Loader2,
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';

interface ExperimentStatusActionsProps {
  experiment: Experiment;
  refreshData: () => void;
  isGrowthExperiment?: boolean;
  onEdit?: (experiment: Experiment) => void;
}

const ExperimentStatusActions = ({ 
  experiment, 
  refreshData,
  isGrowthExperiment = false,
  onEdit
}: ExperimentStatusActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'start' | 'complete'>('start');
  const { toast } = useToast();
  
  const StartIcon = isGrowthExperiment ? TrendingUp : BeakerIcon;
  
  const handleUpdateStatus = async (newStatus: 'planned' | 'in-progress' | 'completed') => {
    setIsLoading(true);
    
    try {
      const tableName = isGrowthExperiment ? 'growth_experiments' : 'experiments';
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', experiment.originalId || experiment.id);
        
      if (error) throw error;
      
      toast({
        title: `Experiment ${newStatus === 'in-progress' ? 'started' : 'completed'}`,
        description: `The experiment has been marked as ${newStatus}.`,
      });
      
      refreshData();
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating experiment:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating the experiment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openDialog = (action: 'start' | 'complete') => {
    setActionType(action);
    setDialogOpen(true);
  };
  
  if (experiment.status === 'planned') {
    return (
      <>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50"
          onClick={() => openDialog('start')}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <StartIcon className="h-4 w-4" />
          )}
          Start Experiment
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Experiment</DialogTitle>
              <DialogDescription>
                Are you ready to start this experiment? This will mark it as "in progress".
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => handleUpdateStatus('in-progress')}
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <StartIcon className="h-4 w-4 mr-2" />
                )}
                Start Experiment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  } else if (experiment.status === 'in-progress') {
    return (
      <>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
          onClick={() => openDialog('complete')}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Complete Experiment
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Experiment</DialogTitle>
              <DialogDescription>
                Are you finished with this experiment? This will mark it as "completed".
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => handleUpdateStatus('completed')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Experiment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    return (
      <div className="flex items-center text-green-700">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span>Experiment completed</span>
      </div>
    );
  }
};

export default ExperimentStatusActions;
