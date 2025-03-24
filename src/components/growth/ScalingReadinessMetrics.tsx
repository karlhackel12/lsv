
import React, { useState, useEffect } from 'react';
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScalingMetricForm from './ScalingMetricForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Loader2, TrendingUp, Info } from 'lucide-react';
import ScalingReadinessTable from './ScalingReadinessTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGrowthModelsState } from '@/hooks/growth/use-growth-models-state';
import ScalingReadinessSection from './ScalingReadinessSection';

interface ScalingReadinessMetricsProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: GrowthMetric[];
}

const ScalingReadinessMetrics: React.FC<ScalingReadinessMetricsProps> = ({ 
  projectId,
  refreshData,
  growthMetrics
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [editingMetric, setEditingMetric] = useState<ScalingReadinessMetric | null>(null);
  const [showLearnStartupView, setShowLearnStartupView] = useState(true);
  const { toast } = useToast();
  const [linkedMetrics, setLinkedMetrics] = useState<Record<string, GrowthMetric[]>>({});
  const [growthModel, setGrowthModel] = useState<any>(null);
  const [growthChannels, setGrowthChannels] = useState<any[]>([]);

  useEffect(() => {
    fetchScalingMetrics();
    fetchGrowthModel();
    fetchGrowthChannels();
  }, [projectId]);

  useEffect(() => {
    // Create a mapping of scaling metric IDs to growth metrics
    const linkMap: Record<string, GrowthMetric[]> = {};
    
    growthMetrics.forEach(metric => {
      if (metric.scaling_metric_id) {
        if (!linkMap[metric.scaling_metric_id]) {
          linkMap[metric.scaling_metric_id] = [];
        }
        linkMap[metric.scaling_metric_id].push(metric);
      }
    });
    
    setLinkedMetrics(linkMap);
  }, [growthMetrics]);

  const fetchGrowthModel = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_models')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setGrowthModel(data[0]);
      }
    } catch (error) {
      console.error('Error fetching growth model:', error);
    }
  };

  const fetchGrowthChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_channels')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      setGrowthChannels(data || []);
    } catch (error) {
      console.error('Error fetching growth channels:', error);
    }
  };

  const fetchScalingMetrics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setScalingMetrics(data || []);
    } catch (error) {
      console.error('Error fetching scaling metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scaling readiness metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMetric = () => {
    setEditingMetric(null);
    setIsAddingMetric(true);
  };
  
  const handleEditMetric = (metric: ScalingReadinessMetric) => {
    setEditingMetric(metric);
    setIsAddingMetric(true);
  };
  
  const handleDeleteMetric = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('scaling_readiness_metrics')
        .delete()
        .eq('id', metricId);
        
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The scaling readiness metric has been deleted',
      });
      
      await fetchScalingMetrics();
      refreshData();
    } catch (error) {
      console.error('Error deleting scaling metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the metric',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveMetric = async () => {
    await fetchScalingMetrics();
    await refreshData();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading scaling readiness metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scaling Readiness</h2>
          <p className="text-gray-500 mt-1">
            Assess your startup's readiness to scale based on Lean Startup principles
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showLearnStartupView ? "default" : "outline"} 
            onClick={() => setShowLearnStartupView(true)}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Framework View</span>
          </Button>
          <Button 
            variant={!showLearnStartupView ? "default" : "outline"} 
            onClick={() => setShowLearnStartupView(false)}
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            <span>Metrics View</span>
          </Button>
        </div>
      </div>
      
      <Card className="bg-blue-50 border-blue-100 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Lean Startup Scaling Framework</h3>
              <p className="text-sm text-blue-700 mt-1">
                This framework helps assess your readiness to scale based on Lean Startup principles. It focuses on validated learning, innovation accounting, and sustainable growth engines rather than premature scaling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showLearnStartupView ? (
        <ScalingReadinessSection 
          growthModel={growthModel}
          projectId={projectId}
          metrics={growthMetrics}
          channels={growthChannels}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Scaling Metrics</h3>
              <p className="text-gray-500 text-sm">
                Track key metrics that indicate your startup's readiness to scale
              </p>
            </div>
            <Button onClick={handleAddMetric} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Metric</span>
            </Button>
          </div>
          
          {scalingMetrics.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <Alert>
                  <AlertDescription>
                    No scaling readiness metrics found. Add metrics to track your startup's readiness to scale.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <ScalingReadinessTable 
              metrics={scalingMetrics} 
              onEdit={handleEditMetric} 
              onDelete={handleDeleteMetric}
              linkedGrowthMetrics={linkedMetrics}
            />
          )}
          
          {isAddingMetric && (
            <ScalingMetricForm
              projectId={projectId}
              metric={editingMetric}
              onSave={handleSaveMetric}
              onClose={() => setIsAddingMetric(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ScalingReadinessMetrics;
