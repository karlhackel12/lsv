
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
          <Card className="p-6 col-span-1 lg:col-span-2 shadow-md bg-white">
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
        
        <Card className="p-6 shadow-md bg-white">
          <h2 className="text-xl font-bold mb-4 text-validation-gray-900">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-validation-gray-200 pb-2">
              <span className="text-validation-gray-700 font-medium">Hypotheses</span>
              <span className="font-medium text-validation-blue-600">4</span>
            </div>
            <div className="flex justify-between items-center border-b border-validation-gray-200 pb-2">
              <span className="text-validation-gray-700 font-medium">Experiments</span>
              <span className="font-medium text-validation-blue-600">2</span>
            </div>
            <div className="flex justify-between items-center border-b border-validation-gray-200 pb-2">
              <span className="text-validation-gray-700 font-medium">MVP Features</span>
              <span className="font-medium text-validation-blue-600">8</span>
            </div>
          </div>
        </Card>
      </div>
      
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
  );
};

export default Index;
