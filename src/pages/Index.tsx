
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/hooks/use-project';

const Index = () => {
  const { user } = useAuth();
  const { projects, currentProject, isLoading, error } = useProject();
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome, {user?.user_metadata?.full_name || user?.email}</p>
      {isLoading ? (
        <p>Loading projects...</p>
      ) : error ? (
        <div className="bg-validation-red-50 border border-validation-red-200 rounded-lg p-4 my-4">
          <h3 className="font-semibold">Error loading projects</h3>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      ) : (
        <>
          {projects?.length > 0 ? (
            <Dashboard />
          ) : (
            <div className="bg-validation-yellow-50 border border-validation-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">No Projects Found</h3>
              <p>You need to create a project first.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
