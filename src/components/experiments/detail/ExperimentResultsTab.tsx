
import React from 'react';
import { Card } from '@/components/ui/card';
import { Beaker, Layers, FileText, Info } from 'lucide-react';
import { Experiment } from '@/types/database';

interface ExperimentResultsTabProps {
  experiment: Experiment;
}

const ExperimentResultsTab = ({ experiment }: ExperimentResultsTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-l-4 border-l-blue-500">
        <div className="flex items-start">
          <div className="mr-4">
            <Beaker className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            {experiment.results ? (
              <p className="text-gray-700 whitespace-pre-line">{experiment.results}</p>
            ) : (
              <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                No results recorded yet. Use the "Log Results" button to add them when available.
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-start">
            <div className="mr-4">
              <Layers className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Key Insights</h2>
              {experiment.insights ? (
                <p className="text-gray-700 whitespace-pre-line">{experiment.insights}</p>
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  No insights recorded yet.
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-start">
            <div className="mr-4">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Decisions & Next Steps</h2>
              {experiment.decisions ? (
                <p className="text-gray-700 whitespace-pre-line">{experiment.decisions}</p>
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-md text-gray-500 border border-gray-200">
                  <Info className="h-5 w-5 mr-2 text-blue-500" />
                  No decisions recorded yet.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExperimentResultsTab;
