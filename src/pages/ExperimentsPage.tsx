
import React, { useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import ExperimentsSection from '@/components/ExperimentsSection';
import { FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExperimentsPage = () => {
  const { currentProject, isLoading: projectLoading } = useProject();
  const { toast } = useToast();
  
  useEffect(() => {
    console.log("ExperimentsPage mounted, currentProject:", currentProject);
    
    if (!currentProject && !projectLoading) {
      console.log("No project available after loading");
      toast({
        title: "No project selected",
        description: "Please select a project to view experiments",
        variant: "destructive"
      });
    }
  }, [currentProject, projectLoading, toast]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading project data...</span>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Project Selected</h2>
          <p className="text-gray-500">Select a project from the dropdown in the header to view experiments.</p>
        </div>
      </div>
    );
  }
  
  return (
    <ExperimentsSection 
      experiments={[]} 
      refreshData={() => console.log("Refresh data called")} 
      projectId={currentProject.id}
      isLoading={false}
      isGrowthExperiment={false}
    />
  );
};

export default ExperimentsPage;
