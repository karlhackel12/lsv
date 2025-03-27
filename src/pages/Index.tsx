
import React, { useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Lightbulb, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageIntroduction from '@/components/PageIntroduction';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  const navigate = useNavigate();
  
  console.log("Index page rendering");
  console.log("Projects:", projects);
  console.log("Current project:", currentProject);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);
  
  useEffect(() => {
    console.log("Index component mounted");
    return () => {
      console.log("Index component unmounted");
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <PageIntroduction
        title="Product Validation Dashboard"
        icon={<LayoutGrid className="h-5 w-5 text-blue-500" />}
        description="Track your progress validating your business assumptions using evidence-based experiments."
      />
      
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
            <span className="text-lg">Loading your projects...</span>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border border-red-200 p-4 shadow-md">
            <h3 className="font-semibold text-red-700">Error loading projects</h3>
            <p className="text-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Card>
        ) : (
          <>
            {projects?.length > 0 ? (
              currentProject ? (
                <Dashboard />
              ) : (
                <Card className="bg-yellow-50 border border-yellow-200 p-6 shadow-md">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Lightbulb className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-xl text-yellow-700">No Project Selected</h3>
                    <p className="text-yellow-600 max-w-md">
                      You have projects available, but none is currently selected. 
                      Please select a project from the dropdown in the header.
                    </p>
                  </div>
                </Card>
              )
            ) : (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
