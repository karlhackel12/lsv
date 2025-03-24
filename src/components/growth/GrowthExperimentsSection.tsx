
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Beaker,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
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
import { GrowthExperiment, GrowthMetric } from '@/types/database';
import GrowthExperimentForm from '@/components/forms/GrowthExperimentForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface GrowthExperimentsSectionProps {
  experiments: GrowthExperiment[];
  metrics: GrowthMetric[];
  projectId: string;
  growthModelId: string;
  refreshData: () => Promise<void>;
}

const STATUS_COLORS = {
  'planned': 'bg-blue-100 text-blue-700 border-blue-200',
  'running': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'completed': 'bg-green-100 text-green-700 border-green-200',
  'failed': 'bg-red-100 text-red-700 border-red-200'
};

const GrowthExperimentsSection = ({ 
  experiments, 
  metrics,
  projectId, 
  growthModelId,
  refreshData 
}: GrowthExperimentsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<GrowthExperiment | null>(null);
  const [experimentToDelete, setExperimentToDelete] = useState<GrowthExperiment | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (experiment?: GrowthExperiment) => {
    if (!growthModelId) {
      toast({
        title: "Growth model missing",
        description: "Cannot create experiments without a growth model. Please wait or refresh the page.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingExperiment(experiment || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExperiment(null);
  };

  const handleDeleteExperiment = async () => {
    if (!experimentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('growth_experiments')
        .delete()
        .eq('id', experimentToDelete.originalId || experimentToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Experiment deleted',
        description: 'The experiment has been successfully deleted',
      });
      
      refreshData();
    } catch (error) {
      console.error('Error deleting experiment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete experiment',
        variant: 'destructive',
      });
    } finally {
      setExperimentToDelete(null);
    }
  };

  const getAssociatedMetric = (metricId: string | null) => {
    if (!metricId) return null;
    return metrics.find(m => m.id === metricId);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthExperimentForm
          projectId={projectId}
          growthModelId={growthModelId}
          onSave={refreshData}
          onClose={handleCloseForm}
          experiment={editingExperiment}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Experiments</h2>
            <Button 
              onClick={() => handleOpenForm()} 
              className="flex items-center gap-2"
              disabled={!growthModelId}
            >
              <PlusCircle className="h-4 w-4" />
              Add Experiment
            </Button>
          </div>

          {experiments.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <Beaker className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Experiments Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Run experiments to test your growth hypotheses and improve your key metrics.
                </p>
                <Button 
                  onClick={() => handleOpenForm()} 
                  className="flex items-center gap-2"
                  disabled={!growthModelId}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add First Experiment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {experiments.map((experiment) => {
                const associatedMetric = getAssociatedMetric(experiment.metric_id);
                
                return (
                  <Card key={experiment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{experiment.title}</CardTitle>
                          <div className="flex space-x-2 mt-1">
                            <Badge variant="secondary" className={STATUS_COLORS[experiment.status as keyof typeof STATUS_COLORS]}>
                              {experiment.status}
                            </Badge>
                            {associatedMetric && (
                              <Badge variant="outline" className="bg-gray-50">
                                {associatedMetric.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => handleOpenForm(experiment)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0" 
                            onClick={() => setExperimentToDelete(experiment)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{experiment.hypothesis}</p>
                      
                      <div className="bg-gray-50 rounded-md p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs font-medium">Start Date</p>
                            <p>{formatDate(experiment.start_date)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-medium">End Date</p>
                            <p>{formatDate(experiment.end_date)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs font-medium">Expected Lift</p>
                            <div className="flex items-center">
                              <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-500" />
                              <span>{experiment.expected_lift}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-medium">Actual Lift</p>
                            {experiment.actual_lift !== null ? (
                              <div className="flex items-center">
                                <TrendingUp className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                <span>{experiment.actual_lift}%</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {experiment.notes && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{experiment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!experimentToDelete} onOpenChange={(open) => !open && setExperimentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experiment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExperiment} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GrowthExperimentsSection;
