
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

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
  };
  
  const handleViewDetail = (experiment: Experiment) => {
    setSearchParams({ id: experiment.id });
  };
  
  return (
    <div className="space-y-6">
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
      
      <ExperimentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        experiment={null}
        projectId={currentProject.id}
      />
    </div>
  );
};

export default ExperimentsPage;
