
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MetricData } from '@/types/metrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart } from 'lucide-react';

interface MetricFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  metric?: MetricData;
  projectId: string;
}

const MetricForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  metric, 
  projectId 
}: MetricFormProps) => {
  // Form state
  const [name, setName] = useState(metric?.name || '');
  const [description, setDescription] = useState(metric?.description || '');
  const [category, setCategory] = useState(metric?.category || '');
  const [current, setCurrent] = useState(metric?.current || '');
  const [target, setTarget] = useState(metric?.target || '');
  const [status, setStatus] = useState<"success" | "warning" | "error" | "not-started">(
    metric?.status || 'not-started'
  );
  const [warningThreshold, setWarningThreshold] = useState('0');
  const [errorThreshold, setErrorThreshold] = useState('0');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load thresholds when editing an existing metric
  useEffect(() => {
    const fetchThresholds = async () => {
      if (metric?.id) {
        try {
          const { data, error } = await supabase
            .from('metric_thresholds')
            .select('*')
            .eq('metric_id', metric.id)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            setWarningThreshold(data.warning_threshold || '0');
            setErrorThreshold(data.error_threshold || '0');
          }
        } catch (err) {
          console.error('Error fetching metric thresholds:', err);
        }
      }
    };
    
    if (isOpen) {
      fetchThresholds();
    }
  }, [metric, isOpen]);

  // Reset form when opened or metric changes
  useEffect(() => {
    if (isOpen) {
      if (metric) {
        setName(metric.name || '');
        setDescription(metric.description || '');
        setCategory(metric.category || '');
        setCurrent(metric.current || '');
        setTarget(metric.target || '');
        setStatus(metric.status || 'not-started');
        setNotes('');
      } else {
        // Reset form when creating a new metric
        setName('');
        setDescription('');
        setCategory('');
        setCurrent('');
        setTarget('');
        setStatus('not-started');
        setWarningThreshold('0');
        setErrorThreshold('0');
        setNotes('');
      }
    }
  }, [metric, isOpen]);

  // Calculate metric status based on current value and thresholds
  const calculateStatus = (current: string, target: string, warningThreshold: string, errorThreshold: string): "success" | "warning" | "error" | "not-started" => {
    if (!current || current === '0') return 'not-started';
    
    const currentValue = parseFloat(current);
    const targetValue = parseFloat(target);
    const warningValue = parseFloat(warningThreshold);
    const errorValue = parseFloat(errorThreshold);
    
    // Simple comparison assuming higher is better
    // This could be enhanced with more complex logic
    if (currentValue >= targetValue) return 'success';
    if (currentValue <= errorValue) return 'error';
    if (currentValue <= warningValue) return 'warning';
    
    return 'success';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !target.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Calculate the status based on current values and thresholds
      const calculatedStatus = status === 'not-started' && current && current !== '0' 
        ? calculateStatus(current, target, warningThreshold, errorThreshold)
        : status;
      
      const timestamp = new Date().toISOString();
      const contextInfo = metric ? `Updated from ${metric.current || '0'} to ${current}` : 'Initial value';
        
      if (metric) {
        // Update existing metric
        const updates = {
          updated_at: timestamp,
          current: current,
          name: name,
          target: target,
          description: description,
          status: calculatedStatus,
          category: category
        };
        
        const { error: metricError } = await supabase
          .from('metrics')
          .update(updates)
          .eq('id', metric.originalId || metric.id);
          
        if (metricError) throw metricError;
        
        // Update thresholds
        const { error: thresholdError } = await supabase
          .from('metric_thresholds')
          .upsert({
            metric_id: metric.originalId || metric.id,
            warning_threshold: warningThreshold,
            error_threshold: errorThreshold,
            updated_at: timestamp
          });
          
        if (thresholdError) throw thresholdError;
        
        // Add to metric history with notes (if value has changed)
        if (metric.current !== current) {
          await supabase
            .from('metric_history')
            .insert({
              metric_id: metric.originalId || metric.id,
              value: current,
              status: calculatedStatus,
              recorded_at: timestamp,
              notes: notes || null,
              context: contextInfo
            });
        }
          
        // Check for active pivot triggers
        checkPivotTriggers(metric.originalId || metric.id, current, calculatedStatus);
        
        toast({
          title: 'Success',
          description: `Metric "${name}" has been updated`,
        });
      } else {
        // Create new metric
        const newMetricData = {
          name,
          category,
          target,
          current: current || "0",
          status: calculatedStatus,
          project_id: projectId,
          created_at: timestamp,
          updated_at: timestamp
        };
        
        const { data, error } = await supabase
          .from('metrics')
          .insert(newMetricData)
          .select();
          
        if (error) throw error;
        
        // If the insertion worked, create a threshold for this metric
        if (data && data.length > 0) {
          const metricId = data[0].id;
          
          await supabase
            .from('metric_thresholds')
            .insert({
              metric_id: metricId,
              warning_threshold: warningThreshold || "0",
              error_threshold: errorThreshold || "0",
              created_at: timestamp,
              updated_at: timestamp
            });
            
          // Also add to metric history
          await supabase
            .from('metric_history')
            .insert({
              metric_id: metricId,
              value: current || "0",
              status: calculatedStatus,
              recorded_at: timestamp,
              notes: notes || null,
              context: 'Initial value'
            });
        }
        
        toast({
          title: 'Success',
          description: `Metric "${name}" has been created`,
        });
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving metric:', error);
      setError('Failed to save metric. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if any pivot triggers should be activated based on metric changes
  const checkPivotTriggers = async (metricId: string, currentValue: string, status: string) => {
    if (status !== 'warning' && status !== 'error') return;
    
    try {
      // Find pivot triggers linked to this metric
      const { data: triggers, error } = await supabase
        .from('pivot_metric_triggers')
        .select(`
          *,
          pivot_options (*)
        `)
        .eq('metric_id', metricId);
        
      if (error) throw error;
      
      if (triggers && triggers.length > 0) {
        // Notify user if any pivot options should be considered
        const triggerNames = triggers.map((t: any) => t.pivot_options?.type || 'Unnamed pivot option').join(', ');
        
        toast({
          title: status === 'error' ? 'Critical Pivot Alert' : 'Pivot Warning',
          description: `Metric "${name}" has triggered pivot consideration for: ${triggerNames}`,
          variant: status === 'error' ? 'destructive' : 'default',
          duration: 10000, // Show for 10 seconds
        });
      }
    } catch (err) {
      console.error('Error checking pivot triggers:', err);
    }
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as "success" | "warning" | "error" | "not-started");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <DialogTitle className="text-xl font-bold">
            {metric ? 'Edit Metric' : 'Create New Metric'}
          </DialogTitle>
          <DialogDescription className="text-sm opacity-90 mt-1 text-white">
            {metric ? 'Update your metric and review the data' : 'Define a clear, measurable metric to track your progress'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave}>
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6">
              <TabsList className="w-full mt-4 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="details" className="flex-1">
                  Metric Details
                </TabsTrigger>
                {metric && (
                  <TabsTrigger value="thresholds" className="flex-1">
                    Thresholds & History
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
              <TabsContent value="details" className="space-y-6 mt-0">
                {error && <p className="text-red-500">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Metric Name"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acquisition">Acquisition</SelectItem>
                        <SelectItem value="activation">Activation</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this metric measures and why it's important"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="current">Current Value</Label>
                    <Input
                      type="number"
                      id="current"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      placeholder="Current Value"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      type="number"
                      id="target"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="Target Value"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="thresholds" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="warningThreshold">Warning Threshold</Label>
                    <Input
                      type="number"
                      id="warningThreshold"
                      value={warningThreshold}
                      onChange={(e) => setWarningThreshold(e.target.value)}
                      placeholder="Warning Threshold"
                    />
                    <p className="text-xs text-gray-500">Metric will show warning status when below this value</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="errorThreshold">Error Threshold</Label>
                    <Input
                      type="number"
                      id="errorThreshold"
                      value={errorThreshold}
                      onChange={(e) => setErrorThreshold(e.target.value)}
                      placeholder="Error Threshold"
                    />
                    <p className="text-xs text-gray-500">Metric will show error status when below this value</p>
                  </div>
                </div>
                
                {metric && (
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Update Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this update (will be saved in history)"
                      className="min-h-[80px]"
                    />
                  </div>
                )}
                
                {metric && (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <LineChart className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium text-gray-900">Historical Data</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Each update to this metric is recorded in its history. Update notes help provide context for changes.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : metric ? 'Update Metric' : 'Create Metric'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetricForm;
