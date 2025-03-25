
import React from 'react';
import { Card } from '@/components/ui/card';
import { Experiment } from '@/types/database';
import { AlertTriangle, CheckCircle2, LightbulbIcon, Compass, TrendingUp } from 'lucide-react';

interface ExperimentResultsTabProps {
  experiment: Experiment;
  isGrowthExperiment?: boolean;
}

const ExperimentResultsTab = ({ 
  experiment,
  isGrowthExperiment = false 
}: ExperimentResultsTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center mb-4">
          {isGrowthExperiment ? (
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          )}
          <h2 className="text-lg font-semibold">Results</h2>
        </div>
        {experiment.results ? (
          <p className="text-gray-700 whitespace-pre-line">{experiment.results}</p>
        ) : (
          <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>No results have been recorded for this {isGrowthExperiment ? "growth " : ""}experiment yet.</p>
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <LightbulbIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold">Insights</h2>
        </div>
        {experiment.insights ? (
          <p className="text-gray-700 whitespace-pre-line">{experiment.insights}</p>
        ) : (
          <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>No insights have been recorded for this {isGrowthExperiment ? "growth " : ""}experiment yet.</p>
          </div>
        )}
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Compass className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold">Decisions & Next Steps</h2>
        </div>
        {experiment.decisions ? (
          <p className="text-gray-700 whitespace-pre-line">{experiment.decisions}</p>
        ) : (
          <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-md">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>No decisions or next steps have been recorded for this {isGrowthExperiment ? "growth " : ""}experiment yet.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExperimentResultsTab;
