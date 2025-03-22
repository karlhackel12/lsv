
import React from 'react';
import { Experiment, Hypothesis } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

export interface ExperimentDetailViewProps {
  experiment: Experiment;
  onEdit: () => void;
  onClose: () => void;
  relatedHypothesis?: Hypothesis | null;
}

const ExperimentDetailView = ({ experiment, onEdit, onClose, relatedHypothesis }: ExperimentDetailViewProps) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{experiment.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Status:</div>
            <div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  experiment.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : experiment.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Hypothesis:</div>
            <div>{experiment.hypothesis}</div>
          </div>

          {relatedHypothesis && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-semibold">Related:</div>
              <div className="bg-blue-50 p-2 rounded border border-blue-100">
                <p className="text-sm font-medium">{relatedHypothesis.statement}</p>
                <p className="text-xs text-blue-600 mt-1">From hypothesis testing</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Method:</div>
            <div>{experiment.method}</div>
          </div>
          
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Metrics:</div>
            <div>{experiment.metrics}</div>
          </div>
          
          {experiment.results && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-semibold">Results:</div>
              <div>{experiment.results}</div>
            </div>
          )}
          
          {experiment.insights && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-semibold">Insights:</div>
              <div>{experiment.insights}</div>
            </div>
          )}
          
          {experiment.decisions && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-semibold">Decisions:</div>
              <div>{experiment.decisions}</div>
            </div>
          )}
          
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Created:</div>
            <div>{formatDate(experiment.created_at)}</div>
          </div>
          
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="font-semibold">Updated:</div>
            <div>{formatDate(experiment.updated_at)}</div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExperimentDetailView;
