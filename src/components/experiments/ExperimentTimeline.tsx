
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import { Experiment } from '@/types/database';

interface ExperimentTimelineProps {
  experiment: Experiment;
}

const ExperimentTimeline: React.FC<ExperimentTimelineProps> = ({ experiment }) => {
  const createdDate = parseISO(experiment.created_at);
  const updatedDate = parseISO(experiment.updated_at);
  
  // Determine if dates are different by more than a minute
  const datesAreDifferent = Math.abs(updatedDate.getTime() - createdDate.getTime()) > 60000;
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-validation-gray-500 mb-2 flex items-center">
        <Clock className="h-4 w-4 mr-1" />
        Timeline
      </h4>
      
      <div className="relative flex items-center">
        <div className="h-0.5 bg-validation-gray-200 w-full absolute"></div>
        
        <div className="relative z-10 flex justify-between w-full">
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${experiment.status === 'planned' ? 'bg-validation-blue-500' : 'bg-validation-green-500'} mb-1`}></div>
            <span className="text-xs text-validation-gray-600 text-center">
              Created<br />
              {format(createdDate, 'MMM d, yyyy')}
            </span>
          </div>
          
          {(experiment.status === 'in-progress' || experiment.status === 'completed') && (
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full ${experiment.status === 'in-progress' ? 'bg-validation-blue-500' : 'bg-validation-green-500'} mb-1`}></div>
              <span className="text-xs text-validation-gray-600 text-center">
                Started<br />
                {format(experiment.status === 'in-progress' ? updatedDate : createdDate, 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {experiment.status === 'completed' && (
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-validation-green-500 mb-1"></div>
              <span className="text-xs text-validation-gray-600 text-center">
                Completed<br />
                {format(updatedDate, 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {experiment.status !== 'completed' && (
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-validation-gray-300 mb-1"></div>
              <span className="text-xs text-validation-gray-400 text-center">
                Pending<br />
                Completion
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="px-4 py-2 bg-validation-gray-50 rounded-md inline-flex items-center">
          <span className="text-sm text-validation-gray-600">
            {experiment.status === 'planned' ? (
              <>
                <span className="font-medium">Status:</span> Planned - Ready to start
              </>
            ) : experiment.status === 'in-progress' ? (
              <>
                <span className="font-medium">Status:</span> In Progress - Gathering data
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-validation-green-500 mr-1 inline" />
                <span className="font-medium">Completed:</span> Results recorded
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExperimentTimeline;
