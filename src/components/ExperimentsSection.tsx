
import React, { useState, useEffect } from 'react';
import { Experiment, Hypothesis } from '@/types/database';
import ExperimentForm from './forms/ExperimentForm';
import ExperimentsHeader from './experiments/ExperimentsHeader';
import ExperimentList from './experiments/ExperimentList';
import DeleteExperimentDialog from './experiments/DeleteExperimentDialog';
import ExperimentDetailView from './experiments/ExperimentDetailView';
import ExperimentHypothesisLink from './experiments/ExperimentHypothesisLink';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperimentsSectionProps {
  experiments: Experiment[];
  refreshData: () => void;
  projectId: string;
}

const ExperimentsSection = ({ experiments, refreshData, projectId }: ExperimentsSectionProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [detailView, setDetailView] = useState(false);
  const [relatedHypothesis, setRelatedHypothesis] = useState<Hypothesis | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Check URL parameters for experiment id
  useEffect(() => {
    const experimentId = searchParams.get('id');
    if (experimentId && experiments.length > 0) {
      const experiment = experiments.find(e => e.id === experimentId);
      if (experiment) {
        setSelectedExperiment(experiment);
        setViewMode('detail');
      }
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
    setSearchParams({});
  };

  const handleHypothesisFound = (hypothesis: Hypothesis | null) => {
    setRelatedHypothesis(hypothesis);
  };

  return (
    <div className="animate-fadeIn">
      {viewMode === 'list' ? (
        <>
          <ExperimentsHeader onCreateNew={handleCreateNew} />
          
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
              />
            </>
          )}
        </>
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
