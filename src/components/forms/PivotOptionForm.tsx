
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PivotOption, Metric } from '@/types/database';

// Extended PivotOption interface to include additional properties used in the form
interface ExtendedPivotOption extends PivotOption {
  name?: string;
  pivot_type?: string;
  potential_impact?: string;
  implementation_effort?: string;
  evidence?: string;
  status?: string;
  originalId?: string;
}

// Extended Metric interface to include description if it's being used
interface ExtendedMetric extends Metric {
  description?: string;
}

interface PivotOptionFormProps {
  pivotOption?: ExtendedPivotOption;
  projectId: string;
  metrics: ExtendedMetric[];
  onSave: () => void;
  onClose: () => void;
}

const PivotOptionForm = ({
  pivotOption,
  projectId,
  metrics,
  onSave,
  onClose,
}: PivotOptionFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedMetricId, setSelectedMetricId] = useState<string>('');

  // Initialize form with existing or default values
  const [formData, setFormData] = useState<ExtendedPivotOption>({
    id: pivotOption?.id || '',
    type: pivotOption?.type || pivotOption?.pivot_type || '',
    description: pivotOption?.description || '',
    trigger: pivotOption?.trigger || '',
    likelihood: (pivotOption?.likelihood as "high" | "medium" | "low") || (pivotOption?.potential_impact as "high" | "medium" | "low") || "medium",
    project_id: projectId,
    created_at: pivotOption?.created_at || new Date().toISOString(),
    updated_at: pivotOption?.updated_at || new Date().toISOString(),
    // Add support for extended properties if they're being used
    name: pivotOption?.name || '',
    pivot_type: pivotOption?.pivot_type || pivotOption?.type || '',
    potential_impact: pivotOption?.potential_impact || pivotOption?.likelihood || "medium",
    implementation_effort: pivotOption?.implementation_effort || "medium",
    evidence: pivotOption?.evidence || '',
    status: pivotOption?.status || 'active',
    originalId: pivotOption?.originalId || pivotOption?.id || '',
  });

  useEffect(() => {
    if (pivotOption) {
      setFormData({
        id: pivotOption?.id || '',
        type: pivotOption?.type || pivotOption?.pivot_type || '',
        description: pivotOption?.description || '',
        trigger: pivotOption?.trigger || '',
        likelihood: (pivotOption?.likelihood as "high" | "medium" | "low") || (pivotOption?.potential_impact as "high" | "medium" | "low") || "medium",
        project_id: projectId,
        created_at: pivotOption?.created_at || new Date().toISOString(),
        updated_at: pivotOption?.updated_at || new Date().toISOString(),
        // Add support for extended properties if they're being used
        name: pivotOption?.name || '',
        pivot_type: pivotOption?.pivot_type || pivotOption?.type || '',
        potential_impact: pivotOption?.potential_impact || pivotOption?.likelihood || "medium",
        implementation_effort: pivotOption?.implementation_effort || "medium",
        evidence: pivotOption?.evidence || '',
        status: pivotOption?.status || 'active',
        originalId: pivotOption?.originalId || pivotOption?.id || '',
      });
    }
  }, [pivotOption, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim() || !formData.description.trim() || !formData.trigger.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (pivotOption) {
        // Update existing pivot option
        const updates = {
          type: formData.type,
          description: formData.description,
          trigger: formData.trigger,
          likelihood: formData.likelihood,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('pivot_options')
          .update(updates)
          .eq('id', pivotOption.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option "${formData.type}" has been updated.`,
        });
      } else {
        // Create new pivot option
        const newPivotOption = {
          type: formData.type,
          description: formData.description,
          trigger: formData.trigger,
          likelihood: formData.likelihood,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('pivot_options')
          .insert(newPivotOption)
          .select();

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Pivot option "${formData.type}" has been created.`,
        });
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving pivot option:', err);
      setError('Failed to save pivot option. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: "high" | "medium" | "low") => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMetricChange = (value: string) => {
    setSelectedMetricId(value);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid gap-4">
            <div>
              <Label htmlFor="type" className="text-sm font-medium">Type</Label>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Pivot Type"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description of the pivot option"
                required
              />
            </div>

            <div>
              <Label htmlFor="trigger" className="text-sm font-medium">Trigger</Label>
              <Textarea
                id="trigger"
                name="trigger"
                value={formData.trigger}
                onChange={handleInputChange}
                placeholder="Trigger for this pivot option"
                required
              />
            </div>

            <div>
              <Label htmlFor="likelihood" className="text-sm font-medium">Likelihood</Label>
              <Select 
                value={formData.likelihood} 
                onValueChange={(value: "high" | "medium" | "low") => handleSelectChange('likelihood', value)}
              >
                <SelectTrigger id="likelihood">
                  <SelectValue placeholder="Select likelihood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* Handle metrics with appropriate type safety */}
          <div className="mt-4">
            <Label htmlFor="metric" className="text-sm font-medium">Linked Metric</Label>
            <div className="mt-1.5">
              <Select value={selectedMetricId} onValueChange={handleMetricChange}>
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name} - {metric.description || 'No description'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

            <div className="flex justify-end mt-6">
              <Button type="button" variant="secondary" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PivotOptionForm;
