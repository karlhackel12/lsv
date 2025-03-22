
import React from 'react';
import { Experiment, Hypothesis } from '@/types/database';
import { Link } from 'react-router-dom';
import { Lightbulb, ArrowRight, LineChart, Beaker, LightbulbOff, FileCheck, PenLine } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Card from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExperimentTimeline from './ExperimentTimeline';

interface ExperimentDetailViewProps {
  experiment: Experiment;
  relatedHypothesis?: Hypothesis | null;
  onEdit: () => void;
}

const ExperimentDetailView: React.FC<ExperimentDetailViewProps> = ({ 
  experiment, 
  relatedHypothesis,
  onEdit
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-validation-gray-900">{experiment.title}</h2>
          <div className="flex items-center mt-2">
            <StatusBadge status={experiment.status as any} />
          </div>
        </div>
        <Button onClick={onEdit}>
          <PenLine className="w-4 h-4 mr-2" />
          Edit Experiment
        </Button>
      </div>
      
      {relatedHypothesis && (
        <div className="mb-6 p-4 bg-validation-blue-50 rounded-lg border border-validation-blue-100">
          <h3 className="text-md font-medium text-validation-gray-700 flex items-center mb-2">
            <Lightbulb className="h-5 w-5 text-validation-blue-500 mr-2" />
            Related Hypothesis
          </h3>
          <p className="text-validation-gray-800">{experiment.hypothesis}</p>
          <div className="mt-2 flex justify-between items-center">
            <StatusBadge status={relatedHypothesis.status as any} />
            <Link 
              to={`/hypotheses?id=${relatedHypothesis.id}`} 
              className="text-validation-blue-600 text-sm flex items-center hover:underline"
            >
              View Hypothesis
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      )}
      
      <ExperimentTimeline experiment={experiment} />
      
      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="details" className="flex items-center">
            <Beaker className="h-4 w-4 mr-2" />
            Method
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center">
            <FileCheck className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <LightbulbOff className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <div className="bg-white rounded-md p-4 border">
            <h3 className="font-medium text-lg mb-2">Methodology</h3>
            <p className="text-validation-gray-700 whitespace-pre-line">{experiment.method}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-4">
          <div className="bg-white rounded-md p-4 border">
            <h3 className="font-medium text-lg mb-2">Key Metrics Being Measured</h3>
            <p className="text-validation-gray-700 whitespace-pre-line">{experiment.metrics}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <div className="bg-white rounded-md p-4 border">
            <h3 className="font-medium text-lg mb-2">Results</h3>
            {experiment.results ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.results}</p>
            ) : (
              <div className="p-4 bg-validation-gray-50 rounded text-center">
                <p className="text-validation-gray-500">No results have been recorded yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={onEdit}
                >
                  Log Results
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-4 space-y-4">
          <div className="bg-white rounded-md p-4 border">
            <h3 className="font-medium text-lg mb-2">Insights</h3>
            {experiment.insights ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.insights}</p>
            ) : (
              <p className="text-validation-gray-500">No insights have been recorded yet.</p>
            )}
          </div>
          
          <div className="bg-white rounded-md p-4 border">
            <h3 className="font-medium text-lg mb-2">Decisions</h3>
            {experiment.decisions ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.decisions}</p>
            ) : (
              <p className="text-validation-gray-500">No decisions have been recorded yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ExperimentDetailView;
