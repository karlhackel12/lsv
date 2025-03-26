
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScalingReadinessMetric, GrowthMetric } from '@/types/database';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScalingMetricForm from './ScalingMetricForm';
import ScalingReadinessTable from './ScalingReadinessTable';

interface ScalingReadinessMetricsProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: GrowthMetric[];
  isFormOpen?: boolean;
  onFormClose?: () => void;
}

const ScalingReadinessMetrics: React.FC<ScalingReadinessMetricsProps> = ({
  projectId,
  refreshData,
  growthMetrics,
  isFormOpen = false,
  onFormClose = () => {}
}) => {
  const [metrics, setMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<ScalingReadinessMetric | null>(null);
  const [showForm, setShowForm] = useState<boolean>(isFormOpen);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchMetrics();
  }, [projectId]);

  React.useEffect(() => {
    setShowForm(isFormOpen);
  }, [isFormOpen]);

  const fetchMetrics = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setMetrics(data || []);
    } catch (err) {
      console.error('Error fetching scaling readiness metrics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scaling readiness metrics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMetric = (metric: ScalingReadinessMetric) => {
    setSelectedMetric(metric);
    setShowForm(true);
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
        description: 'The scaling readiness metric has been deleted.',
      });
      
      fetchMetrics();
      refreshData();
    } catch (err) {
      console.error('Error deleting metric:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the metric.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedMetric(null);
    onFormClose();
  };

  const handleFormSave = () => {
    fetchMetrics();
    refreshData();
    handleFormClose();
  };

  // Map growth metrics to format for linking
  const linkedGrowthMetrics: Record<string, GrowthMetric[]> = {};
  metrics.forEach(metric => {
    linkedGrowthMetrics[metric.id] = growthMetrics.filter(gm => 
      gm.scaling_metric_id === metric.id
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Track metrics that indicate your readiness to scale.
        </p>
        <Button 
          size="sm" 
          onClick={() => {
            setSelectedMetric(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Metric
        </Button>
      </div>

      {metrics.length > 0 ? (
        <ScalingReadinessTable 
          metrics={metrics}
          onEdit={handleEditMetric}
          onDelete={handleDeleteMetric}
          linkedGrowthMetrics={linkedGrowthMetrics}
        />
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No scaling readiness metrics defined yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSelectedMetric(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Metric
          </Button>
        </div>
      )}

      {showForm && (
        <ScalingMetricForm
          isOpen={showForm}
          metric={selectedMetric}
          projectId={projectId}
          onSave={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default ScalingReadinessMetrics;
