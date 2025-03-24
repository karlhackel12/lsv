
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
      const { data, error } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId);
      
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
      const { data, error } = await supabase
        .from('growth_hypotheses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
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
      const { error } = await supabase
        .from('experiments')
        .update({
          hypothesis_id: relatedHypothesis.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', experiment.id);
      
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
      const { data: models, error: modelsError } = await supabase
        .from('growth_models')
        .select('*')
        .eq('project_id', projectId)
        .limit(1);
      
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
      
      const { error } = await supabase
        .from('growth_experiments')
        .insert({
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
        <CardTitle className="text-lg">Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hypotheses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hypotheses" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" /> Hypotheses
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" /> Growth
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hypotheses" className="space-y-4">
            {relatedHypothesis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Linked Hypothesis</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={navigateToHypothesis}>
                    View <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                
                <div className="rounded-md border p-3 bg-blue-50">
                  <p className="font-medium">{relatedHypothesis.statement}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={relatedHypothesis.status} />
                    <span className="text-sm text-gray-500">
                      {relatedHypothesis.category}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-validation-gray-600">No hypothesis linked</span>
                  <Button size="sm" onClick={navigateToHypothesis}>
                    Find Hypothesis
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Growth Metrics</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNavigateToGrowth}
              >
                Manage Growth <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            
            {isLoadingMetrics ? (
              <div className="text-center py-4">Loading metrics...</div>
            ) : growthMetrics.length === 0 ? (
              <div className="p-4 text-center border rounded-md">
                <p className="text-validation-gray-600 mb-2">No growth metrics defined</p>
                <Button size="sm" onClick={handleNavigateToGrowthTab('metrics')}>
                  Create Growth Metrics
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {growthMetrics.map(metric => (
                  <div 
                    key={metric.id} 
                    className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={metric.status} />
                        <span className="text-sm text-gray-500">{metric.category}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createGrowthExperiment(metric)}
                    >
                      Create Experiment
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Growth Hypotheses</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNavigateToGrowthTab('hypotheses')}
              >
                View All <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            
            {isLoadingHypotheses ? (
              <div className="text-center py-4">Loading hypotheses...</div>
            ) : growthHypotheses.length === 0 ? (
              <div className="p-4 text-center border rounded-md">
                <p className="text-validation-gray-600 mb-2">No growth hypotheses created</p>
                <Button size="sm" onClick={handleNavigateToGrowthTab('hypotheses')}>
                  Create Growth Hypothesis
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {growthHypotheses.slice(0, 3).map(hypothesis => (
                  <div 
                    key={hypothesis.id} 
                    className="p-2 border rounded-md hover:bg-gray-50"
                  >
                    <p className="font-medium">
                      If we {hypothesis.action}, then {hypothesis.outcome}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        Stage: {hypothesis.stage}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => linkExperimentToGrowthHypothesis(hypothesis)}
                      >
                        <LinkIcon className="h-3.5 w-3.5 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExperimentConnectionsPanel;
