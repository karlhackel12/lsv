
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface GrowthMetricFormProps {
  projectId: string;
  onSave: () => Promise<void>;
  onClose?: () => void;
  metric?: GrowthMetric | null;
  growthModelId?: string;
}

// The categories we support for growth metrics
const METRIC_CATEGORIES = [
  'acquisition',
  'activation',
  'retention',
  'revenue',
  'referral',
  'custom'
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
  'on-track',
  'at-risk',
  'off-track'
];

const GrowthMetricForm = ({ 
  projectId, 
  onSave, 
  onClose,
  metric,
  growthModelId 
}: GrowthMetricFormProps) => {
  const [name, setName] = useState(metric?.name || '');
  const [description, setDescription] = useState(metric?.description || '');
  const [category, setCategory] = useState(metric?.category || 'acquisition');
  const [currentValue, setCurrentValue] = useState(metric?.current_value?.toString() || '0');
  const [targetValue, setTargetValue] = useState(metric?.target_value?.toString() || '0');
  const [unit, setUnit] = useState(metric?.unit || 'percentage');
  const [status, setStatus] = useState<'on-track' | 'at-risk' | 'off-track'>(
    (metric?.status as any) || 'on-track'
  );
  const [scalingMetricId, setScalingMetricId] = useState<string | null>(
    metric?.scaling_metric_id || null
  );
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingScalingMetrics, setIsLoadingScalingMetrics] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchScalingMetrics();
    }
  }, [projectId]);

  const fetchScalingMetrics = async () => {
    try {
      setIsLoadingScalingMetrics(true);
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setScalingMetrics(data || []);
    } catch (error) {
      console.error('Error fetching scaling metrics:', error);
    } finally {
      setIsLoadingScalingMetrics(false);
    }
  };

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
        growth_model_id: growthModelId,
        project_id: projectId,
        scaling_metric_id: scalingMetricId
      };
      
      if (metric) {
        // Update existing metric
        const { error } = await supabase
          .from('growth_metrics')
          .update(metricData)
          .eq('id', metric.originalId || metric.id);
          
        if (error) throw error;
        
        // Create or update dependency
        if (scalingMetricId) {
          await supabase
            .from('entity_dependencies')
            .upsert({
              project_id: projectId,
              source_type: 'growth_metric',
              source_id: metric.originalId || metric.id,
              target_type: 'scaling_metric',
              target_id: scalingMetricId,
              relationship_type: 'contributes_to',
              strength: 2.5,
            }, {
              onConflict: 'source_id, target_id, relationship_type'
            });
        }
        
        toast({
          title: "Success",
          description: "Metric updated successfully",
        });
      } else {
        // Create new metric
        const { data, error } = await supabase
          .from('growth_metrics')
          .insert(metricData)
          .select();
          
        if (error) throw error;
        
        // Create dependency if scaling metric is selected
        if (scalingMetricId && data && data.length > 0) {
          await supabase
            .from('entity_dependencies')
            .insert({
              project_id: projectId,
              source_type: 'growth_metric',
              source_id: data[0].id,
              target_type: 'scaling_metric',
              target_id: scalingMetricId,
              relationship_type: 'contributes_to',
              strength: 2.5,
            });
        }
        
        toast({
          title: "Success",
          description: "Metric created successfully",
        });
      }
      
      onSave();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error saving metric:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save metric",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle>{metric ? 'Edit Metric' : 'Create Growth Metric'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targets">Targets & Status</TabsTrigger>
              <TabsTrigger value="links">Dependencies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="name">Metric Name</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Conversion Rate"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this metric measures and why it's important"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select metric category" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="targets" className="space-y-4">
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
                  onValueChange={(value: 'on-track' | 'at-risk' | 'off-track') => setStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select metric status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(statusOption => (
                      <SelectItem key={statusOption} value={statusOption}>
                        {statusOption
                          .split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="links" className="space-y-4">
              <div>
                <Label htmlFor="scalingMetricId">Contributes to Scaling Metric</Label>
                {isLoadingScalingMetrics ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading scaling metrics...</span>
                  </div>
                ) : (
                  <Select 
                    value={scalingMetricId || ''} 
                    onValueChange={(value) => setScalingMetricId(value || null)}
                  >
                    <SelectTrigger id="scalingMetricId">
                      <SelectValue placeholder="Select a scaling metric this growth metric contributes to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {scalingMetrics.map(metric => (
                        <SelectItem key={metric.id} value={metric.id}>
                          {metric.name} ({metric.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Connecting growth metrics to scaling metrics helps track progress toward scaling readiness
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
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

export default GrowthMetricForm;
