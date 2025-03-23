
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExtendedPivotOption, PivotOptionFormProps } from './pivot/types';
import TextInputField from './pivot/TextInputField';
import LikelihoodField from './pivot/LikelihoodField';
import MetricSelector from './pivot/MetricSelector';
import { usePivotFormSubmit } from './pivot/usePivotFormSubmit';

const PivotOptionForm = ({
  isOpen,
  pivotOption,
  projectId,
  metrics,
  onSave,
  onClose,
}: PivotOptionFormProps) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string>('none');
  
  // Initialize form with existing or default values
  const [formData, setFormData] = useState<ExtendedPivotOption>({
    id: pivotOption?.id || '',
    type: pivotOption?.type || pivotOption?.pivot_type || '',
    description: pivotOption?.description || '',
    trigger: pivotOption?.trigger || '',
    likelihood: (pivotOption?.likelihood as "high" | "medium" | "low") || "medium",
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

  const { handleSubmit, isSaving, error } = usePivotFormSubmit({
    pivotOption,
    onSave,
    onClose
  });

  useEffect(() => {
    if (isOpen && pivotOption) {
      setFormData({
        id: pivotOption?.id || '',
        type: pivotOption?.type || pivotOption?.pivot_type || '',
        description: pivotOption?.description || '',
        trigger: pivotOption?.trigger || '',
        likelihood: (pivotOption?.likelihood as "high" | "medium" | "low") || "medium",
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
    } else if (isOpen) {
      // Reset form when creating a new pivot option
      setFormData({
        id: '',
        type: '',
        description: '',
        trigger: '',
        likelihood: "medium",
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: '',
        pivot_type: '',
        potential_impact: "medium",
        implementation_effort: "medium",
        evidence: '',
        status: 'active',
        originalId: '',
      });
    }
  }, [pivotOption, projectId, isOpen]);

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

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(formData, e);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit}>
          {error && <p className="text-red-500">{error}</p>}

          <div className="grid gap-4">
            <TextInputField
              id="type"
              name="type"
              label="Type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Pivot Type"
              required
            />

            <TextInputField
              id="description"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description of the pivot option"
              multiline
              required
            />

            <TextInputField
              id="trigger"
              name="trigger"
              label="Trigger"
              value={formData.trigger}
              onChange={handleInputChange}
              placeholder="Trigger for this pivot option"
              multiline
              required
            />

            <LikelihoodField
              value={formData.likelihood}
              onChange={(value) => handleSelectChange('likelihood', value)}
            />

            <MetricSelector
              metrics={metrics}
              selectedMetricId={selectedMetricId}
              onMetricChange={handleMetricChange}
            />

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
