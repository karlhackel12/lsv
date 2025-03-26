
import React from 'react';
import ScalingReadinessMetrics from './ScalingReadinessMetrics';

interface ScalingReadinessChecklistProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: any[];
  growthExperiments: any[];
  growthChannels: any[];
  isMetricFormOpen?: boolean;
  onMetricFormClose?: () => void;
}

const ScalingReadinessChecklist: React.FC<ScalingReadinessChecklistProps> = ({
  projectId,
  refreshData,
  growthMetrics,
  isMetricFormOpen = false,
  onMetricFormClose = () => {}
}) => {
  return (
    <div className="space-y-4">
      <ScalingReadinessMetrics 
        projectId={projectId} 
        refreshData={refreshData} 
        growthMetrics={growthMetrics}
        isFormOpen={isMetricFormOpen}
        onFormClose={onMetricFormClose}
      />
    </div>
  );
};

export default ScalingReadinessChecklist;
