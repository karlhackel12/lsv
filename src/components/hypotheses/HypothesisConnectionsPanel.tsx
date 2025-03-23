
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateExperiment = () => {
    setIsExperimentFormOpen(true);
  };

  const navigateToExperiment = (experimentId: string) => {
    navigate('/experiments', { 
      state: { experimentId }
    });
  };

  const handleExperimentSaved = () => {
    setIsExperimentFormOpen(false);
    onRefresh();
    toast({
      title: 'Experiment created',
      description: 'New experiment has been created and linked to this hypothesis',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
          Hypothesis Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="experiments" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="experiments" className="flex items-center">
              <FlaskConical className="h-4 w-4 mr-2" />
              Experiments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="experiments" className="pt-4">
            {linkedExperiments.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-blue-700">Linked Experiments</h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCreateExperiment}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    New Experiment
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {linkedExperiments.map(experiment => (
                    <div 
                      key={experiment.id} 
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigateToExperiment(experiment.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{experiment.title}</h4>
                        <StatusBadge status={experiment.status as any} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{experiment.method}</p>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToExperiment(experiment.id);
                          }}
                        >
                          View Details
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-700 mb-2">No Linked Experiments</h3>
                  <p className="text-sm text-gray-600">
                    There are no experiments linked to this hypothesis yet. Create an experiment to test this hypothesis.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={handleCreateExperiment}
                    className="flex items-center"
                  >
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Create New Experiment
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Experiment Form Dialog */}
      {isExperimentFormOpen && (
        <ExperimentForm
          isOpen={isExperimentFormOpen}
          onClose={() => setIsExperimentFormOpen(false)}
          onSave={handleExperimentSaved}
          experiment={null}
          projectId={projectId}
          hypothesisId={hypothesis.id}
        />
      )}
    </Card>
  );
};

export default HypothesisConnectionsPanel;
