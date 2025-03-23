
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageIntroduction from '@/components/PageIntroduction';
import { LayoutGrid, Lightbulb, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <PageIntroduction
        title="Product Validation Dashboard"
        icon={<LayoutGrid className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              Welcome to your Product Validation Dashboard. This dashboard helps you track your progress through the 
              validation journey using Lean Startup methodology:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              {[
                { title: "Problem Validation", description: "Verify problem significance" },
                { title: "Solution Validation", description: "Test solution effectiveness" },
                { title: "MVP", description: "Build minimal viable product" },
                { title: "Product-Market Fit", description: "Achieve measurable traction" },
                { title: "Scale", description: "Grow customer base" }
              ].map((step, index) => (
                <Card key={index} className={`border-l-4 ${index === 0 ? 'border-l-blue-500' : index === 1 ? 'border-l-green-500' : index === 2 ? 'border-l-yellow-500' : index === 3 ? 'border-l-purple-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{index + 1}. {step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-4">
              Use the sections below to track your hypotheses, experiments, MVP features, and key metrics. 
              This evidence-based approach will guide your product decisions and increase your chances of success.
            </p>
          </>
        }
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
