
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';
import Card from '@/components/Card';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentProject && (
          <Card className="p-6 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">{currentProject.name}</h2>
            <p className="text-validation-gray-600 mb-6">{currentProject.description}</p>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Stage</h3>
              <div className="bg-validation-gray-100 p-3 rounded-md">
                <span className="font-medium">{currentProject.stage}</span>
              </div>
            </div>
          </Card>
        )}
        
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-validation-gray-600">Hypotheses</span>
              <span className="font-medium">4</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-validation-gray-600">Experiments</span>
              <span className="font-medium">2</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-validation-gray-600">MVP Features</span>
              <span className="font-medium">8</span>
            </div>
          </div>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center">
          <p>Loading projects...</p>
        </div>
      ) : error ? (
        <Card className="bg-validation-red-50 border border-validation-red-200 p-4">
          <h3 className="font-semibold">Error loading projects</h3>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </Card>
      ) : (
        <>
          {projects?.length > 0 ? (
            <Dashboard />
          ) : (
            <Card className="bg-validation-yellow-50 border border-validation-yellow-200 p-4">
              <h3 className="font-semibold mb-2">No Projects Found</h3>
              <p>You need to create a project first.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
