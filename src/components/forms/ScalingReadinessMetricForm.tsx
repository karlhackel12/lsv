
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScalingReadinessMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ScalingReadinessMetricFormProps {
  projectId: string;
  metric?: ScalingReadinessMetric | null;
  onSave: () => Promise<void>;
  onClose?: () => void;
  growthModelId?: string;
}

// Define the 7 types of readiness metrics validation
const READINESS_METRIC_TYPES = [
  {
    value: 'product_market_fit',
    label: 'Product-Market Fit',
    description: 'Measures how well your product satisfies market demand.'
  },
  {
    value: 'unit_economics',
    label: 'Unit Economics',
    description: 'Focuses on profitability metrics like LTV:CAC ratio.'
  },
  {
    value: 'growth_engine',
    label: 'Growth Engine',
    description: 'Assesses the effectiveness of your acquisition channels.'
  },
  {
    value: 'team_capacity',
    label: 'Team Capacity',
    description: 'Evaluates if your team is ready to handle scaling operations.'
  },
  {
    value: 'operational_scalability',
    label: 'Operational Scalability',
    description: 'Measures how well your operations can scale without breaking.'
  },
  {
    value: 'financial_readiness',
    label: 'Financial Readiness',
    description: 'Evaluates if you have sufficient capital to fund growth.'
  },
  {
    value: 'market_opportunity',
    label: 'Market Opportunity',
    description: 'Assesses the size and growth potential of your target market.'
  }
];

// The unit options we support
const UNIT_OPTIONS = [
  'percentage',
  'number',
  'currency',
  'users',
  'days',
  'ratio',
  'custom'
];

// Status options for metrics
const STATUS_OPTIONS = [
  'achieved',
  'on-track',
  'needs-improvement',
  'critical',
  'pending'
];

const ScalingReadinessMetricForm = ({
  projectId,
  metric,
  onSave,
  onClose,
  growthModelId
}: ScalingReadinessMetricFormProps) => {
  const [name, setName] = useState(metric?.name || '');
  const [description, setDescription] = useState(metric?.description || '');
  const [category, setCategory] = useState(metric?.category || 'unit_economics');
  const [currentValue, setCurrentValue] = useState(metric?.current_value?.toString() || '0');
  const [targetValue, setTargetValue] = useState(metric?.target_value?.toString() || '0');
  const [unit, setUnit] = useState(metric?.unit || 'ratio');
  const [status, setStatus] = useState(metric?.status || 'pending');
  const [importance, setImportance] = useState((metric?.importance || 1).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || currentValue === '' || targetValue === '' || !unit) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const metricData = {
        name,
        description,
        category,
        current_value: parseFloat(currentValue),
        target_value: parseFloat(targetValue),
        unit,
        status,
        importance: parseInt(importance, 10) || 1,
        project_id: projectId,
        growth_model_id: growthModelId
      };
      
      if (metric) {
        // Update existing metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .update(metricData)
          .eq('id', metric.originalId || metric.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Scaling readiness metric updated successfully",
        });
      } else {
        // Create new metric
        const { error } = await supabase
          .from('scaling_readiness_metrics')
          .insert(metricData);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Scaling readiness metric created successfully",
        });
      }
      
      onSave();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error saving scaling readiness metric:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save scaling readiness metric",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle>
          {metric ? 'Edit Scaling Readiness Metric' : 'Create Scaling Readiness Metric'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Metric Name</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., LTV:CAC Ratio"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this scaling readiness metric measures"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Metric Type</Label>
              <Select 
                value={category} 
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select metric type" />
                </SelectTrigger>
                <SelectContent>
                  {READINESS_METRIC_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {READINESS_METRIC_TYPES.find(type => type.value === category)?.description}
              </p>
            </div>
            
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map(unitOption => (
                    <SelectItem key={unitOption} value={unitOption}>
                      {unitOption.charAt(0).toUpperCase() + unitOption.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentValue">Current Value</Label>
                <Input 
                  id="currentValue"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input 
                  id="targetValue"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="100"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select metric status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(statusOption => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="importance">Importance (1-10)</Label>
              <Input 
                id="importance"
                type="number"
                min="1"
                max="10"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                placeholder="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher values indicate more important metrics for scaling readiness
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {metric ? 'Update Metric' : 'Create Metric'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScalingReadinessMetricForm;
