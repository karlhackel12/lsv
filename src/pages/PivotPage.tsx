
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GitBranch } from 'lucide-react';
import PivotSection from '@/components/PivotSection';
import { PivotOption } from '@/types/pivot';
import PageIntroduction from '@/components/PageIntroduction';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

const PivotPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [isLoadingPivotOptions, setIsLoadingPivotOptions] = useState(true);
  const { toast } = useToast();

  const fetchPivotOptions = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingPivotOptions(true);
      const { data, error } = await supabase
        .from('pivot_options')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Ensure all properties have correct types
      const transformedData: PivotOption[] = data.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
        type: item.type || '',
        description: item.description || '',
        trigger: item.trigger || '',
        likelihood: (item.likelihood as 'high' | 'medium' | 'low') || 'medium',
        project_id: item.project_id || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
      
      setPivotOptions(transformedData);
    } catch (err) {
      console.error('Error fetching pivot options:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load pivot options',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPivotOptions(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchPivotOptions();
    }
  }, [currentProject]);
  
  const handleCreatePivotOption = () => {
    // This will be passed to the ValidationPhaseIntro component to trigger
    // the creation of a new pivot option
    const pivotSection = document.querySelector('#pivot-section');
    if (pivotSection) {
      // If the section exists, find the Add Pivot Option button and click it
      const addButton = pivotSection.querySelector('button');
      if (addButton) {
        addButton.click();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error instanceof Error ? error.message : 'Failed to load project'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageIntroduction
        title="Pivot Planning and Decision Framework"
        icon={<GitBranch className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              A pivot is a structured course correction designed to test a new fundamental hypothesis about your product,
              business model, or growth strategy. It's not a failure, but rather a critical part of the startup process.
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Pivot triggers:</strong> Specific metric thresholds that indicate when to consider a pivot</li>
              <li><strong>Evidence-based:</strong> Decisions based on data from experiments and customer feedback</li>
              <li><strong>Preserves value:</strong> Maintains what you've learned while changing direction</li>
              <li><strong>Strategic change:</strong> Addresses fundamental assumptions, not just tactics</li>
            </ul>
            <p className="mt-2">
              <strong>Common pivot types:</strong>
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Zoom-in pivot:</strong> A single feature becomes the whole product</li>
              <li><strong>Zoom-out pivot:</strong> The product becomes a feature of a larger solution</li>
              <li><strong>Customer segment pivot:</strong> Changing which customers you're serving</li>
              <li><strong>Customer need pivot:</strong> Solving a different problem for the same customers</li>
              <li><strong>Platform pivot:</strong> Changing from an application to a platform or vice versa</li>
              <li><strong>Business architecture pivot:</strong> Switching between high margin/low volume and low margin/high volume</li>
              <li><strong>Value capture pivot:</strong> Changing your revenue model or monetization strategy</li>
              <li><strong>Engine of growth pivot:</strong> Changing your customer acquisition strategy</li>
              <li><strong>Channel pivot:</strong> Changing how you deliver your product to customers</li>
              <li><strong>Technology pivot:</strong> Using a different technology to solve the same problem</li>
            </ul>
            <p className="mt-2">
              When considering a pivot, clearly document your current state, the new hypothesis you're testing,
              and the specific metrics that will validate or invalidate this new direction.
            </p>
          </>
        }
      />

      <ValidationPhaseIntro
        phase="pivot"
        onCreateNew={handleCreatePivotOption}
        createButtonText="Add Pivot Option"
      />

      {currentProject && !isLoadingPivotOptions && (
        <div id="pivot-section">
          <PivotSection
            pivotOptions={pivotOptions}
            refreshData={fetchPivotOptions}
            projectId={currentProject.id}
          />
        </div>
      )}
      
      {isLoadingPivotOptions && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pivot options...</span>
        </div>
      )}
    </div>
  );
};

export default PivotPage;
