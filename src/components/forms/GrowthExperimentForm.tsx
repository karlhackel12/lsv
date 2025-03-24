
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GrowthExperiment, GrowthMetric, ScalingReadinessMetric } from '@/types/database';
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
import { format } from 'date-fns';

interface GrowthExperimentFormProps {
  projectId: string;
  metrics: GrowthMetric[];
  onSave: () => Promise<void>;
  onClose?: () => void;
  experiment?: GrowthExperiment | null;
}

const GrowthExperimentForm = ({ 
  projectId, 
  metrics, 
  onSave, 
  onClose,
  experiment 
}: GrowthExperimentFormProps) => {
  const [title, setTitle] = useState(experiment?.title || '');
  const [hypothesis, setHypothesis] = useState(experiment?.hypothesis || '');
  const [metricId, setMetricId] = useState<string>(experiment?.metric_id || '');
  const [expectedLift, setExpectedLift] = useState<string>(
    experiment?.expected_lift ? experiment.expected_lift.toString() : ''
  );
  const [actualLift, setActualLift] = useState<string>(
    experiment?.actual_lift ? experiment.actual_lift.toString() : ''
  );
  const [startDate, setStartDate] = useState<string>(
    experiment?.start_date 
      ? format(new Date(experiment.start_date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    experiment?.end_date 
      ? format(new Date(experiment.end_date), 'yyyy-MM-dd')
      : format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [status, setStatus] = useState<'planned' | 'running' | 'completed' | 'failed'>(
    experiment?.status as any || 'planned'
  );
  const [notes, setNotes] = useState(experiment?.notes || '');
  const [scalingMetricId, setScalingMetricId] = useState<string>(
    experiment?.scaling_metric_id || ''
  );

  const [growthModelId, setGrowthModelId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoadingScalingMetrics, setIsLoadingScalingMetrics] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrowthModel();
    fetchScalingMetrics();
  }, [projectId]);

  const fetchGrowthModel = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_models')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setGrowthModelId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching growth model:', error);
    }
  };

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
    
    if (!title || !hypothesis || !metricId || !expectedLift || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const experimentData = {
        title,
        hypothesis,
        metric_id: metricId,
        expected_lift: parseFloat(expectedLift),
        actual_lift: actualLift ? parseFloat(actualLift) : null,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status,
        notes,
        growth_model_id: growthModelId,
        project_id: projectId,
        scaling_metric_id: scalingMetricId || null
      };
      
      if (experiment) {
        // Update existing experiment
        const { error } = await supabase
          .from('growth_experiments')
          .update(experimentData)
          .eq('id', experiment.originalId || experiment.id);
          
        if (error) throw error;
        
        // Update or create dependency
        if (scalingMetricId) {
          await supabase
            .from('entity_dependencies')
            .upsert({
              project_id: projectId,
              source_type: 'growth_experiment',
              source_id: experiment.originalId || experiment.id,
              target_type: 'scaling_metric',
              target_id: scalingMetricId,
              relationship_type: 'validates',
              strength: 2.0,
            }, {
              onConflict: 'source_id, target_id, relationship_type'
            });
        }
        
        toast({
          title: "Success",
          description: "Experiment updated successfully",
        });
      } else {
        // Create new experiment
        const { data, error } = await supabase
          .from('growth_experiments')
          .insert(experimentData)
          .select();
          
        if (error) throw error;
        
        // Create dependency if scaling metric is selected
        if (scalingMetricId && data && data.length > 0) {
          await supabase
            .from('entity_dependencies')
            .insert({
              project_id: projectId,
              source_type: 'growth_experiment',
              source_id: data[0].id,
              target_type: 'scaling_metric',
              target_id: scalingMetricId,
              relationship_type: 'validates',
              strength: 2.0,
            });
        }
        
        toast({
          title: "Success",
          description: "Experiment created successfully",
        });
      }
      
      onSave();
      if (onClose) onClose();
    } catch (error: any) {
      console.error('Error saving experiment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save experiment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle>{experiment ? 'Edit Experiment' : 'Create Growth Experiment'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Metrics & Results</TabsTrigger>
              <TabsTrigger value="links">Dependencies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="title">Experiment Title</Label>
                <Input 
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., A/B Test for Sign-up Page"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea 
                  id="hypothesis"
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="We believe that [change] will result in [outcome] because [reason]"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value: 'planned' | 'running' | 'completed' | 'failed') => setStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select experiment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="metricId">Target Growth Metric</Label>
                <Select 
                  value={metricId} 
                  onValueChange={(value) => setMetricId(value)}
                >
                  <SelectTrigger id="metricId">
                    <SelectValue placeholder="Select a metric to improve" />
                  </SelectTrigger>
                  <SelectContent>
                    {metrics.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name} ({metric.current_value}/{metric.target_value} {metric.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedLift">Expected Lift (%)</Label>
                  <Input 
                    id="expectedLift"
                    type="number"
                    value={expectedLift}
                    onChange={(e) => setExpectedLift(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="actualLift">Actual Lift (%)</Label>
                  <Input 
                    id="actualLift"
                    type="number"
                    value={actualLift}
                    onChange={(e) => setActualLift(e.target.value)}
                    placeholder="Leave blank if not completed"
                    disabled={status !== 'completed'}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this experiment"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="links" className="space-y-4">
              <div>
                <Label htmlFor="scalingMetricId">Related Scaling Metric</Label>
                {isLoadingScalingMetrics ? (
                  <div className="flex items-center mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading scaling metrics...</span>
                  </div>
                ) : (
                  <Select 
                    value={scalingMetricId} 
                    onValueChange={(value) => setScalingMetricId(value)}
                  >
                    <SelectTrigger id="scalingMetricId">
                      <SelectValue placeholder="Select a scaling metric this experiment validates" />
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
                  Connecting experiments to scaling metrics helps track validation progress toward scaling readiness
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
              {experiment ? 'Update Experiment' : 'Create Experiment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GrowthExperimentForm;
