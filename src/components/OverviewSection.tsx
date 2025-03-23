
import React, { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import StageEditDialog from '@/components/stage/StageEditDialog';
import StepJourney, { Step } from '@/components/StepJourney';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Card from '@/components/Card';

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

  // Convert stages to steps for the StepJourney component
  const stageSteps: Step[] = currentStages.map(stage => {
    let icon;
    switch (stage.status) {
      case 'complete':
        icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
        break;
      case 'in-progress':
        icon = <Clock className="h-5 w-5 text-blue-500" />;
        break;
      default:
        icon = <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
    
    return {
      id: stage.id,
      label: stage.name,
      description: stage.description,
      icon
    };
  });

  // Get the current active stage (the first in-progress one, or the last complete one)
  const getCurrentStageId = () => {
    const inProgressStage = currentStages.find(stage => stage.status === 'in-progress');
    if (inProgressStage) return inProgressStage.id;
    
    // If no in-progress stage, get the last complete one
    const completeStages = currentStages.filter(stage => stage.status === 'complete');
    if (completeStages.length > 0) {
      return completeStages[completeStages.length - 1].id;
    }
    
    // If no stages are complete, return the first one
    return currentStages.length > 0 ? currentStages[0].id : '';
  };

  // Get completed stage IDs
  const getCompletedStageIds = () => {
    return currentStages
      .filter(stage => stage.status === 'complete')
      .map(stage => stage.id);
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Project Overview</h3>
      
      {currentStages.length > 0 ? (
        <Card className="p-5" variant="muted">
          <StepJourney
            steps={stageSteps}
            currentStepId={getCurrentStageId()}
            completedStepIds={getCompletedStageIds()}
            variant="cards"
            className="mb-6"
          />
          
          <div className="mt-4 space-y-4">
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
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-center" variant="muted">
          <p className="text-gray-500">No project stages defined yet.</p>
        </Card>
      )}

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
