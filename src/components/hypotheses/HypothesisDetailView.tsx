
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, ArrowRight, FileText, CalendarClock } from 'lucide-react';
import { Hypothesis } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface HypothesisDetailViewProps {
  hypothesis: Hypothesis;
  onEdit: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  projectId?: string;
}

const HypothesisDetailView: React.FC<HypothesisDetailViewProps> = ({
  hypothesis,
  onEdit,
  onClose,
  onRefresh,
  projectId
}) => {
  const navigate = useNavigate();
  
  const handleCreateExperiment = () => {
    navigate('/experiments', { 
      state: { 
        createNew: true, 
        hypothesisId: hypothesis.id 
      } 
    });
  };
  
  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-validation-gray-900 mb-2">{hypothesis.statement}</h1>
          <div className="flex items-center space-x-3 text-sm text-validation-gray-500">
            <StatusBadge status={hypothesis.status} />
            <span className="flex items-center">
              <CalendarClock className="h-4 w-4 mr-1" />
              {new Date(hypothesis.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {hypothesis.category || 'Value Hypothesis'}
            </span>
          </div>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onEdit} className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleCreateExperiment} className="flex items-center">
            <ArrowRight className="h-4 w-4 mr-2" />
            Run Experiment
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="evidence">Evidence & Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Hypothesis Statement</h2>
            <p className="text-validation-gray-700">{hypothesis.statement}</p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Success Criteria</h2>
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.criteria}</p>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Experiment Approach</h2>
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.experiment}</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="evidence" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Evidence</h2>
            {hypothesis.evidence ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.evidence}</p>
            ) : (
              <div className="flex flex-col space-y-4">
                <p className="text-validation-gray-500">No evidence recorded yet</p>
                <Button onClick={handleCreateExperiment} className="w-fit">
                  Run an experiment to collect evidence
                </Button>
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            {hypothesis.result ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.result}</p>
            ) : (
              <div className="flex flex-col space-y-4">
                <p className="text-validation-gray-500">No results recorded yet</p>
                <Button onClick={handleCreateExperiment} className="w-fit">
                  Run an experiment to get results
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HypothesisDetailView;
