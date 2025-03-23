
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExtendedPivotOption, PivotOptionFormProps } from './pivot/types';
import TextInputField from './pivot/TextInputField';
import LikelihoodField from './pivot/LikelihoodField';
import MetricSelector from './pivot/MetricSelector';
import { usePivotFormSubmit } from './pivot/usePivotFormSubmit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';

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
    e.preventDefault();
    handleSubmit(formData, e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
          <DialogTitle className="text-xl font-bold">
            {pivotOption ? 'Edit Pivot Option' : 'Create Pivot Option'} 
          </DialogTitle>
          <DialogDescription className="text-sm opacity-90 mt-1 text-white">
            {pivotOption ? 
              'Update this potential pivot option and its trigger conditions' : 
              'Define a potential strategic pivot option in case current plans don\'t work'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6">
              <TabsList className="w-full mt-4 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="details" className="flex-1">Option Details</TabsTrigger>
                <TabsTrigger value="triggers" className="flex-1">Triggers & Metrics</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <TabsContent value="details" className="space-y-6 mt-0">
                <TextInputField
                  id="type"
                  name="type"
                  label="Pivot Type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="E.g., Business Model Change, Customer Segment Shift"
                  required
                />

                <TextInputField
                  id="description"
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this pivot option in detail"
                  multiline
                  required
                />

                <LikelihoodField
                  value={formData.likelihood}
                  onChange={(value) => handleSelectChange('likelihood', value)}
                />
              </TabsContent>
              
              <TabsContent value="triggers" className="space-y-6 mt-0">
                <TextInputField
                  id="trigger"
                  name="trigger"
                  label="Trigger Conditions"
                  value={formData.trigger}
                  onChange={handleInputChange}
                  placeholder="What specific conditions would trigger this pivot?"
                  multiline
                  required
                />
                
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <h4 className="font-medium text-amber-800 flex items-center mb-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pivot Trigger Guidance
                  </h4>
                  <p className="text-sm text-amber-700">
                    Define specific, measurable conditions that would trigger considering this pivot.
                    Examples: "CAC exceeds LTV", "Churn rate above 15% for 3 consecutive months",
                    "Less than 5% activation rate after 10,000 visitors".
                  </p>
                </div>

                <MetricSelector
                  metrics={metrics}
                  selectedMetricId={selectedMetricId}
                  onMetricChange={handleMetricChange}
                />
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : pivotOption ? 'Update Pivot Option' : 'Create Pivot Option'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PivotOptionForm;
