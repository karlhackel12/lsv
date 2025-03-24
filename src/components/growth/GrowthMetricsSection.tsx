
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { GrowthMetric } from '@/types/database';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmptyMetricState from './metrics/EmptyMetricState';
import MetricCategoryGroup from './metrics/MetricCategoryGroup';
import DeleteMetricDialog from './metrics/DeleteMetricDialog';
import { useMetricsData } from './metrics/useMetricsData';
import DerivedMetricsCard from './metrics/DerivedMetricsCard';
import CoreMetricsRecommendation from './metrics/CoreMetricsRecommendation';
import MetricsFilter from './metrics/MetricsFilter';

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
  const { toast } = useToast();
  
  const {
    derivedMetrics,
    showCoreMetricsOnly,
    setShowCoreMetricsOnly,
    filterLinked,
    setFilterLinked,
    groupedMetrics,
    getScalingMetricForGrowthMetric,
    createCoreMetric
  } = useMetricsData(projectId, metrics);

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
          <MetricsFilter
            showCoreMetricsOnly={showCoreMetricsOnly}
            setShowCoreMetricsOnly={setShowCoreMetricsOnly}
            filterLinked={filterLinked}
            setFilterLinked={setFilterLinked}
            onAddMetric={() => handleOpenForm()}
          />

          <CoreMetricsRecommendation 
            metrics={metrics} 
            createCoreMetric={createCoreMetric} 
          />
          
          <DerivedMetricsCard 
            derivedMetrics={derivedMetrics} 
            metrics={metrics} 
          />

          {Object.keys(groupedMetrics).length === 0 ? (
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
