
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { FlaskConical } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

const SolutionValidationPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        .eq('phase', 'solution')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching hypotheses:', error);
        return;
      }
      
      // Add originalId field to each hypothesis
      const processedData = data?.map(item => ({
        ...item,
        phase: 'solution' as 'solution',
        originalId: item.id
      })) as Hypothesis[];
      
      setHypotheses(processedData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchHypotheses();
    }
  }, [currentProject]);
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  if (!currentProject) {
    return <div className="flex justify-center items-center h-full p-8">
      <div className="text-center">
        <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
        <p className="text-gray-500">Select a project from the dropdown in the header to view hypotheses.</p>
      </div>
    </div>;
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageIntroduction 
        title="Solution Validation" 
        icon={<FlaskConical className="h-5 w-5 text-blue-500" />}
        description="Test whether your proposed solution effectively addresses the validated problem."
      />
      
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
    </div>
  );
};

export default SolutionValidationPage;
