
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { GrowthMetric, GrowthModel } from '@/types/database';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmptyMetricState from './metrics/EmptyMetricState';
import MetricCategoryGroup from './metrics/MetricCategoryGroup';
import DeleteMetricDialog from './metrics/DeleteMetricDialog';

interface GrowthMetricsSectionProps {
  metrics: GrowthMetric[];
  growthModel: GrowthModel;
  projectId: string;
  refreshData: () => Promise<void>;
}

const GrowthMetricsSection = ({ 
  metrics, 
  growthModel, 
  projectId, 
  refreshData 
}: GrowthMetricsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<GrowthMetric | null>(null);
  const { toast } = useToast();

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

  // Group metrics by category
  const groupedMetrics = metrics.reduce((groups, metric) => {
    const category = metric.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(metric);
    return groups;
  }, {} as Record<string, GrowthMetric[]>);

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthMetricForm
          growthModel={growthModel}
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          metric={editingMetric}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Metrics</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Metric
            </Button>
          </div>

          {metrics.length === 0 ? (
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
