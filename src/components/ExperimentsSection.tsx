
import React, { useState, useEffect } from 'react';
import { Experiment, Hypothesis, GrowthExperiment } from '@/types/database';
import ExperimentForm from './forms/ExperimentForm';
import ExperimentsHeader from './experiments/ExperimentsHeader';
import ExperimentList from './experiments/ExperimentList';
import DeleteExperimentDialog from './experiments/DeleteExperimentDialog';
import ExperimentDetailView from './experiments/ExperimentDetailView';
import ExperimentHypothesisLink from './experiments/ExperimentHypothesisLink';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  updateGrowthExperimentFromExperiment, 
  adaptGrowthExperimentToExperiment 
} from '@/utils/experiment-adapters';

interface ExperimentsSectionProps {
  experiments: Experiment[];
  refreshData: () => void;
  projectId: string;
  isLoading?: boolean;
  experimentType?: 'problem' | 'solution' | 'business-model';
  isGrowthExperiment?: boolean;
}

const ExperimentsSection = ({ 
  experiments, 
  refreshData, 
  projectId,
  isLoading = false,
  experimentType = 'problem',
  isGrowthExperiment = false
}: ExperimentsSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [relatedHypothesis, setRelatedHypothesis] = useState<Hypothesis | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle experiment ID from URL params
    const experimentId = searchParams.get('id');
    if (experimentId && experiments.length > 0) {
      const experiment = experiments.find(e => e.id === experimentId);
      if (experiment) {
        setSelectedExperiment(experiment);
        setViewMode('detail');
      }
    }
    
    // Handle experiment ID from location state (for direct navigation)
    const state = location.state as any;
    if (state?.experimentId && experiments.length > 0) {
      const experiment = experiments.find(e => e.id === state.experimentId);
      if (experiment) {
        setSelectedExperiment(experiment);
        setViewMode('detail');
        // Reset location state
        navigate(location.pathname, { replace: true });
      }
    }
    
    // Handle create new from location state
    if (state?.createNew) {
      handleCreateNew();
      // Reset location state
      navigate(location.pathname, { replace: true });
    }
  }, [searchParams, experiments, location]);

  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      handleCreateNew();
      
      const params = new URLSearchParams(searchParams);
      params.delete('create');
      setSearchParams(params);
    }
  }, [searchParams]);

  const handleCreateNew = () => {
    console.log("Creating new experiment - resetting form state");
    setSelectedExperiment(null);
    setIsFormOpen(true);

    if (isGrowthExperiment) {
      const params = new URLSearchParams(searchParams);
      params.set('type', 'growth');
      setSearchParams(params);
    }
  };

  const handleEdit = (experiment: Experiment) => {
    console.log("Editing experiment:", experiment);
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };

  const handleDelete = (experiment: Experiment) => {
    setExperimentToDelete(experiment);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetail = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setViewMode('detail');
    
    const params = new URLSearchParams(searchParams);
    params.set('id', experiment.id);
    if (isGrowthExperiment) {
      params.set('type', 'growth');
    }
    setSearchParams(params);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedExperiment(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params);
  };

  const handleHypothesisFound = (hypothesis: Hypothesis | null) => {
    setRelatedHypothesis(hypothesis);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedExperiment(null);
  };

  const handleFormSave = async (savedExperiment: Experiment) => {
    if (isGrowthExperiment && savedExperiment.originalGrowthExperiment) {
      try {
        const updatedGrowthExperiment = updateGrowthExperimentFromExperiment(
          savedExperiment, 
          savedExperiment.originalGrowthExperiment as GrowthExperiment
        );
        
        const { error } = await supabase
          .from('growth_experiments')
          .update({
            title: updatedGrowthExperiment.title,
            hypothesis: updatedGrowthExperiment.hypothesis,
            status: updatedGrowthExperiment.status,
            notes: updatedGrowthExperiment.notes,
            updated_at: updatedGrowthExperiment.updated_at
          })
          .eq('id', updatedGrowthExperiment.id);
          
        if (error) throw error;
        
        toast({
          title: 'Growth experiment updated',
          description: 'The growth experiment has been successfully updated.',
        });
        
        refreshData();
      } catch (error: any) {
        console.error('Error updating growth experiment:', error);
        toast({
          title: 'Error',
          description: error.message || 'An error occurred while updating the growth experiment.',
          variant: 'destructive',
        });
      }
    } else {
      refreshData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-lg font-medium text-validation-gray-600">Loading experiments...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          <ExperimentsHeader 
            onCreateNew={isGrowthExperiment ? undefined : handleCreateNew} 
            experimentType={experimentType}
            isGrowthExperiment={isGrowthExperiment}
          />
          
          <ExperimentList 
            experiments={experiments}
            refreshData={refreshData}
            onEdit={handleEdit}
            onDelete={isGrowthExperiment ? undefined : handleDelete}
            onCreateNew={handleCreateNew}
            onViewDetail={handleViewDetail}
            isGrowthExperiment={isGrowthExperiment}
          />
        </>
      ) : (
        <>
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Experiments
            </Button>
          </div>
          
          {selectedExperiment && (
            <>
              {!isGrowthExperiment && (
                <ExperimentHypothesisLink 
                  experiment={selectedExperiment}
                  projectId={projectId}
                  onHypothesisFound={handleHypothesisFound}
                />
              )}
              
              <ExperimentDetailView 
                experiment={selectedExperiment}
                relatedHypothesis={relatedHypothesis}
                onEdit={() => handleEdit(selectedExperiment)}
                onClose={handleBackToList}
                onRefresh={refreshData}
                projectId={projectId}
                isGrowthExperiment={isGrowthExperiment}
              />
            </>
          )}
        </>
      )}

      <ExperimentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        experiment={selectedExperiment}
        projectId={projectId}
        experimentType={experimentType}
        isGrowthExperiment={isGrowthExperiment}
        key={selectedExperiment ? selectedExperiment.id : 'new-experiment'} 
      />

      <DeleteExperimentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        experimentToDelete={experimentToDelete}
        refreshData={refreshData}
      />
    </div>
  );
};

export default ExperimentsSection;
