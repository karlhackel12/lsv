
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment } from '@/types/database';
import ExperimentList from '@/components/experiments/ExperimentList';
import { FlaskConical, Info } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import ExperimentForm from '@/components/forms/ExperimentForm';
import { Card, CardContent } from '@/components/ui/card';
import ExperimentDetailView from '@/components/experiments/ExperimentDetailView';

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  // Validate status parameter against allowed values
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus && ['planned', 'in-progress', 'completed'].includes(rawStatus) 
    ? rawStatus as 'planned' | 'in-progress' | 'completed'
    : null;
  
  const fetchExperiments = async () => {
    try {
      setIsLoading(true);
      
      if (!currentProject) return;
      
      // Create base query
      let query = supabase
        .from('experiments')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
      
      // Apply filters if needed
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching experiments:', error);
        return;
      }
      
      // Add originalId field to each experiment for tracking original database ID
      const processedData = data?.map(item => ({
        ...item,
        originalId: item.id
      })) as Experiment[];
      
      console.log("Fetched experiments:", processedData);
      setExperiments(processedData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
    }
  }, [currentProject, statusFilter]);
  
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
  }, [searchParams, experiments]);
  
  if (!currentProject) {
    return <div>Select a project to view experiments</div>;
  }
  
  const handleCreateNew = () => {
    setIsFormOpen(true);
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    // Clear any URL parameters related to experiment creation
    const params = new URLSearchParams(searchParams);
    params.delete('create');
    setSearchParams(params);
  };
  
  const handleFormSave = (experiment: Experiment) => {
    fetchExperiments();
    setIsFormOpen(false);
  };
  
  const handleEdit = (experiment: Experiment) => {
    setSearchParams({ id: experiment.id });
    setSelectedExperiment(experiment);
    setIsFormOpen(true);
  };
  
  const handleViewDetail = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setViewMode('detail');
    setSearchParams({ id: experiment.id });
  };
  
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedExperiment(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params);
  };
  
  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        <>
          {/* Header section styled similarly to the image */}
          <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <FlaskConical className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Experiments</h1>
                    <p className="text-gray-600 mt-1 max-w-2xl">
                      Design and run experiments to validate your hypotheses and collect 
                      evidence to make informed decisions about your product.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateNew} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 h-auto"
                  size="lg"
                >
                  Create New Experiment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <ExperimentList 
            experiments={experiments}
            refreshData={fetchExperiments}
            onEdit={handleEdit}
            onDelete={undefined}
            onCreateNew={handleCreateNew}
            onViewDetail={handleViewDetail}
            isGrowthExperiment={false}
          />
        </>
      ) : (
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="mb-4"
          >
            Back to Experiments
          </Button>
          
          {selectedExperiment && (
            <ExperimentDetailView 
              experiment={selectedExperiment}
              onEdit={() => handleEdit(selectedExperiment)}
              onClose={handleBackToList}
              relatedHypothesis={null}
              onRefresh={fetchExperiments}
              projectId={currentProject.id}
            />
          )}
        </div>
      )}
      
      <ExperimentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        experiment={selectedExperiment}
        projectId={currentProject.id}
      />
    </div>
  );
};

export default ExperimentsPage;
