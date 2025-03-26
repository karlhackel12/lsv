
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Metric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MetricsSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedMetrics: Metric[]) => void;
  projectId: string;
  initialSelectedMetrics?: string[];
}

const MetricsSelectorModal: React.FC<MetricsSelectorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  initialSelectedMetrics = []
}) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(initialSelectedMetrics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('metrics')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        setMetrics(data || []);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchMetrics();
    }
  }, [projectId, isOpen]);

  const handleToggleMetric = (metricId: string) => {
    setSelectedMetricIds(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSave = () => {
    const selectedMetrics = metrics.filter(m => selectedMetricIds.includes(m.id));
    onSave(selectedMetrics);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Metrics to Monitor</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading metrics...</span>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
              {metrics.length === 0 ? (
                <p className="text-center text-gray-500">No metrics available.</p>
              ) : (
                metrics.map(metric => (
                  <div key={metric.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetricIds.includes(metric.id)}
                      onCheckedChange={() => handleToggleMetric(metric.id)}
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor={metric.id} className="font-medium">
                        {metric.name}
                      </Label>
                      <p className="text-sm text-gray-500">
                        Current: {metric.current} / Target: {metric.target}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MetricsSelectorModal;
