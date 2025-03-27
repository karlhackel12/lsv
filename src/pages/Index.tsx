
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Lightbulb, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageIntroduction from '@/components/PageIntroduction';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <PageIntroduction
        title="Product Validation Dashboard"
        icon={<LayoutGrid className="h-5 w-5 text-blue-500" />}
        description="Track your progress validating your business assumptions using evidence-based experiments."
      />
      
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
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
        ) : error ? (
          <Card className="bg-red-50 border border-red-200 p-4 shadow-md">
            <h3 className="font-semibold text-red-700">Error loading projects</h3>
            <p className="text-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
          </Card>
        ) : (
          <>
            {projects?.length > 0 ? (
              <Dashboard />
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
