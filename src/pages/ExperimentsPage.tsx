
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment } from '@/types/database';
import ExperimentsSection from '@/components/ExperimentsSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Beaker } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProject } from '@/hooks/use-project';
import PhaseNavigation from '@/components/PhaseNavigation';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import ExperimentsSummarySection from '@/components/experiments/ExperimentsSummarySection';

// Define valid experiment status values for type checking
type ExperimentStatus = 'planned' | 'in-progress' | 'completed';

const ExperimentsPage = () => {
  const { currentProject } = useProject();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPhase = searchParams.get('phase') || 'problem';
  const experimentId = searchParams.get('id');
  const createNew = searchParams.get('create') === 'true';
  
  // Validate status parameter against allowed values
  const rawStatus = searchParams.get('status');
  const statusFilter = rawStatus && ['planned', 'in-progress', 'completed'].includes(rawStatus) 
    ? rawStatus as ExperimentStatus
    : null;
  
  // Show summary when no specific experiment is being viewed and not creating a new one
  const showSummary = !experimentId && !createNew;
  
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
      
      setExperiments(processedData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refetch when project, phase, or status filter changes
  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
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
      
      <PhaseNavigation />
      
      <Tabs value={currentPhase} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="problem">Problem Experiments</TabsTrigger>
          <TabsTrigger value="solution">Solution Experiments</TabsTrigger>
          <TabsTrigger value="business-model">Business Model Experiments</TabsTrigger>
        </TabsList>
        
        {showSummary && !statusFilter && (
          <ExperimentsSummarySection
            experiments={experiments}
            projectId={currentProject.id}
          />
        )}
        
        {(!showSummary || statusFilter) && (
          <>
            <TabsContent value="problem">
              <ValidationPhaseIntro 
                phase="problem" 
                onCreateNew={() => document.getElementById('create-experiment-button')?.click()}
                createButtonText="Create Problem Experiment"
              />
              <ExperimentsSection 
                experiments={experiments}
                refreshData={fetchExperiments}
                projectId={currentProject.id}
                isLoading={isLoading}
                experimentType="problem"
              />
            </TabsContent>
            
            <TabsContent value="solution">
              <ValidationPhaseIntro 
                phase="solution" 
                onCreateNew={() => document.getElementById('create-experiment-button')?.click()}
                createButtonText="Create Solution Experiment"
              />
              <ExperimentsSection 
                experiments={experiments}
                refreshData={fetchExperiments}
                projectId={currentProject.id}
                isLoading={isLoading}
                experimentType="solution"
              />
            </TabsContent>
            
            <TabsContent value="business-model">
              <ValidationPhaseIntro 
                phase="growth" 
                onCreateNew={() => document.getElementById('create-experiment-button')?.click()}
                createButtonText="Create Business Model Experiment"
              />
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
    </div>
  );
};

export default ExperimentsPage;
