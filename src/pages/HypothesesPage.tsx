
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

// Define a type for phase to avoid excessive type instantiation
type PhaseType = 'problem' | 'solution';

const HypothesesPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  // Set a default value and use type assertion to avoid type instantiation errors
  const currentPhase = (searchParams.get('phase') || 'problem') as PhaseType;
  const [createHypothesisTrigger, setCreateHypothesisTrigger] = useState(0);
  
  const fetchHypotheses = async () => {
    try {
      setIsLoading(true);
      
      if (!currentProject) return;
      
      // Fetch hypotheses with phase filter
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('phase', currentPhase)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching hypotheses:', error);
        return;
      }
      
      // Add originalId field to each hypothesis for tracking original database ID
      const processedData = data?.map(item => ({
        ...item,
        // Ensure phase is properly typed
        phase: (item.phase === 'solution' ? 'solution' : 'problem') as PhaseType,
        originalId: item.id
      })) as Hypothesis[];
      
      setHypotheses(processedData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refetch when project or phase changes
  useEffect(() => {
    if (currentProject) {
      fetchHypotheses();
    }
  }, [currentProject, currentPhase]);
  
  // Change tab handler
  const handleTabChange = (value: string) => {
    // Use a type guard to ensure value is one of the valid phase types
    const validPhase = value === 'problem' || value === 'solution' ? value : 'problem';
    setSearchParams({ phase: validPhase });
  };
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  if (!currentProject) {
    return <div className="flex justify-center items-center h-full p-8">
      <div className="text-center">
        <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
        <p className="text-gray-500">Select a project from the dropdown in the header to view hypotheses.</p>
      </div>
    </div>;
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageIntroduction 
        title={currentPhase === 'problem' ? "Problem Validation" : "Solution Validation"} 
        icon={<Lightbulb className="h-5 w-5 text-blue-500" />}
        description={currentPhase === 'problem' 
          ? "Create and test hypotheses to validate if your target customers have the problem you think they have."
          : "Test whether your proposed solution effectively addresses the validated problem."
        }
      />
      
      <Tabs value={currentPhase} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="problem">Problem Validation</TabsTrigger>
          <TabsTrigger value="solution">Solution Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="problem" className="space-y-6">
          <ValidationPhaseIntro 
            phase="problem" 
            onCreateNew={handleCreateHypothesis}
            createButtonText="Create Problem Hypothesis"
          />
          <HypothesesSection 
            hypotheses={hypotheses}
            refreshData={fetchHypotheses}
            projectId={currentProject.id}
            isLoading={isLoading}
            phaseType="problem"
            createTrigger={createHypothesisTrigger}
          />
        </TabsContent>
        
        <TabsContent value="solution" className="space-y-6">
          <ValidationPhaseIntro 
            phase="solution" 
            onCreateNew={handleCreateHypothesis}
            createButtonText="Create Solution Hypothesis"
          />
          <HypothesesSection 
            hypotheses={hypotheses}
            refreshData={fetchHypotheses}
            projectId={currentProject.id}
            isLoading={isLoading}
            phaseType="solution"
            createTrigger={createHypothesisTrigger}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HypothesesPage;
