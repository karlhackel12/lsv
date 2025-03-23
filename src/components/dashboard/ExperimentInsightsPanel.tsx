
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Experiment, Hypothesis, GrowthMetric } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Lightbulb, TrendingUp, ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface ExperimentInsightsPanelProps {
  projectId: string;
}

const ExperimentInsightsPanel = ({ projectId }: ExperimentInsightsPanelProps) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchExperiments(),
      fetchHypotheses(),
      fetchGrowthMetrics()
    ]);
    setIsLoading(false);
  };

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setExperiments(data || []);
    } catch (err) {
      console.error('Error fetching experiments:', err);
    }
  };

  const fetchHypotheses = async () => {
    try {
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      setHypotheses(data || []);
    } catch (err) {
      console.error('Error fetching hypotheses:', err);
    }
  };

  const fetchGrowthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Transform the data to ensure status is of the correct type
      const transformedData: GrowthMetric[] = (data || []).map(item => ({
        ...item,
        status: validateGrowthMetricStatus(item.status)
      }));
      
      setMetrics(transformedData);
    } catch (err) {
      console.error('Error fetching growth metrics:', err);
    }
  };
  
  // Helper function to validate status
  const validateGrowthMetricStatus = (status: string): 'on-track' | 'at-risk' | 'off-track' => {
    if (status === 'on-track' || status === 'at-risk' || status === 'off-track') {
      return status as 'on-track' | 'at-risk' | 'off-track';
    }
    // Default to 'off-track' if the status is not valid
    return 'off-track';
  };

  const getHypothesisTestingStatus = () => {
    if (hypotheses.length === 0) return 'not-started';
    
    const validating = hypotheses.filter(h => h.status === 'validating').length;
    const validated = hypotheses.filter(h => h.status === 'validated').length;
    const invalid = hypotheses.filter(h => h.status === 'invalid').length;
    const total = hypotheses.length;
    
    if (validated + invalid === 0) return 'early';
    if ((validated + invalid) / total < 0.5) return 'in-progress';
    return 'advanced';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'early':
        return <Clock className="h-4 w-4 text-amber-400" />;
      case 'in-progress':
        return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'advanced':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const testingStatus = getHypothesisTestingStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
          Experimentation Insights
        </CardTitle>
        <CardDescription>
          Connected view of experiments, hypotheses, and growth metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-blue-700">{experiments.length} Recent Experiments</h3>
              <FlaskConical className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {experiments.filter(e => e.status === 'completed').length} completed
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 px-0 mt-2"
              onClick={() => navigate('/experiments')}
            >
              View all experiments
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-amber-700">{hypotheses.length} Active Hypotheses</h3>
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-center mt-1">
              {getStatusIcon(testingStatus)}
              <p className="text-xs text-amber-600 ml-1">
                {testingStatus === 'not-started' && 'Not started testing yet'}
                {testingStatus === 'early' && 'Early testing phase'}
                {testingStatus === 'in-progress' && 'Testing in progress'}
                {testingStatus === 'advanced' && 'Advanced testing phase'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-amber-600 px-0 mt-2"
              onClick={() => navigate('/hypotheses')}
            >
              View all hypotheses
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          <div className="p-4 bg-green-50 rounded-md border border-green-100">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-green-700">{metrics.length} Growth Metrics</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {metrics.filter(m => m.status === 'on-track').length} on track
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-green-600 px-0 mt-2"
              onClick={() => navigate('/growth')}
            >
              View growth model
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="experiments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="experiments" className="flex items-center">
              <FlaskConical className="h-4 w-4 mr-2" />
              Experiments
            </TabsTrigger>
            <TabsTrigger value="hypotheses" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Hypotheses
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="experiments" className="pt-4">
            {experiments.length > 0 ? (
              <div className="space-y-2">
                {experiments.map(experiment => (
                  <div 
                    key={experiment.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/experiments', { 
                      state: { viewExperiment: experiment.id } 
                    })}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{experiment.title}</h4>
                      <StatusBadge status={experiment.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {experiment.hypothesis}
                    </p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/experiments')}
                >
                  View All Experiments
                </Button>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">No experiments yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/experiments')}
                >
                  Create an Experiment
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hypotheses" className="pt-4">
            {hypotheses.length > 0 ? (
              <div className="space-y-2">
                {hypotheses.map(hypothesis => (
                  <div 
                    key={hypothesis.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/hypotheses', { 
                      state: { highlightId: hypothesis.id } 
                    })}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium line-clamp-1">{hypothesis.statement}</h4>
                      <StatusBadge status={hypothesis.status as any} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {hypothesis.category}
                    </p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/hypotheses')}
                >
                  View All Hypotheses
                </Button>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">No hypotheses yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/hypotheses')}
                >
                  Create a Hypothesis
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="metrics" className="pt-4">
            {metrics.length > 0 ? (
              <div className="space-y-2">
                {metrics.map(metric => (
                  <div 
                    key={metric.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/growth', { 
                      state: { highlightMetric: metric.id } 
                    })}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{metric.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        metric.status === 'on-track' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        Current: {metric.current_value} {metric.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Target: {metric.target_value} {metric.unit}
                      </p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => navigate('/growth')}
                >
                  View All Metrics
                </Button>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-sm text-gray-500">No growth metrics yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/growth')}
                >
                  Create Growth Metrics
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExperimentInsightsPanel;
