
import React, { useState } from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { CheckSquare, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ExperimentForm from './forms/ExperimentForm';
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

interface Experiment {
  id: number;
  originalId?: string;
  title: string;
  hypothesis: string;
  status: 'completed' | 'in-progress' | 'planned';
  method: string;
  metrics: string;
  results: string | null;
  insights: string | null;
  decisions: string | null;
}

interface ExperimentsSectionProps {
  experiments: Experiment[];
  refreshData: () => void;
  projectId: string;
}

const ExperimentsSection = ({ experiments, refreshData, projectId }: ExperimentsSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<any>(null);

  const handleCreateNew = () => {
    setSelectedExperiment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (experiment: Experiment) => {
    // Find original experiment with string ID for database operations
    const originalExperiment = {
      ...experiment,
      id: experiment.originalId
    };
    setSelectedExperiment(originalExperiment);
    setIsFormOpen(true);
  };

  const handleDelete = (experiment: Experiment) => {
    setExperimentToDelete({
      ...experiment,
      id: experiment.originalId
    });
    setIsDeleteDialogOpen(true);
  };

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
      setIsDeleteDialogOpen(false);
      setExperimentToDelete(null);
    }
  };

  const updateExperimentStatus = async (experiment: Experiment, newStatus: 'completed' | 'in-progress' | 'planned') => {
    try {
      const { error } = await supabase
        .from('experiments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', experiment.originalId);
      
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
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Experiment Tracking</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Design New Experiment
        </Button>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Design and track experiments to validate your hypotheses. Good experiments have a clear hypothesis, methodology, and success metrics.
        </p>
      </Card>

      {experiments.length === 0 ? (
        <Card className="p-12 text-center animate-slideUpFade">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Experiments Yet</h3>
          <p className="text-validation-gray-600 mb-6">Design your first experiment to test a hypothesis.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Design First Experiment
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {experiments.map((experiment, index) => (
            <Card 
              key={experiment.id} 
              className="p-6 animate-slideUpFade" 
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
              hover={true}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-validation-gray-900">{experiment.title}</h3>
                  <p className="text-validation-gray-600 italic mb-2">Testing: {experiment.hypothesis}</p>
                </div>
                <div className="flex space-x-2">
                  <StatusBadge status={experiment.status} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEdit(experiment)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                    onClick={() => handleDelete(experiment)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-validation-gray-500 mb-1">Method</p>
                    <p className="text-validation-gray-700">{experiment.method}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-validation-gray-500 mb-1">Key Metrics</p>
                    <p className="text-validation-gray-700">{experiment.metrics}</p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
                    <p className="text-validation-gray-700">
                      {experiment.results || 'No results yet'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-validation-gray-500 mb-1">Insights</p>
                    <p className="text-validation-gray-700">
                      {experiment.insights || 'No insights yet'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-validation-gray-500 mb-1">Decisions</p>
                    <p className="text-validation-gray-700">
                      {experiment.decisions || 'Pending experiment completion'}
                    </p>
                  </div>
                  
                  {experiment.status === 'planned' && (
                    <Button 
                      className="mt-2 bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
                      onClick={() => updateExperimentStatus(experiment, 'in-progress')}
                    >
                      Start Experiment
                    </Button>
                  )}
                  
                  {experiment.status === 'in-progress' && (
                    <Button 
                      className="mt-2 bg-validation-yellow-500 hover:bg-validation-yellow-600 text-white"
                      onClick={() => handleEdit(experiment)}
                    >
                      Log Results
                    </Button>
                  )}
                  
                  {(experiment.status === 'in-progress' && experiment.results) && (
                    <Button 
                      className="mt-2 ml-2 bg-validation-green-600 hover:bg-validation-green-700 text-white"
                      onClick={() => updateExperimentStatus(experiment, 'completed')}
                    >
                      Complete Experiment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Experiment Form Dialog */}
      <ExperimentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        experiment={selectedExperiment}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
    </div>
  );
};

export default ExperimentsSection;
