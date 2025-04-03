import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GitBranch, GitFork, CheckCircle, Clipboard, FileCheck, FileText } from 'lucide-react';
import { PivotOption } from '@/types/pivot';
import PageIntroduction from '@/components/PageIntroduction';
import PivotOptionsTable from '@/components/pivot/PivotOptionsTable';
import PivotDecisionFramework from '@/components/pivot/PivotDecisionFramework';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PivotOptionForm from '@/components/forms/PivotOptionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import InfoTooltip from '@/components/InfoTooltip';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { Project } from '@/types/database';

interface PivotTracking {
  validation_data_evaluated: boolean;
  pivot_assessment_conducted: boolean;
  strategic_decision_made: boolean;
  reasoning_documented: boolean;
}

const PivotPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [isLoadingPivotOptions, setIsLoadingPivotOptions] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPivotOption, setSelectedPivotOption] = useState<PivotOption | null>(null);
  const [pivotToDelete, setPivotToDelete] = useState<PivotOption | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('framework');
  const [pivotTracking, setPivotTracking] = useState<PivotTracking>({
    validation_data_evaluated: false,
    pivot_assessment_conducted: false,
    strategic_decision_made: false,
    reasoning_documented: false
  });
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

  const fetchPivotTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project pivot tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
      
      if (projectError) {
        console.error('Error fetching project data:', projectError);
        return;
      }
      
      if (projectData) {
        // Use type assertion to safely access pivot_tracking
        let trackingData: PivotTracking | null = null;
        
        if (projectData.pivot_tracking) {
          try {
            trackingData = typeof projectData.pivot_tracking === 'string'
              ? JSON.parse(projectData.pivot_tracking)
              : projectData.pivot_tracking as PivotTracking;
              
            setPivotTracking(trackingData);
          } catch (err) {
            console.error('Error parsing pivot tracking data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching pivot tracking data:', err);
    }
  };
  
  // Function to update pivot tracking in the database
  const updatePivotTracking = async (field: keyof PivotTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...pivotTracking, [field]: value };
      
      // Optimistically update the UI
      setPivotTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          pivot_tracking: updatedTracking 
        } as Partial<Project>)
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Pivot Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating pivot tracking:', err);
      
      // Revert the local state change on error
      setPivotTracking(pivotTracking);
    }
  };

  const deletePivotOption = async (id: string) => {
    return supabase
      .from('pivot_options')
      .delete()
      .eq('id', id);
  };

  const refreshPivotOptions = () => {
    fetchPivotOptions();
  };

  const confirmDelete = () => {
    if (!pivotToDelete) return;
    
    deletePivotOption(pivotToDelete.id)
      .then(() => {
        toast({
          title: 'Pivot option deleted',
          description: 'The pivot option has been successfully deleted.'
        });
        refreshPivotOptions();
      })
      .catch((error) => {
        console.error('Error deleting pivot option:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete pivot option.',
          variant: 'destructive'
        });
      })
      .finally(() => {
        setIsDeleteDialogOpen(false);
        setPivotToDelete(null);
      });
  };

  useEffect(() => {
    if (currentProject) {
      fetchPivotOptions();
      fetchPivotTrackingData();
    }
  }, [currentProject]);
  
  const handleCreateNew = () => {
    setSelectedPivotOption(null);
    setIsFormOpen(true);
  };

  const handleEdit = (option: PivotOption) => {
    setSelectedPivotOption(option);
    setIsFormOpen(true);
  };

  const handleDelete = (option: PivotOption) => {
    setPivotToDelete(option);
    setIsDeleteDialogOpen(true);
  };

  const handleAssessmentComplete = () => {
    setActiveTab('options');
    
    // Update tracking when assessment is completed
    updatePivotTracking('validation_data_evaluated', true);
    updatePivotTracking('pivot_assessment_conducted', true);
    
    toast({
      title: 'Assessment Complete',
      description: 'Your pivot assessment has been saved successfully. Now you can define potential pivot options.'
    });
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Clipboard />,
      title: 'Data-Based Decisions',
      description: 'Base your pivot decision on real metrics and customer evidence.'
    },
    {
      icon: <GitFork />,
      title: 'Consider Multiple Options',
      description: 'Evaluate different types of pivots before choosing a direction.'
    },
    {
      icon: <FileCheck />,
      title: 'Keep What Works',
      description: 'Preserve the validated elements while changing what doesn\'t work.'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'validation_data_evaluated',
      label: 'Validation Data Evaluated',
      description: 'Automatically tracked when using the framework',
      icon: <Clipboard />,
      checked: pivotTracking.validation_data_evaluated,
      disabled: true
    },
    {
      key: 'pivot_assessment_conducted',
      label: 'Pivot Assessment Conducted',
      description: 'Automatically tracked when completing assessment',
      icon: <GitFork />,
      checked: pivotTracking.pivot_assessment_conducted,
      disabled: true
    },
    {
      key: 'strategic_decision_made',
      label: 'Strategic Decision Made',
      description: 'Toggle when you\'ve made your final pivot decision',
      icon: <FileCheck />,
      checked: pivotTracking.strategic_decision_made,
      onCheckedChange: (checked) => updatePivotTracking('strategic_decision_made', checked)
    },
    {
      key: 'reasoning_documented',
      label: 'Decision Reasoning Documented',
      description: 'Toggle when you\'ve documented your pivot decision reasoning',
      icon: <FileText />,
      checked: pivotTracking.reasoning_documented,
      onCheckedChange: (checked) => updatePivotTracking('reasoning_documented', checked)
    }
  ];

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
    <div className="space-y-6">
      <PageIntroduction
        title="Pivot Planning and Framework"
        icon={<GitBranch className="h-5 w-5 text-blue-500" />}
        description="A pivot is a structured course correction designed to test a new fundamental hypothesis about your product, business model, or growth strategy when metrics indicate your current approach isn't working."
        showDescription={false}
      />
      
      <BestPracticesCard 
        title="Best Practices for Pivot Decisions"
        color="pink"
        tooltip="These practices help you make effective pivot decisions based on validated learning."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Pivot Decision Checklist"
        color="pink"
        items={checklistItems}
      />
      
      {/* Add ValidationPhaseIntro for consistency */}
      <ValidationPhaseIntro 
        phase="pivot"
        onCreateNew={handleCreateNew}
        createButtonText="Add Pivot Option"
      />
      
      {currentProject && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
            <TabsTrigger value="framework">Decision Framework</TabsTrigger>
            <TabsTrigger value="options">Pivot Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="framework" className="mt-0">
            <PivotDecisionFramework 
              projectId={currentProject.id}
              onComplete={handleAssessmentComplete}
            />
          </TabsContent>
          
          <TabsContent value="options" className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Pivot Options</h2>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pivot Option
              </Button>
            </div>

            {!isLoadingPivotOptions ? (
              <PivotOptionsTable
                pivotOptions={pivotOptions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading pivot options...</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {isFormOpen && currentProject && (
        <PivotOptionForm
          isOpen={isFormOpen}
          pivotOption={selectedPivotOption}
          projectId={currentProject.id}
          metrics={[]}
          onSave={fetchPivotOptions}
          onClose={() => setIsFormOpen(false)}
        />
      )}
      
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this pivot option?</p>
            <div className="flex justify-end mt-4">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                Delete
              </Button>
              <Button 
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 ml-2"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PivotPage;
