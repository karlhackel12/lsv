
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Experiment, Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExperimentList from '@/components/experiments/ExperimentList';
import ExperimentForm from '@/components/forms/ExperimentForm';
import ExperimentDetailView from '@/components/experiments/ExperimentDetailView';
import { Loader2 } from 'lucide-react';

const ExperimentsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [relatedHypothesis, setRelatedHypothesis] = useState<Hypothesis | null>(null);
  const { toast } = useToast();

  const fetchExperiments = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingExperiments(true);
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Ensure we cast the status to the correct type defined in the interface
      const transformedData: Experiment[] = data.map(item => ({
        ...item,
        originalId: item.id,
        id: item.id,
        status: item.status as 'planned' | 'in-progress' | 'completed'
      }));
      
      setExperiments(transformedData);
    } catch (err) {
      console.error('Error fetching experiments:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load experiments',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingExperiments(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
    }
  }, [currentProject]);

  const handleEditExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };

  const handleCreateExperiment = () => {
    setSelectedExperiment(null);
    setIsFormOpen(true);
  };

  const handleViewExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setIsDetailViewOpen(true);
  };

  const handleDeleteExperiment = async (experiment: Experiment) => {
    try {
      const id = experiment.originalId || experiment.id;
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setExperiments(prevExperiments => 
        prevExperiments.filter(e => e.id !== experiment.id)
      );
      
      toast({
        title: 'Success',
        description: 'Experiment deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting experiment:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete experiment',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedExperiment(null);
  };

  const handleDetailViewClose = () => {
    setIsDetailViewOpen(false);
    setSelectedExperiment(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error instanceof Error ? error.message : 'Failed to load project'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Experiment form dialog */}
      {isFormOpen && (
        <ExperimentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={fetchExperiments}
          experiment={selectedExperiment}
          projectId={currentProject?.id || ''}
        />
      )}
      
      {/* Experiment detail view */}
      {isDetailViewOpen && selectedExperiment && (
        <ExperimentDetailView
          experiment={selectedExperiment}
          onEdit={() => handleEditExperiment(selectedExperiment)}
          onClose={handleDetailViewClose}
          relatedHypothesis={relatedHypothesis}
        />
      )}
      
      {/* Main content */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Experiment List</TabsTrigger>
          <TabsTrigger value="create">Create Experiment</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <ExperimentList 
            experiments={experiments} 
            refreshData={fetchExperiments}
            onEdit={handleEditExperiment}
            onDelete={handleDeleteExperiment}
            onCreateNew={handleCreateExperiment}
            onViewDetail={handleViewExperiment}
          />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <div className="flex items-center justify-center p-12">
            <button
              onClick={handleCreateExperiment}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create New Experiment
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentsPage;
