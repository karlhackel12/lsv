
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import { Hypothesis, Experiment } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import ExperimentConnectionsPanel from '../ExperimentConnectionsPanel';

interface ExperimentOverviewTabProps {
  experiment: Experiment;
  relatedHypothesis: Hypothesis | null;
  projectId?: string;
  onRefresh?: () => void;
  navigateToHypothesis: () => void;
}

const ExperimentOverviewTab = ({ 
  experiment, 
  relatedHypothesis, 
  projectId,
  onRefresh,
  navigateToHypothesis
}: ExperimentOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Hypothesis</h2>
        <p className="text-gray-700 mb-4">{experiment.hypothesis}</p>
        
        {relatedHypothesis && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-blue-700">Linked to Hypothesis</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 bg-white"
                onClick={navigateToHypothesis}
              >
                View Hypothesis
              </Button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-700">{relatedHypothesis.statement}</p>
              <div className="flex items-center mt-2">
                <StatusBadge status={relatedHypothesis.status as any} />
                <span className="text-xs text-gray-500 ml-2">
                  Last updated: {new Date(relatedHypothesis.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Experiment Method</h2>
          <p className="text-gray-700 whitespace-pre-line">{experiment.method}</p>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Success Criteria</h2>
          <p className="text-gray-700 whitespace-pre-line">{experiment.metrics}</p>
        </Card>
      </div>
      
      {projectId && onRefresh && (
        <ExperimentConnectionsPanel
          experiment={experiment}
          projectId={projectId}
          relatedHypothesis={relatedHypothesis}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};

export default ExperimentOverviewTab;
