
import React, { useState, useEffect } from 'react';
import { FormSheet } from '@/components/ui/form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MetricData } from '@/types/metrics';
import { getDefaultMetricConfig } from '@/utils/metricCalculations';

interface MetricFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  metric?: MetricData | null;
  projectId: string;
  quickAddMetricType?: 'customer-interviews' | 'survey-responses' | 'problem-solution-fit' | 'mvp-usage' | null;
}

const MetricForm = ({ isOpen, onClose, onSave, metric, projectId, quickAddMetricType }: MetricFormProps) => {
  const [form, setForm] = useState<{
    name: string;
    description: string;
    category: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom';
    current: string;
    target: string;
    status?: 'success' | 'warning' | 'error' | 'not-started';
  }>({
    name: '',
    description: '',
    category: 'custom',
    current: '',
    target: '',
    status: 'not-started',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Populate form with metric data when editing
  useEffect(() => {
    if (metric) {
      setForm({
        name: metric.name,
        description: metric.description || '',
        category: metric.category || 'custom',
        current: metric.current || '',
        target: metric.target,
        status: metric.status || 'not-started',
      });
    } else if (quickAddMetricType) {
      // Pre-fill form with default values based on quick add type
      const defaultConfig = getDefaultMetricConfig(quickAddMetricType);
      setForm({
        name: defaultConfig.name,
        description: defaultConfig.description,
        category: defaultConfig.category as any,
        current: '',
        target: defaultConfig.target,
        status: 'not-started',
      });
    } else {
      // Reset form to defaults when adding a new metric
      setForm({
        name: '',
        description: '',
        category: 'custom',
        current: '',
        target: '',
        status: 'not-started',
      });
    }
  }, [metric, quickAddMetricType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.target) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate status based on current and target (if current is provided)
      let calculatedStatus: 'success' | 'warning' | 'error' | 'not-started' = 'not-started';
      if (form.current) {
        const currentValue = parseFloat(form.current);
        const targetValue = parseFloat(form.target);
        
        // Simple comparison - can be customized based on business needs
        const ratio = currentValue / targetValue;
        
        if (ratio >= 1) calculatedStatus = 'success';
        else if (ratio >= 0.7) calculatedStatus = 'warning';
        else calculatedStatus = 'error';
      }

      const metricData = {
        name: form.name,
        description: form.description,
        category: form.category,
        current: form.current,
        target: form.target,
        status: calculatedStatus,
        project_id: projectId,
      };

      if (metric) {
        // Updating existing metric
        const metricId = metric.originalId || metric.id;
        
        const { error } = await supabase
          .from('metrics')
          .update(metricData)
          .eq('id', metricId);
          
        if (error) throw error;
        
        toast({
          title: 'Metric updated',
          description: 'The metric has been updated successfully',
        });
      } else {
        // Creating new metric
        const { error } = await supabase
          .from('metrics')
          .insert(metricData);
          
        if (error) throw error;
        
        toast({
          title: 'Metric created',
          description: 'The new metric has been created successfully',
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving metric:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while saving the metric',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={metric ? 'Edit Metric' : 'Add New Metric'}
      description={metric ? 'Update the details of this metric' : 'Track a new validation metric for your startup'}
      submitLabel={metric ? 'Save Changes' : 'Create Metric'}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Metric Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Customer Acquisition Cost"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what this metric measures and why it's important"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
          <Select 
            value={form.category} 
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acquisition">Acquisition</SelectItem>
              <SelectItem value="activation">Activation</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Value</Label>
            <Input
              id="current"
              name="current"
              value={form.current}
              onChange={handleChange}
              placeholder="e.g., 42"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target Value <span className="text-red-500">*</span></Label>
            <Input
              id="target"
              name="target"
              value={form.target}
              onChange={handleChange}
              placeholder="e.g., 100"
              type="text"
              required
            />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {metric ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              metric ? 'Save Changes' : 'Create Metric'
            )}
          </Button>
        </div>
      </div>
    </FormSheet>
  );
};

export default MetricForm;
