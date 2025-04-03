
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/use-project';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const OverviewSection = () => {
  const { currentProject, fetchProjectStages, updateStage, updateProjectStage } = useProject();
  const [stages, setStages] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState('pipeline');
  const { toast } = useToast();
  
  useEffect(() => {
    if (currentProject) {
      loadStages();
    }
  }, [currentProject]);
  
  const loadStages = async () => {
    try {
      const stageData = await fetchProjectStages();
      if (stageData) {
        setStages(stageData);
      }
    } catch (error) {
      console.error('Failed to load stages:', error);
    }
  };
  
  const markStageComplete = async (stageId: string) => {
    try {
      await updateStage(stageId, { status: 'complete' });
      toast({
        title: 'Stage Updated',
        description: 'Stage marked as complete',
      });
      loadStages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      });
    }
  };
  
  const moveToStage = async (stageName: string) => {
    try {
      if (!currentProject) return;
      
      const result = await updateProjectStage(stageName);
      if (result) {
        toast({
          title: 'Stage Updated',
          description: `Moved to ${stageName} stage`,
        });
        loadStages();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update current stage',
        variant: 'destructive',
      });
    }
  };
  
  if (!currentProject) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>Select a project to view its details</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{currentProject.name}</CardTitle>
        <CardDescription>{currentProject.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pipeline">Validation Pipeline</TabsTrigger>
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex flex-nowrap overflow-x-auto gap-4 pb-2">
              {stages.map((stage) => (
                <Card 
                  key={stage.id} 
                  className={`min-w-[220px] ${stage.name === currentProject.current_stage ? 'border-2 border-primary' : ''}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                      {stage.status === 'complete' ? (
                        <Badge variant="success" className="ml-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : stage.name === currentProject.current_stage ? (
                        <Badge variant="secondary" className="ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                    <div className="mt-3 flex justify-between">
                      {stage.name === currentProject.current_stage ? (
                        <Button size="sm" variant="outline" onClick={() => markStageComplete(stage.id)}>
                          Mark Complete
                        </Button>
                      ) : stage.status !== 'complete' ? (
                        <Button size="sm" variant="outline" onClick={() => moveToStage(stage.name)}>
                          Make Current
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="text-center p-8">
              <p className="text-gray-500">Metrics dashboard coming soon</p>
              <Button variant="outline" className="mt-4">
                View All Metrics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OverviewSection;
