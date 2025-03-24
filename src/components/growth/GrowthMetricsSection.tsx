
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Link2, Filter } from 'lucide-react';
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmptyMetricState from './metrics/EmptyMetricState';
import MetricCategoryGroup from './metrics/MetricCategoryGroup';
import DeleteMetricDialog from './metrics/DeleteMetricDialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface GrowthMetricsSectionProps {
  metrics: GrowthMetric[];
  projectId: string;
  refreshData: () => Promise<void>;
}

const GrowthMetricsSection = ({ 
  metrics, 
  projectId, 
  refreshData 
}: GrowthMetricsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<GrowthMetric | null>(null);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [filterLinked, setFilterLinked] = useState(false);
  const { toast } = useToast();

  // Fetch scaling metrics to display linked info
  useEffect(() => {
    const fetchScalingMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('scaling_readiness_metrics')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        setScalingMetrics(data || []);
      } catch (error) {
        console.error('Error fetching scaling metrics:', error);
      }
    };

    fetchScalingMetrics();
  }, [projectId]);

  const handleOpenForm = (metric?: GrowthMetric) => {
    setEditingMetric(metric || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMetric(null);
  };

  const handleDeleteMetric = async () => {
    if (!metricToDelete) return;
    
    try {
      const { error } = await supabase
        .from('growth_metrics')
        .delete()
        .eq('id', metricToDelete.originalId || metricToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The metric has been successfully deleted',
      });
      
      refreshData();
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete metric',
        variant: 'destructive',
      });
    } finally {
      setMetricToDelete(null);
    }
  };

  // Filter metrics based on scaling metric link if needed
  const filteredMetrics = filterLinked 
    ? metrics.filter(metric => metric.scaling_metric_id)
    : metrics;

  // Group metrics by category
  const groupedMetrics = filteredMetrics.reduce((groups, metric) => {
    const category = metric.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(metric);
    return groups;
  }, {} as Record<string, GrowthMetric[]>);

  // Find scaling metric for a growth metric
  const getScalingMetricForGrowthMetric = (growthMetric: GrowthMetric) => {
    if (!growthMetric.scaling_metric_id) return null;
    return scalingMetrics.find(sm => sm.id === growthMetric.scaling_metric_id) || null;
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthMetricForm
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          metric={editingMetric}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Metrics</h2>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={filterLinked}
                    onCheckedChange={setFilterLinked}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Show only metrics linked to scaling
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
          </div>

          {filteredMetrics.length === 0 ? (
            <EmptyMetricState onAddMetric={() => handleOpenForm()} />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
                <MetricCategoryGroup
                  key={category}
                  category={category}
                  metrics={categoryMetrics}
                  onEdit={handleOpenForm}
                  onDelete={setMetricToDelete}
                  scalingMetrics={scalingMetrics}
                  getScalingMetric={getScalingMetricForGrowthMetric}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DeleteMetricDialog 
        metricToDelete={metricToDelete}
        onClose={() => setMetricToDelete(null)}
        onConfirm={handleDeleteMetric}
      />
    </div>
  );
};

export default GrowthMetricsSection;
