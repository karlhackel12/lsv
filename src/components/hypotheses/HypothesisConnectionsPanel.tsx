
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hypothesis, Experiment } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LinkIcon, FlaskConical, ArrowUpRight, Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import ExperimentForm from '@/components/forms/ExperimentForm';

interface HypothesisConnectionsPanelProps {
  hypothesis: Hypothesis;
  projectId: string;
  linkedExperiments: Experiment[];
  onRefresh: () => void;
}

const HypothesisConnectionsPanel = ({
  hypothesis,
  projectId,
  linkedExperiments,
  onRefresh
}: HypothesisConnectionsPanelProps) => {
  const [isExperimentFormOpen, setIsExperimentFormOpen] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  
  const handleCreateExperiment = () => {
    setIsExperimentFormOpen(true);
  };
  
  const navigateToExperiment = (experimentId: string) => {
    navigate('/experiments', {
      state: {
        experimentId
      }
    });
  };
  
  const handleExperimentSaved = () => {
    setIsExperimentFormOpen(false);
    onRefresh();
    toast({
      title: 'Experiment created',
      description: 'New experiment has been created and linked to this hypothesis'
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Connected Experiments</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="experiments" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="experiments" className="flex items-center">
              <FlaskConical className="h-4 w-4 mr-2" />
              Experiments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="experiments">
            {linkedExperiments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">No experiments are connected to this hypothesis yet.</p>
                <Button onClick={handleCreateExperiment} className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Experiment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">{linkedExperiments.length} experiment(s) connected</span>
                  <Button onClick={handleCreateExperiment} size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Experiment
                  </Button>
                </div>
                
                {linkedExperiments.map((experiment) => (
                  <div key={experiment.id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{experiment.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={experiment.status} />
                          <span className="text-sm text-gray-500">
                            Method: {experiment.method}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateToExperiment(experiment.id)}
                        className="flex items-center text-blue-600"
                      >
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {experiment.hypothesis}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Experiment Form Dialog */}
      {isExperimentFormOpen && <ExperimentForm isOpen={isExperimentFormOpen} onClose={() => setIsExperimentFormOpen(false)} onSave={handleExperimentSaved} experiment={null} projectId={projectId} hypothesisId={hypothesis.id} />}
    </Card>
  );
};

export default HypothesisConnectionsPanel;
