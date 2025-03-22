
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { RotateCcw, Plus, Edit, Trash2, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PivotOptionForm from './forms/PivotOptionForm';
import PivotDecisionSection from './PivotDecisionSection';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PivotOption, Metric, PivotMetricTrigger } from '@/types/database';
import { Badge } from './ui/badge';

interface PivotSectionProps {
  pivotOptions: PivotOption[];
  refreshData: () => void;
  projectId: string;
}

interface ActiveTrigger {
  pivotOption: PivotOption;
  metric: Metric;
}

const PivotSection = ({ pivotOptions, refreshData, projectId }: PivotSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPivotOption, setSelectedPivotOption] = useState<PivotOption | null>(null);
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

  useEffect(() => {
    // Find active triggers (where metric status is 'error' or 'warning')
    const findActiveTriggers = () => {
      const active: ActiveTrigger[] = [];
      
      metricTriggers.forEach(trigger => {
        const metric = metrics.find(m => m.id === trigger.metric_id || m.originalId === trigger.metric_id);
        const pivotOption = pivotOptions.find(p => p.id === trigger.pivot_option_id || p.originalId === trigger.pivot_option_id);
        
        if (metric && pivotOption && (metric.status === 'error' || metric.status === 'warning')) {
          active.push({
            pivotOption,
            metric
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
      // First delete any associated metric triggers
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
      
      refreshData();
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

  const metricsAtRisk = getMetricsAtRisk();

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Pivot Framework</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pivot Option
        </Button>
      </div>
      
      <Card className="mb-8 p-6">
        <p className="text-validation-gray-600 text-lg">
          A pivot is a structured course correction designed to test a new fundamental hypothesis about the product, business model, or engine of growth.
        </p>
      </Card>
      
      <PivotDecisionSection />
      
      {activeTriggers.length > 0 && (
        <Card className="mb-8 p-6 bg-red-50 border-red-200">
          <h3 className="text-xl font-bold mb-4 text-red-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Active Pivot Triggers
          </h3>
          <div className="space-y-4">
            {activeTriggers.map((trigger, index) => (
              <div key={index} className="bg-white p-4 rounded-md border border-red-200">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{trigger.metric.name}</h4>
                      <Badge variant={trigger.metric.status === 'error' ? 'destructive' : 'default'}>
                        {trigger.metric.status === 'error' ? 'Critical' : 'Warning'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {trigger.metric.current || 'N/A'} / Target: {trigger.metric.target}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-2 hidden md:block" />
                    <div className="md:ml-4">
                      <h4 className="font-semibold">Suggests Pivot: {trigger.pivotOption.type}</h4>
                      <p className="text-sm text-gray-600 truncate max-w-[300px]">
                        {trigger.pivotOption.description}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleEdit(trigger.pivotOption)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {metricsAtRisk.length > 0 && activeTriggers.length === 0 && (
        <Card className="mb-8 p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-xl font-bold mb-4 text-yellow-800 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Metrics Approaching Pivot Triggers
          </h3>
          <div className="space-y-4">
            {metricsAtRisk.map(metric => (
              <div key={metric.id} className="bg-white p-4 rounded-md border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{metric.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Current: {metric.current || 'N/A'} / Target: {metric.target}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    metric.status === 'error' 
                      ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                      : 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200'
                  }`}>
                    {metric.status === 'error' ? 'Critical' : 'Warning'}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Recommended Action:</p>
                  <p className="text-sm text-gray-600">
                    {metric.status === 'error' 
                      ? 'Schedule an immediate pivot planning session to evaluate options.' 
                      : 'Monitor closely and prepare contingency plans.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-validation-gray-900">Potential Pivot Options</h3>
      </div>
      
      {pivotOptions.length === 0 ? (
        <Card className="p-12 text-center mb-8">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Pivot Options Yet</h3>
          <p className="text-validation-gray-600 mb-6">Plan ahead by identifying potential pivot strategies.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Pivot Option
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {pivotOptions.map((option) => {
            // Check if this option has any linked metrics
            const linkedMetricIds = metricTriggers
              .filter(t => t.pivot_option_id === option.id || t.pivot_option_id === option.originalId)
              .map(t => t.metric_id);
              
            const linkedMetrics = metrics.filter(m => 
              linkedMetricIds.includes(m.id) || (m.originalId && linkedMetricIds.includes(m.originalId))
            );
            
            return (
              <Card 
                key={option.id} 
                className="p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-lg text-validation-gray-900">{option.type}</h4>
                  <div className="flex space-x-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      option.likelihood === 'high' 
                        ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' 
                        : option.likelihood === 'medium' 
                          ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' 
                          : 'bg-validation-green-50 text-validation-green-700 border border-validation-green-200'
                    }`}>
                      {option.likelihood} likelihood
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEdit(option)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                      onClick={() => handleDelete(option)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <p className="text-validation-gray-600 mb-5">{option.description}</p>
                
                {linkedMetrics.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-semibold text-validation-gray-700 mb-2">Triggered by metrics:</p>
                    <div className="flex flex-wrap gap-2">
                      {linkedMetrics.map(metric => (
                        <Badge 
                          key={metric.id} 
                          variant="outline"
                          className={`${
                            metric.status === 'error' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : metric.status === 'warning'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : ''
                          }`}
                        >
                          {metric.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-validation-gray-50 p-4 rounded-lg border border-validation-gray-200">
                  <p className="text-sm font-semibold text-validation-red-600 mb-1">Trigger Point:</p>
                  <p className="text-validation-gray-700 text-sm">{option.trigger}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button className="bg-white border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2.5 px-5 rounded-lg flex items-center transition-colors duration-300 shadow-subtle">
          <RotateCcw className="h-4 w-4 mr-2" />
          Schedule Pivot/Persevere Meeting
        </button>
      </div>

      <PivotOptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        pivotOption={selectedPivotOption}
        projectId={projectId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this pivot option. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PivotSection;
