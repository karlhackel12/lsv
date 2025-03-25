
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment, GrowthExperiment } from '@/types/database';
import ExperimentsSection from '@/components/ExperimentsSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Beaker, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProject } from '@/hooks/use-project';
import ExperimentsSummarySection from '@/components/experiments/ExperimentsSummarySection';
import { adaptGrowthExperimentToExperiment } from '@/utils/experiment-adapters';

// Define valid experiment status values for type checking
type ExperimentStatus = 'planned' | 'in-progress' | 'completed';
type GrowthExperimentStatus = 'planned' | 'running' | 'completed' | 'failed';

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPhase = searchParams.get('phase') || 'problem';
  const experimentId = searchParams.get('id');
  const createNew = searchParams.get('create') === 'true';
  const viewParam = searchParams.get('view');
  const experimentType = searchParams.get('type') || 'regular'; // 'regular' or 'growth'
  
  // Validate status parameter against allowed values
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus && ['planned', 'in-progress', 'completed'].includes(rawStatus) 
    ? rawStatus as ExperimentStatus
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
      
      if (currentPhase && !statusFilter) {
        query = query.eq('category', currentPhase);
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

  const fetchGrowthExperiments = async () => {
    try {
      setIsLoadingGrowth(true);
      
      if (!currentProject) return;
      
      const { data, error } = await supabase
        .from('growth_experiments')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching growth experiments:', error);
        return;
      }
      
      // Convert growth experiments to the regular experiment format
      const adaptedExperiments = data?.map(growthExp => {
        return adaptGrowthExperimentToExperiment(growthExp as GrowthExperiment);
      }) || [];
      
      console.log("Fetched growth experiments:", adaptedExperiments);
      setGrowthExperiments(adaptedExperiments);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoadingGrowth(false);
    }
  };
  
  // Refetch when project, phase, or status filter changes
  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
      fetchGrowthExperiments();
    }
  }, [currentProject, currentPhase, statusFilter]);
  
  // Change tab handler
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('phase', value);
    
    // If we're viewing a specific experiment but changing the phase,
    // clear the experiment ID to show the list for that phase
    if (experimentId && !statusFilter) {
      params.delete('id');
    }
    
    setSearchParams(params);
  };

  // Handle switching between regular and growth experiments
  const handleExperimentTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', value);
    
    // Clear the experiment ID when switching types
    if (experimentId) {
      params.delete('id');
    }
    
    setSearchParams(params);
  };
  
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
      
      <Tabs value={experimentType} onValueChange={handleExperimentTypeChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="regular" className="flex items-center">
            <Beaker className="h-4 w-4 mr-2" />
            Validation Experiments
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Growth Experiments
          </TabsTrigger>
        </TabsList>
        
        {/* Regular Experiments Tab */}
        <TabsContent value="regular">
          <Tabs value={currentPhase} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="problem">Problem Experiments</TabsTrigger>
              <TabsTrigger value="solution">Solution Experiments</TabsTrigger>
              <TabsTrigger value="business-model">Business Model Experiments</TabsTrigger>
            </TabsList>
            
            {showSummary && (
              <ExperimentsSummarySection
                experiments={experiments}
                projectId={currentProject.id}
              />
            )}
            
            {(!showSummary) && (
              <>
                <TabsContent value="problem">
                  <ExperimentsSection 
                    experiments={experiments}
                    refreshData={fetchExperiments}
                    projectId={currentProject.id}
                    isLoading={isLoading}
                    experimentType="problem"
                  />
                </TabsContent>
                
                <TabsContent value="solution">
                  <ExperimentsSection 
                    experiments={experiments}
                    refreshData={fetchExperiments}
                    projectId={currentProject.id}
                    isLoading={isLoading}
                    experimentType="solution"
                  />
                </TabsContent>
                
                <TabsContent value="business-model">
                  <ExperimentsSection 
                    experiments={experiments}
                    refreshData={fetchExperiments}
                    projectId={currentProject.id}
                    isLoading={isLoading}
                    experimentType="business-model"
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </TabsContent>
        
        {/* Growth Experiments Tab */}
        <TabsContent value="growth">
          <ExperimentsSection 
            experiments={growthExperiments}
            refreshData={fetchGrowthExperiments}
            projectId={currentProject.id}
            isLoading={isLoadingGrowth}
            experimentType="business-model"
            isGrowthExperiment={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentsPage;
