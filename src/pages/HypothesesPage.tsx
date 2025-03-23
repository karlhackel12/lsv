
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProject } from '@/hooks/use-project';
import PhaseNavigation from '@/components/PhaseNavigation';
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
  
  if (!currentProject) {
    return <div>Select a project to view hypotheses</div>;
  }
  
  return (
    <div className="space-y-6">
      <PageIntroduction 
        title="Hypothesis Testing" 
        icon={<Lightbulb className="h-5 w-5 text-blue-500" />}
        description="Create and test hypotheses to validate your business model. The scientific method helps you make evidence-based decisions."
      />
      
      <PhaseNavigation />
      
      <Tabs value={currentPhase} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="problem">Problem Validation</TabsTrigger>
          <TabsTrigger value="solution">Solution Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="problem">
          <ValidationPhaseIntro 
            phase="problem" 
            onCreateNew={() => document.getElementById('create-hypothesis-button')?.click()}
            createButtonText="Create Problem Hypothesis"
          />
          <HypothesesSection 
            hypotheses={hypotheses}
            refreshData={fetchHypotheses}
            projectId={currentProject.id}
            isLoading={isLoading}
            phaseType="problem"
          />
        </TabsContent>
        
        <TabsContent value="solution">
          <ValidationPhaseIntro 
            phase="solution" 
            onCreateNew={() => document.getElementById('create-hypothesis-button')?.click()}
            createButtonText="Create Solution Hypothesis"
          />
          <HypothesesSection 
            hypotheses={hypotheses}
            refreshData={fetchHypotheses}
            projectId={currentProject.id}
            isLoading={isLoading}
            phaseType="solution"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HypothesesPage;
