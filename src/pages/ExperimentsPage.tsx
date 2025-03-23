import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Experiment, Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExperimentList from '@/components/experiments/ExperimentList';
import ExperimentForm from '@/components/forms/ExperimentForm';
import ExperimentDetailView from '@/components/experiments/ExperimentDetailView';
import { Loader2, FlaskConical } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import { useLocation } from 'react-router-dom';

const ExperimentsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [relatedHypothesis, setRelatedHypothesis] = useState<Hypothesis | null>(null);
  const { toast } = useToast();
  const location = useLocation();

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
      
      const transformedData: Experiment[] = data.map(item => ({
        ...item,
        originalId: item.id,
        id: item.id,
        status: item.status as 'planned' | 'in-progress' | 'completed',
        category: item.category as 'problem' | 'solution' | 'business-model' | string | null
      }));
      
      setExperiments(transformedData);
      
      if (location.state && location.state.experimentId) {
        const experiment = transformedData.find(e => e.id === location.state.experimentId);
        if (experiment) {
          setSelectedExperiment(experiment);
          setIsDetailViewOpen(true);
          fetchRelatedHypothesis(experiment);
        }
      }
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

  const fetchRelatedHypothesis = async (experiment: Experiment) => {
    if (!experiment.hypothesis_id) return;
    
    try {
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('id', experiment.hypothesis_id)
        .single();
        
      if (error) throw error;
      
      setRelatedHypothesis(data);
    } catch (err) {
      console.error('Error fetching related hypothesis:', err);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
    }
  }, [currentProject, location]);

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
      <PageIntroduction
        title="Experiment Design and Execution"
        icon={<FlaskConical className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              Experiments are structured tests designed to validate or invalidate your hypotheses using the scientific method.
              Each experiment should:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Test one specific hypothesis:</strong> Focus on a single assumption at a time</li>
              <li><strong>Define clear success metrics:</strong> Establish what data will prove or disprove your hypothesis</li>
              <li><strong>Be designed for speed and learning:</strong> Quick experiments provide faster insights</li>
              <li><strong>Use appropriate methods:</strong> Choose the right technique for your current stage</li>
            </ul>
            <p className="mt-2">
              <strong>Common experiment types:</strong>
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Customer interviews:</strong> Talk directly to potential users about their problems and needs</li>
              <li><strong>Landing page tests:</strong> Gauge interest in your solution with a simple landing page</li>
              <li><strong>Concierge MVP:</strong> Manually deliver your service to early customers to learn their needs</li>
              <li><strong>Wizard of Oz:</strong> Fake the technology while manually providing the service behind the scenes</li>
              <li><strong>Feature prototypes:</strong> Test specific features with simple implementations before full development</li>
              <li><strong>A/B tests:</strong> Compare two versions to see which performs better</li>
            </ul>
            <p className="mt-2">
              Document all experimental results, whether positive or negative - both provide valuable learning opportunities
              that guide your next steps.
            </p>
          </>
        }
      />

      {isFormOpen && (
        <ExperimentForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={fetchExperiments}
          experiment={selectedExperiment}
          projectId={currentProject?.id || ''}
        />
      )}
      
      {isDetailViewOpen && selectedExperiment && (
        <ExperimentDetailView
          experiment={selectedExperiment}
          onEdit={() => handleEditExperiment(selectedExperiment)}
          onClose={handleDetailViewClose}
          relatedHypothesis={relatedHypothesis}
          onRefresh={fetchExperiments}
          projectId={currentProject?.id || ''}
        />
      )}
      
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
