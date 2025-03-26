
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment } from '@/types/database';
import ExperimentsSection from '@/components/ExperimentsSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Beaker } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ExperimentsSummarySection from '@/components/experiments/ExperimentsSummarySection';

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const experimentId = searchParams.get('id');
  const createNew = searchParams.get('create') === 'true';
  const viewParam = searchParams.get('view');
  
  // Validate status parameter against allowed values
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus && ['planned', 'in-progress', 'completed'].includes(rawStatus) 
    ? rawStatus as 'planned' | 'in-progress' | 'completed'
    : null;
  
  // Show summary when no specific experiment is being viewed, not creating a new one,
  // and not explicitly requesting list view
  const showSummary = !experimentId && !createNew && viewParam !== 'list' && !statusFilter;
  
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
  
  return (
    <div className="space-y-6">
      <PageIntroduction 
        title="Experiments" 
        icon={<Beaker className="h-5 w-5 text-blue-500" />}
        description="Design and run experiments to validate your hypotheses and make evidence-based decisions."
      />
      
      {showSummary && (
        <ExperimentsSummarySection
          experiments={experiments}
          projectId={currentProject.id}
        />
      )}
      
      {!showSummary && (
        <ExperimentsSection 
          experiments={experiments}
          refreshData={fetchExperiments}
          projectId={currentProject.id}
          isLoading={isLoading}
          experimentType="solution"
        />
      )}
    </div>
  );
};

export default ExperimentsPage;
