
import React, { useState, useEffect } from 'react';
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScalingMetricForm from './ScalingMetricForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import ScalingReadinessTable from './ScalingReadinessTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGrowthModelsState } from '@/hooks/growth/use-growth-models-state';

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
  const { toast } = useToast();
  const [linkedMetrics, setLinkedMetrics] = useState<Record<string, GrowthMetric[]>>({});

  useEffect(() => {
    fetchScalingMetrics();
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
          <h2 className="text-2xl font-bold">Scaling Readiness Metrics</h2>
          <p className="text-gray-500 mt-1">
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
    </div>
  );
};

export default ScalingReadinessMetrics;
