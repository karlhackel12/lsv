
import React from 'react';
import HypothesesSection from '@/components/HypothesesSection';
import { useProject } from '@/hooks/use-project';
import MainLayout from '@/components/MainLayout';

const HypothesesPage = () => {
  const { project, loading, error } = useProject();

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading project data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-validation-red-500">
            {error || 'Project not found'}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <HypothesesSection hypotheses={[]} refreshData={() => {}} projectId={project.id} />
      </div>
    </MainLayout>
  );
};

export default HypothesesPage;
