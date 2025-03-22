
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, LinkIcon, FileText, CheckSquare, AlertTriangle, CalendarClock } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExperimentTimeline from './ExperimentTimeline';
import { useNavigate } from 'react-router-dom';

interface ExperimentDetailViewProps {
  experiment: Experiment;
  onEdit: () => void;
  onClose?: () => void;
  relatedHypothesis: Hypothesis | null;
}

const ExperimentDetailView: React.FC<ExperimentDetailViewProps> = ({
  experiment,
  onEdit,
  onClose,
  relatedHypothesis
}) => {
  const navigate = useNavigate();
  
  const navigateToHypothesis = () => {
    if (relatedHypothesis) {
      navigate('/hypotheses');
    }
  };
  
  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-validation-gray-900 mb-2">{experiment.title}</h1>
          <div className="flex items-center space-x-3 text-sm text-validation-gray-500">
            <StatusBadge status={experiment.status} />
            <span className="flex items-center">
              <CalendarClock className="h-4 w-4 mr-1" />
              {new Date(experiment.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {experiment.category || 'Experiment'}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit className="h-4 w-4 mr-2" />
          Edit Experiment
        </Button>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="results">Results & Decisions</TabsTrigger>
          {experiment.status === 'completed' && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Hypothesis</h2>
            <p className="text-validation-gray-700">{experiment.hypothesis}</p>
            
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
                  <p className="text-sm text-validation-gray-700">{relatedHypothesis.statement}</p>
                  <div className="flex items-center mt-2">
                    <StatusBadge status={relatedHypothesis.status as any} />
                    <span className="text-xs text-validation-gray-500 ml-2">
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
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.method}</p>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Success Criteria</h2>
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.metrics}</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            {experiment.results ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{experiment.results}</p>
            ) : (
              <div className="flex items-center text-validation-gray-500">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                No results recorded yet
              </div>
            )}
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Key Insights</h2>
              {experiment.insights ? (
                <p className="text-validation-gray-700 whitespace-pre-line">{experiment.insights}</p>
              ) : (
                <div className="flex items-center text-validation-gray-500">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  No insights recorded yet
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Decisions & Next Steps</h2>
              {experiment.decisions ? (
                <p className="text-validation-gray-700 whitespace-pre-line">{experiment.decisions}</p>
              ) : (
                <div className="flex items-center text-validation-gray-500">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                  No decisions recorded yet
                </div>
              )}
            </Card>
          </div>
          
          {relatedHypothesis && (
            <Card className="p-6 bg-blue-50 border-blue-100">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-blue-500" />
                Update Hypothesis Status
              </h2>
              <p className="text-sm text-validation-gray-600 mb-4">
                Based on the results of this experiment, you may want to update the status of the related hypothesis.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => navigate('/hypotheses')}
                >
                  Mark as Validated
                </Button>
                <Button
                  variant="outline"
                  size="sm" 
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => navigate('/hypotheses')}
                >
                  Mark as Invalid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => navigate('/hypotheses')}
                >
                  View Hypothesis
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {experiment.status === 'completed' && (
          <TabsContent value="timeline" className="mt-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Experiment Timeline</h2>
              <ExperimentTimeline experiment={experiment} />
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ExperimentDetailView;
