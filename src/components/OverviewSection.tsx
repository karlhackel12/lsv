import React, { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import StageEditDialog from '@/components/stage/StageEditDialog';

// Update the StatusType definition to match the enum from the database
type StatusType = 'not-started' | 'in-progress' | 'complete';
const OverviewSection = () => {
  const {
    currentProject,
    fetchProjectStages,
    updateStage
  } = useProject();
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
          status: stage.status as StatusType
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
          status: stage.status as StatusType
        }));
        setCurrentStages(typedStages);
      }
    }
  };
  return;
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