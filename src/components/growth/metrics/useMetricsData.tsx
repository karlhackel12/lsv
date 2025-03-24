
import { useState, useEffect } from 'react';
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMetricsData = (projectId: string, metrics: GrowthMetric[]) => {
  const [derivedMetrics, setDerivedMetrics] = useState<GrowthMetric[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [showCoreMetricsOnly, setShowCoreMetricsOnly] = useState(false);
  const [filterLinked, setFilterLinked] = useState(false);
  const { toast } = useToast();

  const coreMetricNames = ['CAC', 'LTV', 'Conversion Rate'];
  const coreMetricCategories = ['acquisition', 'revenue', 'conversion'];

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
    calculateDerivedMetrics();
  }, [projectId, metrics]);

  const calculateDerivedMetrics = () => {
    const cac = metrics.find(m => 
      m.name.toLowerCase().includes('cac') || 
      (m.category === 'acquisition' && m.name.includes('Acquisition Cost'))
    );
    
    const ltv = metrics.find(m => 
      m.name.toLowerCase().includes('ltv') || 
      (m.category === 'revenue' && m.name.includes('Lifetime Value'))
    );
    
    if (cac && ltv && cac.current_value > 0) {
      const ratio = ltv.current_value / cac.current_value;
      
      const ltvCacMetric: GrowthMetric = {
        id: 'ltv-cac-ratio',
        originalId: 'ltv-cac-ratio',
        name: 'LTV:CAC Ratio',
        description: 'Lifetime Value to Customer Acquisition Cost ratio',
        category: 'derived',
        current_value: ratio,
        target_value: 3, // Standard benchmark
        unit: 'ratio',
        status: ratio >= 3 ? 'on-track' : ratio >= 2 ? 'at-risk' : 'off-track',
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDerivedMetrics([ltvCacMetric]);
    } else {
      setDerivedMetrics([]);
    }
  };

  const filteredMetrics = () => {
    let results = [...metrics];
    
    if (showCoreMetricsOnly) {
      results = results.filter(metric => 
        coreMetricNames.some(name => metric.name.toLowerCase().includes(name.toLowerCase())) ||
        coreMetricCategories.includes(metric.category)
      );
    }
    
    if (filterLinked) {
      results = results.filter(metric => metric.scaling_metric_id);
    }
    
    return results.concat(derivedMetrics);
  };

  const groupedMetrics = filteredMetrics().reduce((groups, metric) => {
    const category = metric.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(metric);
    return groups;
  }, {} as Record<string, GrowthMetric[]>);

  const getScalingMetricForGrowthMetric = (growthMetric: GrowthMetric) => {
    if (!growthMetric.scaling_metric_id) return null;
    return scalingMetrics.find(sm => sm.id === growthMetric.scaling_metric_id) || null;
  };

  const createCoreMetric = async (metricType: 'cac' | 'ltv' | 'conversion') => {
    let name = '', category = '', description = '', unit = '';
    let current_value = 0, target_value = 0;
    
    switch (metricType) {
      case 'cac':
        name = 'Customer Acquisition Cost (CAC)';
        category = 'acquisition';
        description = 'Average cost to acquire a new customer';
        current_value = 0;
        target_value = 0;
        unit = 'currency';
        break;
      case 'ltv':
        name = 'Lifetime Value (LTV)';
        category = 'revenue';
        description = 'Average revenue from a customer over their lifetime';
        current_value = 0;
        target_value = 0;
        unit = 'currency';
        break;
      case 'conversion':
        name = 'Conversion Rate';
        category = 'conversion';
        description = 'Percentage of visitors who become customers';
        current_value = 0;
        target_value = 0;
        unit = 'percentage';
        break;
    }
    
    try {
      const { data, error } = await supabase
        .from('growth_metrics')
        .insert({
          name,
          category,
          description,
          current_value,
          target_value,
          unit,
          project_id: projectId,
          status: 'on-track'
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Core metric created',
        description: `${name} has been added to your metrics`
      });
      
      return true;
    } catch (error) {
      console.error('Error creating core metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the core metric',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    derivedMetrics,
    scalingMetrics,
    showCoreMetricsOnly,
    setShowCoreMetricsOnly,
    filterLinked,
    setFilterLinked,
    groupedMetrics,
    getScalingMetricForGrowthMetric,
    createCoreMetric,
    filteredMetrics
  };
};
