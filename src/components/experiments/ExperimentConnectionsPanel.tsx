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

  // Helper function to validate status
  const validateGrowthMetricStatus = (status: string): 'on-track' | 'at-risk' | 'off-track' => {
    if (status === 'on-track' || status === 'at-risk' || status === 'off-track') {
      return status as 'on-track' | 'at-risk' | 'off-track';
    }
    // Default to 'off-track' if the status is not valid
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
      
      // Transform the data to ensure status is of the correct type
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
        description: 'This experiment is now linked to the hypothesis',
      });
      
      onRefresh();
    } catch (err) {
      console.error('Error linking experiment to hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to link experiment to hypothesis',
        variant: 'destructive',
      });
    }
  };
  
  const linkExperimentToGrowthHypothesis = async (growthHypothesis: GrowthHypothesisData) => {
    try {
      // This is a conceptual linking since we don't have a direct relationship in the database yet
      // In a full implementation, we'd update the experiment with a growth_hypothesis_id field
      
      // For now, let's show the connection in the UI
      setSelectedGrowthHypothesis(growthHypothesis);
      
      toast({
        title: 'Connected to growth hypothesis',
        description: 'This experiment is now tracking the selected growth hypothesis',
      });
    } catch (err) {
      console.error('Error linking to growth hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to link experiment to growth hypothesis',
        variant: 'destructive',
      });
    }
  };

  const createGrowthExperiment = async (metric: GrowthMetric) => {
    try {
      // Get the first growth model for this project
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
          variant: 'destructive',
        });
        return;
      }
      
      const growthModelId = models[0].id;
      
      // Create a growth experiment based on this experiment
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // 2 weeks experiment by default
      
      const { error } = await supabase
        .from('growth_experiments')
        .insert({
          title: `From exp: ${experiment.title}`,
          hypothesis: experiment.hypothesis,
          metric_id: metric.id,
          expected_lift: 10, // Default expected lift
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'planned',
          notes: `Created from experiment "${experiment.title}". Method: ${experiment.method}`,
          growth_model_id: growthModelId,
          project_id: projectId,
        });
        
      if (error) throw error;
      
      toast({
        title: 'Growth experiment created',
        description: 'New growth experiment created based on this experiment',
      });
      
      setSelectedMetric(metric);
    } catch (err) {
      console.error('Error creating growth experiment:', err);
      toast({
        title: 'Error',
        description: 'Failed to create growth experiment',
        variant: 'destructive',
      });
    }
  };

  const navigateToHypothesis = () => {
    if (relatedHypothesis) {
      navigate('/hypotheses', { state: { highlightId: relatedHypothesis.id } });
    } else {
      navigate('/hypotheses');
    }
  };

  const navigateToGrowth = (tab?: string, metricId?: string) => {
    navigate('/growth', { state: { tab: tab || 'metrics', metricId } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <LinkIcon className="h-5 w-5 mr-2 text-blue-500" />
          Experiment Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hypothesis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hypothesis" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Hypothesis
            </TabsTrigger>
            <TabsTrigger value="growth-hypothesis" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth Hypothesis
            </TabsTrigger>
            <TabsTrigger value="growth-metrics" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hypothesis" className="pt-4">
            {relatedHypothesis ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-blue-700 mb-1">Linked Hypothesis</h3>
                      <p className="text-sm text-gray-700">{relatedHypothesis.statement}</p>
                    </div>
                    <StatusBadge status={relatedHypothesis.status as any} />
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <p className="text-xs text-gray-500 mb-2">Success Criteria:</p>
                    <p className="text-sm">{relatedHypothesis.criteria}</p>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={navigateToHypothesis}
                    >
                      View Hypothesis
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">
                    This experiment is testing the linked hypothesis. The results of this experiment
                    will help validate or invalidate the hypothesis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
                  <h3 className="text-sm font-medium text-amber-700 mb-1">No Linked Hypothesis</h3>
                  <p className="text-sm text-gray-600">
                    This experiment is not linked to any hypothesis. You can create a new hypothesis
                    or link an existing one.
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline"
                    className="justify-start"
                    onClick={navigateToHypothesis}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Browse Hypotheses
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="growth-hypothesis" className="pt-4">
            {growthHypotheses.length > 0 ? (
              <div className="space-y-4">
                {selectedGrowthHypothesis ? (
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-blue-700 mb-1">Connected Growth Hypothesis</h3>
                        <p className="text-sm text-gray-700 mb-2">
                          We believe that <span className="font-medium">{selectedGrowthHypothesis.action}</span> will 
                          result in <span className="font-medium">{selectedGrowthHypothesis.outcome}</span>
                        </p>
                      </div>
                    </div>
                    
                    {selectedGrowthHypothesis.success_criteria && (
                      <div className="mt-2 pt-2 border-t border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Success Criteria:</p>
                        <p className="text-sm">{selectedGrowthHypothesis.success_criteria}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => navigateToGrowth('hypotheses')}
                      >
                        View All Hypotheses
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      Connect this experiment to a growth hypothesis to track its impact on your growth model:
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {growthHypotheses.map(hypothesis => (
                        <div 
                          key={hypothesis.id}
                          className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => linkExperimentToGrowthHypothesis(hypothesis)}
                        >
                          <div className="text-sm">
                            <p className="font-medium mb-1">
                              We believe that <span className="text-blue-600">{hypothesis.action}</span>
                            </p>
                            <p className="mb-2">
                              will result in <span className="text-blue-600">{hypothesis.outcome}</span>
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              size="sm"
                              variant="ghost" 
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                linkExperimentToGrowthHypothesis(hypothesis);
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
                <h3 className="text-sm font-medium text-amber-700 mb-1">No Growth Hypotheses Found</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You haven't created any growth hypotheses yet. Create a growth hypothesis to track
                  your experiments' impact on your growth model.
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToGrowth('hypotheses')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create Growth Hypothesis
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="growth-metrics" className="pt-4">
            {growthMetrics.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  Create a growth experiment based on this experiment to measure its impact on a specific metric:
                </p>
                
                <div className="grid grid-cols-1 gap-2">
                  {growthMetrics.slice(0, 3).map(metric => (
                    <div 
                      key={metric.id} 
                      className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMetric(metric)}
                    >
                      <div>
                        <h4 className="text-sm font-medium">{metric.name}</h4>
                        <p className="text-xs text-gray-500">{metric.category}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          createGrowthExperiment(metric);
                        }}
                      >
                        Create Growth Experiment
                      </Button>
                    </div>
                  ))}
                </div>
                
                {selectedMetric && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-green-600 mb-2">
                      Growth experiment created for metric "{selectedMetric.name}"!
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={navigateToGrowth}
                    >
                      Go to Growth Page
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md border">
                <h3 className="text-sm font-medium mb-1">No Growth Metrics</h3>
                <p className="text-sm text-gray-600 mb-3">
                  You don't have any growth metrics defined yet. Create metrics in the Growth section.
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/growth')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Go to Growth Section
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExperimentConnectionsPanel;
