
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import Card from '@/components/Card';
import PageIntroduction from '@/components/PageIntroduction';
import { LayoutGrid, Lightbulb } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <PageIntroduction
        title="Product Validation Dashboard"
        icon={<LayoutGrid className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              Welcome to your Product Validation Dashboard. This dashboard helps you track your progress through the 
              validation journey using Lean Startup methodology:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Problem Validation:</strong> Verify that the problem you're solving is real and significant</li>
              <li><strong>Solution Validation:</strong> Test if your proposed solution addresses the problem effectively</li>
              <li><strong>MVP (Minimum Viable Product):</strong> Build the simplest version that allows you to test your key assumptions</li>
              <li><strong>Product-Market Fit:</strong> Achieve measurable traction that proves market demand</li>
              <li><strong>Scale:</strong> Grow your customer base and business model</li>
            </ul>
            <p className="mt-2">
              Use the accordion sections below to track your hypotheses, experiments, MVP features, and key metrics. 
              This evidence-based approach will guide your product decisions and increase your chances of success.
            </p>
          </>
        }
      />
      
      <div className="grid grid-cols-1 gap-6">
        {currentProject && (
          <Card className="p-6 shadow-md bg-white">
            <h2 className="text-xl font-bold mb-4 text-validation-gray-900">{currentProject.name}</h2>
            <p className="text-validation-gray-600 mb-6">{currentProject.description}</p>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-validation-gray-800">Current Stage</h3>
              <div className="bg-validation-gray-100 p-3 rounded-md border border-validation-gray-200">
                <span className="font-medium text-validation-gray-900">{currentProject.stage}</span>
              </div>
            </div>
          </Card>
        )}
        
        {isLoading ? (
          <div className="flex justify-center">
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <Card className="bg-validation-red-50 border border-validation-red-200 p-4 shadow-md">
            <h3 className="font-semibold text-validation-red-700">Error loading projects</h3>
            <p className="text-validation-red-600">{error instanceof Error ? error.message : "Unknown error"}</p>
          </Card>
        ) : (
          <>
            {projects?.length > 0 ? (
              <Dashboard />
            ) : (
              <Card className="bg-validation-yellow-50 border border-validation-yellow-200 p-4 shadow-md">
                <h3 className="font-semibold mb-2 text-validation-yellow-700">No Projects Found</h3>
                <p className="text-validation-yellow-600">You need to create a project first.</p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
