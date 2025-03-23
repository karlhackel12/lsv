
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

interface MetricFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  metric?: {
    id: string;
    name: string;
    description?: string;
    category: string;
    current: string | null;
    target: string;
    status: "success" | "warning" | "error" | "not-started";
  };
  projectId: string;
}

const MetricForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  metric, 
  projectId 
}: MetricFormProps) => {
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (metric) {
      setName(metric.name || '');
      setDescription(metric.description || '');
      setCategory(metric.category || '');
      setCurrent(metric.current || '');
      setTarget(metric.target || '');
      setStatus(metric.status || 'not-started');
    } else {
      // Reset form when creating a new metric
      setName('');
      setDescription('');
      setCategory('');
      setCurrent('');
      setTarget('');
      setStatus('not-started');
    }
  }, [metric, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !target.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (metric) {
        // Update existing metric
        const updates = {
          updated_at: new Date().toISOString(),
          current: current,
          name: name,
          target: target,
          description: description,
          status: status as "success" | "warning" | "error" | "not-started",
          category: category
        };
        
        const { error } = await supabase
          .from('metrics')
          .update(updates)
          .eq('id', metric.id);
          
        if (error) throw error;
        
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
          status: status as "success" | "warning" | "error" | "not-started",
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('metrics')
          .insert(newMetricData)
          .select();
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `Metric "${name}" has been created`,
        });
        
        // If the insertion worked, create a threshold for this metric
        if (data && data.length > 0) {
          const metricId = data[0].id;
          
          await supabase
            .from('metric_thresholds')
            .insert({
              metric_id: metricId,
              warning_threshold: warningThreshold || "0",
              error_threshold: errorThreshold || "0"
            });
        }
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

  const handleStatusChange = (value: string) => {
    setStatus(value as "success" | "warning" | "error" | "not-started");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{metric ? 'Edit Metric' : 'Create New Metric'}</DialogTitle>
          <DialogDescription>
            {metric ? 'Update your metric here.' : 'Add a new metric to track.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Metric Name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Metric Description"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetricForm;
