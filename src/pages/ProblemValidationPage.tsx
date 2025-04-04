import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb, Users, MessageCircle, CheckSquare } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { useToast } from '@/hooks/use-toast';

// Define the interface for problem tracking
interface ProblemTracking {
  problem_hypotheses_created: boolean;
  customer_interviews_conducted: boolean;
  pain_points_identified: boolean;
  market_need_validated: boolean;
}

const ProblemValidationPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createHypothesisTrigger, setCreateHypothesisTrigger] = useState(0);
  const { toast } = useToast();
  
  const [problemTracking, setProblemTracking] = useState<ProblemTracking>({
    problem_hypotheses_created: false,
    customer_interviews_conducted: false,
    pain_points_identified: false,
    market_need_validated: false
  });
  
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
      
      // Auto-update the problem_hypotheses_created flag if hypotheses exist
      if (processedData && processedData.length > 0 && !problemTracking.problem_hypotheses_created) {
        updateProblemTracking('problem_hypotheses_created', true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch problem tracking data
  const fetchProblemTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
        
      if (projectError) {
        console.error('Error fetching problem tracking:', projectError);
        return;
      }
      
      // Check if problem_tracking exists in the projectData
      if (projectData) {
        // Use type assertion to safely access problem_tracking
        const trackingData = (projectData as any).problem_tracking as ProblemTracking | null;
        if (trackingData) {
          setProblemTracking(trackingData);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  // Update problem tracking state
  const updateProblemTracking = async (field: keyof ProblemTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...problemTracking, [field]: value };
      
      // Optimistically update the UI
      setProblemTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          // @ts-ignore - problem_tracking field might not exist in the type but will be in the database
          problem_tracking: updatedTracking 
        })
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Problem Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating problem tracking:', err);
      
      // Revert the local state change on error
      setProblemTracking(problemTracking);
    }
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchHypotheses();
      fetchProblemTrackingData();
      
      // Temporarily disabled: project stage update
      /*
      try {
        updateProjectStage('problem');
      } catch (err) {
        console.error('Failed to update project stage:', err);
      }
      */
    }
  }, [currentProject]);
  
  const updateProjectStage = async (stage: string) => {
    if (!currentProject) return;
    
    try {
      // Update the stage property instead of current_stage
      await supabase
        .from('projects')
        .update({ stage: stage })
        .eq('id', currentProject.id);
    } catch (err) {
      console.error('Error updating project stage:', err);
    }
  };
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Users />,
      title: 'Target Specific Customer Segments',
      description: 'Focus on well-defined user groups with specific characteristics.'
    },
    {
      icon: <MessageCircle />,
      title: 'Conduct Customer Interviews',
      description: 'Talk to 5-10 potential customers about their problems and needs.'
    },
    {
      icon: <CheckSquare />,
      title: 'Test Multiple Hypotheses',
      description: 'Create several problem statements to validate simultaneously.'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'problem_hypotheses_created',
      label: 'Problem Hypotheses Created',
      description: 'Automatically tracked when you create hypotheses',
      icon: <Lightbulb />,
      checked: problemTracking.problem_hypotheses_created,
      disabled: true
    },
    {
      key: 'customer_interviews_conducted',
      label: 'Customer Interviews Conducted',
      description: 'Toggle when you\'ve interviewed potential customers',
      icon: <MessageCircle />,
      checked: problemTracking.customer_interviews_conducted,
      onCheckedChange: (checked) => updateProblemTracking('customer_interviews_conducted', checked)
    },
    {
      key: 'pain_points_identified',
      label: 'Pain Points Identified',
      description: 'Toggle when you\'ve identified specific customer pain points',
      icon: <CheckSquare />,
      checked: problemTracking.pain_points_identified,
      onCheckedChange: (checked) => updateProblemTracking('pain_points_identified', checked)
    },
    {
      key: 'market_need_validated',
      label: 'Market Need Validated',
      description: 'Toggle when you\'ve confirmed the market need for your solution',
      icon: <Users />,
      checked: problemTracking.market_need_validated,
      onCheckedChange: (checked) => updateProblemTracking('market_need_validated', checked)
    }
  ];
  
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
        showDescription={false}
      />
      
      <BestPracticesCard 
        title="Best Practices for Problem Validation"
        color="blue"
        tooltip="These practices help you gather evidence and validate your problem hypotheses more effectively."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Problem Validation Checklist"
        color="blue"
        items={checklistItems}
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
