
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
  const {
    toast
  } = useToast();
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
      console.log('Linking experiment to hypothesis:', experiment.id, relatedHypothesis.id);
      
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Connections</CardTitle>
      </CardHeader>
      
      <CardContent>
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
          
          <TabsContent value="hypothesis">
            {relatedHypothesis ? (
              <div>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{relatedHypothesis.statement}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={relatedHypothesis.status} />
                        <span className="text-sm text-gray-500">
                          Category: {relatedHypothesis.category}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={navigateToHypothesis}
                      className="flex items-center text-blue-600"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Success Criteria:</p>
                    <p className="text-gray-600">{relatedHypothesis.criteria}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">This experiment is not linked to any hypothesis yet.</p>
                <Button 
                  variant="outline" 
                  onClick={navigateToHypothesis}
                  className="flex items-center"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link to Hypothesis
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="growth">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Growth Metrics</h4>
                {isLoadingMetrics ? (
                  <p className="text-sm text-gray-500">Loading metrics...</p>
                ) : growthMetrics.length === 0 ? (
                  <div className="text-center py-3 border rounded-md">
                    <p className="text-sm text-gray-500">No growth metrics defined yet.</p>
                    <Button 
                      variant="link" 
                      onClick={handleNavigateToGrowth}
                      className="text-sm"
                    >
                      Go to Growth Metrics
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {growthMetrics.slice(0, 3).map(metric => (
                      <div 
                        key={metric.id} 
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div>
                          <h5 className="font-medium text-sm">{metric.name}</h5>
                          <p className="text-xs text-gray-500">
                            {metric.current_value} / {metric.target_value} {metric.unit}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => createGrowthExperiment(metric)}
                        >
                          Track with experiment
                        </Button>
                      </div>
                    ))}
                    {growthMetrics.length > 3 && (
                      <Button 
                        variant="link" 
                        onClick={handleNavigateToGrowthTab('metrics')}
                        className="text-sm"
                      >
                        View all metrics
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Growth Hypotheses</h4>
                {isLoadingHypotheses ? (
                  <p className="text-sm text-gray-500">Loading hypotheses...</p>
                ) : growthHypotheses.length === 0 ? (
                  <div className="text-center py-3 border rounded-md">
                    <p className="text-sm text-gray-500">No growth hypotheses defined yet.</p>
                    <Button 
                      variant="link" 
                      onClick={handleNavigateToGrowthTab('experiments')}
                      className="text-sm"
                    >
                      Go to Growth Experiments
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {growthHypotheses.slice(0, 3).map(hypothesis => (
                      <div 
                        key={hypothesis.id} 
                        className="p-3 border rounded-md hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-sm line-clamp-1">
                              {hypothesis.action}
                            </h5>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {hypothesis.outcome}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => linkExperimentToGrowthHypothesis(hypothesis)}
                          >
                            Link
                          </Button>
                        </div>
                      </div>
                    ))}
                    {growthHypotheses.length > 3 && (
                      <Button 
                        variant="link" 
                        onClick={handleNavigateToGrowthTab('experiments')}
                        className="text-sm"
                      >
                        View all hypotheses
                      </Button>
                    )}
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
