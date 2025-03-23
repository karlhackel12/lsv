
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  FlaskConical,
  Calendar,
  TrendingUp
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
import { GrowthExperiment, GrowthMetric, GrowthModel } from '@/types/database';
import GrowthExperimentForm from '@/components/forms/GrowthExperimentForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format, parseISO, isAfter, isBefore, isToday } from 'date-fns';

interface GrowthExperimentsSectionProps {
  experiments: GrowthExperiment[];
  metrics: GrowthMetric[];
  growthModel: GrowthModel;
  projectId: string;
  refreshData: () => Promise<void>;
}

const STATUS_BADGE_VARIANTS = {
  'planned': 'outline',
  'running': 'default',
  'completed': 'secondary',
  'failed': 'destructive'
} as const;

const GrowthExperimentsSection = ({ 
  experiments, 
  metrics,
  growthModel, 
  projectId, 
  refreshData 
}: GrowthExperimentsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<GrowthExperiment | null>(null);
  const [experimentToDelete, setExperimentToDelete] = useState<GrowthExperiment | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (experiment?: GrowthExperiment) => {
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

  const getExperimentMetric = (metricId: string) => {
    return metrics.find(m => m.id === metricId) || null;
  };

  const getExperimentTiming = (experiment: GrowthExperiment) => {
    const now = new Date();
    const startDate = parseISO(experiment.start_date);
    const endDate = parseISO(experiment.end_date);
    
    if (isBefore(now, startDate)) {
      return `Starts ${formatDistanceToNow(startDate, { addSuffix: true })}`;
    } else if (isAfter(now, endDate)) {
      return `Ended ${formatDistanceToNow(endDate, { addSuffix: false })} ago`;
    } else if (isToday(startDate)) {
      return 'Started today';
    } else if (isToday(endDate)) {
      return 'Ends today';
    } else {
      return `${formatDistanceToNow(endDate, { addSuffix: true })} remaining`;
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthExperimentForm
          growthModel={growthModel}
          projectId={projectId}
          metrics={metrics}
          onSave={refreshData}
          onClose={handleCloseForm}
          experiment={editingExperiment}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Experiments</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Experiment
            </Button>
          </div>

          {experiments.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <FlaskConical className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Experiments Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Create growth experiments to test hypotheses and improve your key metrics.
                </p>
                <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create First Experiment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experiments.map((experiment) => {
                const metric = getExperimentMetric(experiment.metric_id);
                return (
                  <Card key={experiment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-medium">{experiment.title}</CardTitle>
                          <Badge variant={STATUS_BADGE_VARIANTS[experiment.status]}>
                            {experiment.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleOpenForm(experiment)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => setExperimentToDelete(experiment)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      {experiment.hypothesis && (
                        <CardDescription className="text-xs mt-1">{experiment.hypothesis}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="py-3">
                      <div className="flex items-center text-sm mb-3">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span className="text-gray-600">{getExperimentTiming(experiment)}</span>
                      </div>
                      
                      {metric && (
                        <div className="bg-gray-50 p-2 rounded-md text-sm">
                          <p className="font-medium">Target Metric: {metric.name}</p>
                          <div className="flex justify-between mt-1">
                            <div className="flex items-center">
                              <TrendingUp className="h-3.5 w-3.5 mr-1 text-blue-500" />
                              <span>Expected: {experiment.expected_lift}%</span>
                            </div>
                            {experiment.actual_lift !== undefined && (
                              <div className={experiment.actual_lift >= experiment.expected_lift ? 'text-green-600' : 'text-red-600'}>
                                Actual: {experiment.actual_lift}%
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {experiment.notes && (
                        <div className="mt-3 text-sm text-gray-600">
                          <p className="font-medium text-xs text-gray-500 mb-1">Notes:</p>
                          <p className="line-clamp-2">{experiment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 text-xs text-gray-500">
                      <div className="flex justify-between w-full">
                        <span>Created {format(parseISO(experiment.created_at), 'MMM d, yyyy')}</span>
                        <span>{format(parseISO(experiment.start_date), 'MMM d')} - {format(parseISO(experiment.end_date), 'MMM d, yyyy')}</span>
                      </div>
                    </CardFooter>
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
