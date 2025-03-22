
import React from 'react';
import HypothesesSection from '@/components/HypothesesSection';
import { useProject } from '@/hooks/use-project';
import MainLayout from '@/components/MainLayout';

const HypothesesPage = () => {
  const { currentProject, isLoading, error } = useProject();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading project data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !currentProject) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-validation-red-500">
            {error instanceof Error ? error.message : 'Project not found'}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <HypothesesSection hypotheses={[]} refreshData={() => {}} projectId={currentProject.id} />
      </div>
    </MainLayout>
  );
};

export default HypothesesPage;
