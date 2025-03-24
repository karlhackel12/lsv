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
  return <Card>
      
      
    </Card>;
};
export default ExperimentConnectionsPanel;