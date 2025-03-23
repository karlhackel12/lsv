
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';

interface ActiveTrigger {
  pivotOption: PivotOption;
  metric: Metric;
  trigger?: PivotMetricTrigger;
}

export const usePivotSection = (projectId: string, pivotOptions: PivotOption[]) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTriggerFormOpen, setIsTriggerFormOpen] = useState(false);
  const [selectedPivotOption, setSelectedPivotOption] = useState<PivotOption | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<PivotMetricTrigger | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pivotOptionToDelete, setPivotOptionToDelete] = useState<PivotOption | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricTriggers, setMetricTriggers] = useState<PivotMetricTrigger[]>([]);
  const [activeTriggers, setActiveTriggers] = useState<ActiveTrigger[]>([]);
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(false);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('metrics')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        setMetrics(data || []);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };
    
    fetchMetrics();
  }, [projectId]);

  useEffect(() => {
    const fetchMetricTriggers = async () => {
      if (!projectId || pivotOptions.length === 0) return;
      
      setIsLoadingTriggers(true);
      try {
        const pivotIds = pivotOptions.map(p => p.id || p.originalId);
        const { data, error } = await supabase
          .from('pivot_metric_triggers')
          .select('*')
          .in('pivot_option_id', pivotIds);
          
        if (error) throw error;
        setMetricTriggers(data || []);
      } catch (err) {
        console.error('Error fetching metric triggers:', err);
      } finally {
        setIsLoadingTriggers(false);
      }
    };
    
    fetchMetricTriggers();
  }, [projectId, pivotOptions]);

  // Set up real-time subscription to metrics updates
  useEffect(() => {
    if (!projectId) return;
    
    const channel = supabase
      .channel('metric_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'metrics',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Metric updated:', payload);
          // Update metrics array with the updated metric
          setMetrics(prevMetrics => 
            prevMetrics.map(m => 
              m.id === payload.new.id ? { ...m, ...payload.new } : m
            )
          );
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    const findActiveTriggers = () => {
      const active: ActiveTrigger[] = [];
      
      metricTriggers.forEach(trigger => {
        const metric = metrics.find(m => m.id === trigger.metric_id || m.originalId === trigger.metric_id);
        const pivotOption = pivotOptions.find(p => p.id === trigger.pivot_option_id || p.originalId === trigger.pivot_option_id);
        
        if (metric && pivotOption && (metric.status === 'error' || metric.status === 'warning')) {
          active.push({
            pivotOption,
            metric,
            trigger
          });
        }
      });
      
      setActiveTriggers(active);
    };
    
    findActiveTriggers();
  }, [metrics, pivotOptions, metricTriggers]);

  const handleCreateNew = () => {
    setSelectedPivotOption(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pivotOption: PivotOption) => {
    const originalPivotOption = {
      ...pivotOption,
      id: pivotOption.originalId || pivotOption.id
    };
    setSelectedPivotOption(originalPivotOption);
    setIsFormOpen(true);
  };

  const handleAddTrigger = (pivotOption: PivotOption) => {
    const originalPivotOption = {
      ...pivotOption,
      id: pivotOption.originalId || pivotOption.id
    };
    setSelectedPivotOption(originalPivotOption);
    setSelectedTrigger(null);
    setIsTriggerFormOpen(true);
  };

  const handleEditTrigger = (trigger: PivotMetricTrigger, pivotOption: PivotOption) => {
    setSelectedPivotOption(pivotOption);
    setSelectedTrigger(trigger);
    setIsTriggerFormOpen(true);
  };

  const handleDelete = (pivotOption: PivotOption) => {
    setPivotOptionToDelete({
      ...pivotOption,
      id: pivotOption.originalId || pivotOption.id
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pivotOptionToDelete) return;
    
    try {
      // First delete all related metric triggers
      await supabase
        .from('pivot_metric_triggers')
        .delete()
        .eq('pivot_option_id', pivotOptionToDelete.id);
      
      // Then delete the pivot option
      const { error } = await supabase
        .from('pivot_options')
        .delete()
        .eq('id', pivotOptionToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Pivot option deleted',
        description: 'The pivot option has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPivotOptionToDelete(null);
    }
  };

  const getMetricsAtRisk = () => {
    return metrics.filter(metric => 
      metric.status === 'error' || metric.status === 'warning'
    );
  };

  return {
    isFormOpen,
    isTriggerFormOpen,
    selectedPivotOption,
    selectedTrigger,
    isDeleteDialogOpen,
    pivotOptionToDelete,
    metrics,
    metricTriggers,
    activeTriggers,
    isLoadingTriggers,
    metricsAtRisk: getMetricsAtRisk(),
    handleCreateNew,
    handleEdit,
    handleAddTrigger,
    handleEditTrigger,
    handleDelete,
    confirmDelete,
    setIsFormOpen,
    setIsTriggerFormOpen,
    setIsDeleteDialogOpen
  };
};
