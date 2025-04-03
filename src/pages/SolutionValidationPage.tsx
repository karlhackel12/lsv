import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { FlaskConical, Users, MessageCircle, Target } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { useToast } from '@/hooks/use-toast';

// Define the interface for solution tracking
interface SolutionTracking {
  solution_hypotheses_defined: boolean;
  solution_sketches_created: boolean;
  tested_with_customers: boolean;
  positive_feedback_received: boolean;
}

const SolutionValidationPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createHypothesisTrigger, setCreateHypothesisTrigger] = useState(0);
  const { toast } = useToast();
  
  const [solutionTracking, setSolutionTracking] = useState<SolutionTracking>({
    solution_hypotheses_defined: false,
    solution_sketches_created: false,
    tested_with_customers: false,
    positive_feedback_received: false
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
      
      // Auto-update the solution_hypotheses_defined flag if hypotheses exist
      if (processedData && processedData.length > 0 && !solutionTracking.solution_hypotheses_defined) {
        updateSolutionTracking('solution_hypotheses_defined', true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch solution tracking data
  const fetchSolutionTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
        
      if (projectError) {
        console.error('Error fetching solution tracking:', projectError);
        return;
      }
      
      // Check if solution_tracking exists in the projectData
      if (projectData) {
        let trackingData: SolutionTracking | null = null;
        
        if (projectData.solution_tracking) {
          try {
            trackingData = typeof projectData.solution_tracking === 'string'
              ? JSON.parse(projectData.solution_tracking)
              : projectData.solution_tracking as SolutionTracking;
              
            setSolutionTracking(trackingData);
          } catch (err) {
            console.error('Error parsing solution tracking data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  // Update solution tracking state
  const updateSolutionTracking = async (field: keyof SolutionTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...solutionTracking, [field]: value };
      
      // Optimistically update the UI
      setSolutionTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          solution_tracking: updatedTracking 
        })
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Solution Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating solution tracking:', err);
      
      // Revert the local state change on error
      setSolutionTracking(solutionTracking);
    }
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchSolutionTrackingData();
      fetchHypotheses();
    }
  }, [currentProject]);
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Users />,
      title: 'Test with Real Users',
      description: "Show prototypes to potential users who have the problem you're solving."
    },
    {
      icon: <Target />,
      title: 'Measure Solution-Problem Fit',
      description: 'Assess how well your solution addresses the validated problem.'
    },
    {
      icon: <MessageCircle />,
      title: 'Collect Actionable Feedback',
      description: 'Get specific feedback about what works and what needs improvement.'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'solution_hypotheses_defined',
      label: 'Solution Hypotheses Defined',
      description: 'Automatically tracked when you create solution hypotheses',
      icon: <FlaskConical />,
      checked: solutionTracking.solution_hypotheses_defined,
      disabled: true
    },
    {
      key: 'solution_sketches_created',
      label: 'Solution Sketches Created',
      description: 'Toggle when you\'ve created wireframes or mockups',
      icon: <Target />,
      checked: solutionTracking.solution_sketches_created,
      onCheckedChange: (checked) => updateSolutionTracking('solution_sketches_created', checked)
    },
    {
      key: 'tested_with_customers',
      label: 'Tested With Customers',
      description: 'Toggle when you\'ve shown your solution to potential customers',
      icon: <Users />,
      checked: solutionTracking.tested_with_customers,
      onCheckedChange: (checked) => updateSolutionTracking('tested_with_customers', checked)
    },
    {
      key: 'positive_feedback_received',
      label: 'Positive Feedback Received',
      description: 'Toggle when you\'ve received positive validation from users',
      icon: <MessageCircle />,
      checked: solutionTracking.positive_feedback_received,
      onCheckedChange: (checked) => updateSolutionTracking('positive_feedback_received', checked)
    }
  ];
  
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
        showDescription={false}
      />
      
      <BestPracticesCard 
        title="Best Practices for Solution Validation"
        color="green"
        tooltip="These practices help you validate your solution ideas more effectively."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Solution Validation Checklist"
        color="green"
        items={checklistItems}
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
