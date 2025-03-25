
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScalingReadinessMetrics from './ScalingReadinessMetrics';

interface ScalingReadinessChecklistProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: any[];
  growthExperiments: any[];
  growthChannels: any[];
}

const ScalingReadinessChecklist: React.FC<ScalingReadinessChecklistProps> = ({
  projectId,
  refreshData,
  growthMetrics,
  growthExperiments,
  growthChannels
}) => {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <Card className="border-none shadow-none mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Scaling Readiness Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Track key metrics that indicate your startup's readiness to scale. These metrics are organized into 
              seven categories: Product-Market Fit, Unit Economics, Growth Engine, Team Capacity, 
              Operational Scalability, Financial Readiness, and Market Opportunity.
            </p>
          </CardContent>
        </Card>

        <ScalingReadinessMetrics 
          projectId={projectId} 
          refreshData={refreshData}
          growthMetrics={growthMetrics}
        />
      </div>
    </div>
  );
};

export default ScalingReadinessChecklist;
