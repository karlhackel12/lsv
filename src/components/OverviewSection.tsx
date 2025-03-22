import React, { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import { StageEditDialog } from '@/components/stage/StageEditDialog';

// Update the StatusType definition to match the enum from the database
type StatusType = 'not-started' | 'in-progress' | 'complete';

const OverviewSection = () => {
  const { currentProject, fetchProjectStages, updateStage } = useProject();
  const [currentStages, setCurrentStages] = useState<{
    id: string;
    name: string;
    description: string;
    position: number;
    status: StatusType;
    project_id: string;
    created_at: string;
    updated_at: string;
  }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{
    id: string;
    name: string;
    description: string;
    position: number;
    status: StatusType;
    project_id: string;
    created_at: string;
    updated_at: string;
  } | null>(null);

  useEffect(() => {
    const loadStages = async () => {
      if (currentProject) {
        const stages = await fetchProjectStages(currentProject.id);
        // Ensure the status is of type StatusType
        const typedStages = stages.map(stage => ({
          ...stage,
          status: stage.status as StatusType,
        }));
        setCurrentStages(typedStages);
      }
    };

    loadStages();
  }, [currentProject, fetchProjectStages]);

  const handleEditStage = (stage: {
    id: string;
    name: string;
    description: string;
    position: number;
    status: StatusType;
    project_id: string;
    created_at: string;
    updated_at: string;
  }) => {
    setSelectedStage(stage);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedStage(null);
  };

  const handleStageSave = async (stageData: Partial<{
    name: string;
    description: string;
    position: number;
    status: StatusType;
    project_id: string;
    created_at: string;
    updated_at: string;
  }>) => {
    if (selectedStage) {
      await updateStage(selectedStage.id, stageData);
      // Refresh stages after saving
      if (currentProject) {
        const stages = await fetchProjectStages(currentProject.id);
        // Ensure the status is of type StatusType
        const typedStages = stages.map(stage => ({
          ...stage,
          status: stage.status as StatusType,
        }));
        setCurrentStages(typedStages);
      }
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Project Overview</h3>
      {currentStages.map((stage) => (
        <div key={stage.id} className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">{stage.name}</h4>
            <button
              onClick={() => handleEditStage(stage)}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
            <div
              className={`h-2.5 rounded-full ${
                stage.status === 'complete'
                  ? 'bg-green-600' 
                  : stage.status === 'in-progress'
                  ? 'bg-blue-600'
                  : 'bg-gray-400'
              }`}
              style={{ width: getStatusPercentage(stage.status) }}
            ></div>
          </div>
        </div>
      ))}

      <StageEditDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        stage={selectedStage}
        onSave={handleStageSave}
      />
    </div>
  );
};

// Make sure getStatusPercentage function uses the correct types:
const getStatusPercentage = (status: StatusType) => {
  switch (status) {
    case 'complete':
      return '100%';
    case 'in-progress':
      return '50%';
    case 'not-started':
    default:
      return '0%';
  }
};

export default OverviewSection;
