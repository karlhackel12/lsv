import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Experiment, Hypothesis, GrowthMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LinkIcon, TrendingUp, Lightbulb, ArrowUpRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface GrowthHypothesisData {
  id: string;
  action: string;
  outcome: string;
  success_criteria: string | null;
  stage: string;
  metric_id: string | null;
}

interface ExperimentConnectionsPanelProps {
  experiment: Experiment;
  projectId: string;
  relatedHypothesis?: Hypothesis | null;
  onRefresh: () => void;
}

const ExperimentConnectionsPanel = ({
  experiment,
  projectId,
  relatedHypothesis,
  onRefresh
}: ExperimentConnectionsPanelProps) => {
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthHypotheses, setGrowthHypotheses] = useState<GrowthHypothesisData[]>([]);
  const [selectedGrowthHypothesis, setSelectedGrowthHypothesis] = useState<GrowthHypothesisData | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingHypotheses, setIsLoadingHypotheses] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<GrowthMetric | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrowthMetrics();
    fetchGrowthHypotheses();
  }, [projectId]);

  const validateGrowthMetricStatus = (status: string): 'on-track' | 'at-risk' | 'off-track' => {
    if (status === 'on-track' || status === 'at-risk' || status === 'off-track') {
      return status as 'on-track' | 'at-risk' | 'off-track';
    }
    return 'off-track';
  };

  const fetchGrowthMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const {
        data,
        error
      } = await supabase.from('growth_metrics').select('*').eq('project_id', projectId);
      if (error) throw error;
      const transformedData: GrowthMetric[] = (data || []).map(item => ({
        ...item,
        status: validateGrowthMetricStatus(item.status)
      }));
      setGrowthMetrics(transformedData);
    } catch (err) {
      console.error('Error fetching growth metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const fetchGrowthHypotheses = async () => {
    try {
      setIsLoadingHypotheses(true);
      const {
        data,
        error
      } = await supabase.from('growth_hypotheses').select('*').eq('project_id', projectId).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setGrowthHypotheses(data || []);
    } catch (err) {
      console.error('Error fetching growth hypotheses:', err);
    } finally {
      setIsLoadingHypotheses(false);
    }
  };

  const linkExperimentToHypothesis = async () => {
    if (!relatedHypothesis) return;
    try {
      const {
        error
      } = await supabase.from('experiments').update({
        hypothesis_id: relatedHypothesis.id,
        updated_at: new Date().toISOString()
      }).eq('id', experiment.id);
      if (error) throw error;
      toast({
        title: 'Linked successfully',
        description: 'This experiment is now linked to the hypothesis'
      });
      onRefresh();
    } catch (err) {
      console.error('Error linking experiment to hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to link experiment to hypothesis',
        variant: 'destructive'
      });
    }
  };

  const linkExperimentToGrowthHypothesis = async (growthHypothesis: GrowthHypothesisData) => {
    try {
      setSelectedGrowthHypothesis(growthHypothesis);
      toast({
        title: 'Connected to growth hypothesis',
        description: 'This experiment is now tracking the selected growth hypothesis'
      });
    } catch (err) {
      console.error('Error linking to growth hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to link experiment to growth hypothesis',
        variant: 'destructive'
      });
    }
  };

  const createGrowthExperiment = async (metric: GrowthMetric) => {
    try {
      const {
        data: models,
        error: modelsError
      } = await supabase.from('growth_models').select('*').eq('project_id', projectId).limit(1);
      if (modelsError) throw modelsError;
      if (!models || models.length === 0) {
        toast({
          title: 'No growth model found',
          description: 'Please create a growth model first',
          variant: 'destructive'
        });
        return;
      }
      const growthModelId = models[0].id;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);
      const {
        error
      } = await supabase.from('growth_experiments').insert({
        title: `From exp: ${experiment.title}`,
        hypothesis: experiment.hypothesis,
        metric_id: metric.id,
        expected_lift: 10,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'planned',
        notes: `Created from experiment "${experiment.title}". Method: ${experiment.method}`,
        growth_model_id: growthModelId,
        project_id: projectId
      });
      if (error) throw error;
      toast({
        title: 'Growth experiment created',
        description: 'New growth experiment created based on this experiment'
      });
      setSelectedMetric(metric);
    } catch (err) {
      console.error('Error creating growth experiment:', err);
      toast({
        title: 'Error',
        description: 'Failed to create growth experiment',
        variant: 'destructive'
      });
    }
  };

  const navigateToHypothesis = () => {
    if (relatedHypothesis) {
      navigate('/hypotheses', {
        state: {
          highlightId: relatedHypothesis.id
        }
      });
    } else {
      navigate('/hypotheses');
    }
  };

  const navigateToGrowth = (tab?: string, metricId?: string) => {
    navigate('/growth', {
      state: {
        tab: tab || 'metrics',
        metricId
      }
    });
  };

  const handleNavigateToGrowth = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigateToGrowth();
  };

  const handleNavigateToGrowthTab = (tab: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigateToGrowth(tab);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
          Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="hypothesis" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="hypothesis" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Hypothesis
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hypothesis" className="space-y-4">
            {relatedHypothesis ? (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-validation-gray-900">Linked Hypothesis</h3>
                    <p className="text-sm text-validation-gray-600">This experiment is testing the following hypothesis:</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={navigateToHypothesis}>
                    View All Hypotheses
                  </Button>
                </div>
                
                <Card className="border border-validation-blue-200 bg-validation-blue-50 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-validation-blue-800">{relatedHypothesis.statement}</p>
                        <div className="flex mt-2">
                          <StatusBadge status={relatedHypothesis.status as any} />
                          <span className="ml-2 text-xs px-2 py-1 bg-validation-gray-100 text-validation-gray-600 rounded">
                            {relatedHypothesis.phase} phase
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={navigateToHypothesis}
                        className="flex items-center text-validation-blue-600"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-6">
                <Lightbulb className="h-10 w-10 text-validation-gray-300 mx-auto mb-3" />
                <h3 className="text-validation-gray-800 font-medium mb-1">No Hypothesis Linked</h3>
                <p className="text-validation-gray-600 mb-4 max-w-md mx-auto">
                  This experiment is not yet connected to any hypothesis. Link it to track validation progress more effectively.
                </p>
                <Button 
                  variant="outline" 
                  onClick={navigateToHypothesis}
                  className="mx-auto"
                >
                  Link to Hypothesis
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-validation-gray-900">Growth Metrics</h3>
                    <p className="text-sm text-validation-gray-600">Create a growth experiment from this validation experiment:</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNavigateToGrowth}>
                    View Growth Metrics
                  </Button>
                </div>
                
                {isLoadingMetrics ? (
                  <div className="py-4 text-center text-validation-gray-500">Loading metrics...</div>
                ) : growthMetrics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {growthMetrics.map(metric => (
                      <Card key={metric.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-validation-gray-900">{metric.name}</h4>
                              <p className="text-xs text-validation-gray-600">{metric.category}</p>
                              <div className="flex items-center mt-2">
                                <StatusBadge 
                                  status={metric.status === 'on-track' ? 'completed' : 
                                          metric.status === 'at-risk' ? 'in-progress' : 'planned'}
                                />
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => createGrowthExperiment(metric)}
                              disabled={!!selectedMetric}
                              className={selectedMetric?.id === metric.id ? 
                                "bg-green-100 text-green-800 border-green-300" : ""}
                            >
                              {selectedMetric?.id === metric.id ? "Created" : "Create Experiment"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-validation-gray-50 rounded-lg border border-dashed border-validation-gray-200">
                    <TrendingUp className="h-10 w-10 text-validation-gray-300 mx-auto mb-3" />
                    <h3 className="text-validation-gray-800 font-medium mb-1">No Growth Metrics</h3>
                    <p className="text-validation-gray-600 mb-4 max-w-md mx-auto">
                      You haven't created any growth metrics yet. Define metrics to track your growth.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleNavigateToGrowthTab('metrics')}
                      className="mx-auto"
                    >
                      Create Growth Metrics
                    </Button>
                  </div>
                )}
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-validation-gray-900">Growth Hypotheses</h3>
                    <p className="text-sm text-validation-gray-600">Connect this experiment to a growth hypothesis:</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNavigateToGrowthTab('hypotheses')}
                  >
                    View Hypotheses
                  </Button>
                </div>
                
                {isLoadingHypotheses ? (
                  <div className="py-4 text-center text-validation-gray-500">Loading hypotheses...</div>
                ) : growthHypotheses.length > 0 ? (
                  <div className="space-y-2">
                    {growthHypotheses.slice(0, 3).map(hypothesis => (
                      <Card key={hypothesis.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-validation-gray-900">
                                {hypothesis.action} → {hypothesis.outcome}
                              </h4>
                              <p className="text-xs text-validation-gray-600 mt-1">
                                {hypothesis.success_criteria || "No success criteria defined"}
                              </p>
                              <div className="flex items-center mt-2">
                                <span className="text-xs px-2 py-1 bg-validation-gray-100 text-validation-gray-600 rounded">
                                  {hypothesis.stage}
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => linkExperimentToGrowthHypothesis(hypothesis)}
                              disabled={selectedGrowthHypothesis?.id === hypothesis.id}
                              className={selectedGrowthHypothesis?.id === hypothesis.id ? 
                                "bg-green-100 text-green-800 border-green-300" : ""}
                            >
                              {selectedGrowthHypothesis?.id === hypothesis.id ? "Connected" : "Connect"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {growthHypotheses.length > 3 && (
                      <div className="text-center">
                        <Button 
                          variant="link" 
                          onClick={handleNavigateToGrowthTab('hypotheses')}
                        >
                          View all {growthHypotheses.length} hypotheses
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-validation-gray-50 rounded-lg border border-dashed border-validation-gray-200">
                    <Lightbulb className="h-10 w-10 text-validation-gray-300 mx-auto mb-3" />
                    <h3 className="text-validation-gray-800 font-medium mb-1">No Growth Hypotheses</h3>
                    <p className="text-validation-gray-600 mb-4 max-w-md mx-auto">
                      You haven't created any growth hypotheses yet. Create some to improve your growth strategy.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleNavigateToGrowthTab('hypotheses')}
                      className="mx-auto"
                    >
                      Create Growth Hypotheses
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExperimentConnectionsPanel;

