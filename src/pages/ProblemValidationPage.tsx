
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

const ProblemValidationPage = () => {
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
        .eq('phase', 'problem')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching hypotheses:', error);
        return;
      }
      
      // Add originalId field to each hypothesis
      const processedData = data?.map(item => ({
        ...item,
        phase: 'problem' as 'problem',
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
        <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
        <p className="text-gray-500">Select a project from the dropdown in the header to view hypotheses.</p>
      </div>
    </div>;
  }
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <PageIntroduction 
        title="Problem Validation" 
        icon={<Lightbulb className="h-5 w-5 text-blue-500" />}
        description="Create and test hypotheses to validate if your target customers have the problem you think they have."
      />
      
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
    </div>
  );
};

export default ProblemValidationPage;
