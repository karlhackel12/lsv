
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Lightbulb, Plus, Beaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageIntroduction from '@/components/PageIntroduction';
import Dashboard from '@/components/Dashboard';
import ValidationProgressSummary from '@/components/dashboard/ValidationProgressSummary';
import MilestoneAchievements from '@/components/dashboard/MilestoneAchievements';
import BusinessPlanBanner from '@/components/dashboard/BusinessPlanBanner';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user } = useAuth();
  const { 
    projects, 
    currentProject, 
    isLoading, 
    error, 
    updateCurrentStage,
  } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to move to a specific validation stage
  const moveToStage = async (stageName: string) => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updateCurrentStage(currentProject.id, stageName);
      toast({
        title: "Stage Updated",
        description: `Moved to ${stageName} stage`,
      });
      
      // Navigate to the appropriate page based on stage
      switch (stageName) {
        case 'problem':
          navigate('/problem-validation');
          break;
        case 'solution':
          navigate('/solution-validation');
          break;
        case 'experiments':
          navigate('/experiments');
          break;
        case 'mvp':
          navigate('/mvp');
          break;
        case 'metrics':
          navigate('/metrics');
          break;
        case 'pivot':
          navigate('/pivot');
          break;
        case 'growth':
          navigate('/growth');
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error moving to stage:', err);
      toast({
        title: "Error",
        description: "Failed to update the validation stage",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-red-50 border border-red-200 p-4 shadow-md">
        <h3 className="font-semibold text-red-700">Error loading projects</h3>
        <p className="text-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
      </Card>
    );
  }
  
  if (!projects?.length) {
    return (
      <Card className="bg-blue-50 border border-blue-200 p-6 shadow-md">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Lightbulb className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="font-semibold text-xl text-blue-700">No Projects Found</h3>
          <p className="text-blue-600 max-w-md">Create your first project to start validating your business ideas using the Lean Startup methodology.</p>
          <Button className="mt-4" onClick={() => document.getElementById('create-project-button')?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {currentProject && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ValidationProgressSummary projectId={currentProject.id} />
            <MilestoneAchievements projectId={currentProject.id} />
          </div>
        </>
      )}
      
      {/* Keep existing dashboard functionality */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Dashboard Metrics</h3>
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
