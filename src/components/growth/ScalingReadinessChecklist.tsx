
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  growthExperiments,
  growthChannels,
  isMetricFormOpen = false,
  onMetricFormClose = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<string>('metrics');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="metrics">Scaling Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="mt-6">
          <ScalingReadinessMetrics 
            projectId={projectId} 
            refreshData={refreshData} 
            growthMetrics={growthMetrics}
            isFormOpen={isMetricFormOpen}
            onFormClose={onMetricFormClose}
          />
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scaling Readiness Resources</h3>
            <p className="text-gray-600">
              Resources and recommendations to help your startup scale successfully will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScalingReadinessChecklist;
