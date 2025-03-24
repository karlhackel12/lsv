import React, { useState, useEffect } from 'react';
import { Experiment, Hypothesis } from '@/types/database';
import ExperimentForm from './forms/ExperimentForm';
import ExperimentsHeader from './experiments/ExperimentsHeader';
import ExperimentList from './experiments/ExperimentList';
import DeleteExperimentDialog from './experiments/DeleteExperimentDialog';
import ExperimentDetailView from './experiments/ExperimentDetailView';
import ExperimentHypothesisLink from './experiments/ExperimentHypothesisLink';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ExperimentsSectionProps {
  experiments: Experiment[];
  refreshData: () => void;
  projectId: string;
  isLoading?: boolean;
  experimentType?: 'problem' | 'solution' | 'business-model';
}

const ExperimentsSection = ({ 
  experiments, 
  refreshData, 
  projectId,
  isLoading = false,
  experimentType = 'problem'
}: ExperimentsSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [relatedHypothesis, setRelatedHypothesis] = useState<Hypothesis | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    const experimentId = searchParams.get('id');
    if (experimentId && experiments.length > 0) {
      const experiment = experiments.find(e => e.id === experimentId);
      if (experiment) {
        setSelectedExperiment(experiment);
        setViewMode('detail');
      }
    }
    
    const createParam = searchParams.get('create');
    if (createParam === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams, experiments]);

  const handleCreateNew = () => {
    setSelectedExperiment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (experiment: Experiment) => {
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
    setSearchParams({ id: experiment.id });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedExperiment(null);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('id');
    setSearchParams(newParams);
  };

  const handleHypothesisFound = (hypothesis: Hypothesis | null) => {
    setRelatedHypothesis(hypothesis);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    
    if (searchParams.get('create') === 'true') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      setSearchParams(newParams);
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
            onCreateNew={handleCreateNew} 
            experimentType={experimentType}
          />
          
          <ExperimentList 
            experiments={experiments}
            refreshData={refreshData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
            onViewDetail={handleViewDetail}
          />
        </>
      ) : (
        <>
          <div className="mb-4">
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
              <ExperimentHypothesisLink 
                experiment={selectedExperiment}
                projectId={projectId}
                onHypothesisFound={handleHypothesisFound}
              />
              
              <ExperimentDetailView 
                experiment={selectedExperiment}
                relatedHypothesis={relatedHypothesis}
                onEdit={() => setIsFormOpen(true)}
                onClose={handleBackToList}
                onRefresh={refreshData}
                projectId={projectId}
              />
            </>
          )}
        </>
      )}

      <ExperimentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={refreshData}
        experiment={selectedExperiment}
        projectId={projectId}
        experimentType={experimentType}
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
