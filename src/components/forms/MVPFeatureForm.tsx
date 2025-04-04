
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MVPFeature, GrowthMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Update the MVPFeature interface to include originalId if it's being used
interface ExtendedMVPFeature extends MVPFeature {
  originalId?: string;
  growth_metric_id?: string | null;
}

interface MVPFeatureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  feature?: ExtendedMVPFeature | null;
  projectId: string;
}

const MVPFeatureForm = ({ isOpen, onClose, onSave, feature, projectId }: MVPFeatureFormProps) => {
  const [featureText, setFeatureText] = useState(feature?.feature || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    (feature?.priority as "high" | "medium" | "low") || "medium"
  );
  const [effort, setEffort] = useState<"high" | "medium" | "low">(
    (feature?.effort as "high" | "medium" | "low") || "medium"
  );
  const [impact, setImpact] = useState<"high" | "medium" | "low">(
    (feature?.impact as "high" | "medium" | "low") || "high"
  );
  const [status, setStatus] = useState<"planned" | "in-progress" | "completed" | "post-mvp">(
    (feature?.status as "planned" | "in-progress" | "completed" | "post-mvp") || "planned"
  );
  const [notes, setNotes] = useState(feature?.notes || "");
  const [growthMetricId, setGrowthMetricId] = useState<string | null>(feature?.growth_metric_id || null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && projectId) {
      fetchGrowthMetrics();
    }
  }, [isOpen, projectId]);
  
  const fetchGrowthMetrics = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      // Ensure the data conforms to the GrowthMetric type
      const typedMetrics = data?.map(metric => ({
        ...metric,
        status: (metric.status as "on-track" | "at-risk" | "off-track") || "on-track"
      })) as GrowthMetric[];
      
      setGrowthMetrics(typedMetrics || []);
    } catch (err) {
      console.error("Error fetching growth metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featureText.trim()) {
      setError("Feature name is required");
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (feature) {
        // Update existing feature
        const { error } = await supabase
          .from('mvp_features')
          .update({
            feature: featureText,
            priority,
            effort,
            impact,
            status,
            notes,
            growth_metric_id: growthMetricId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', feature.originalId || feature.id);
          
        if (error) throw error;
        
        // Create or update entity dependency
        if (growthMetricId) {
          await supabase
            .from('entity_dependencies')
            .upsert({
              project_id: projectId,
              source_type: 'mvp_feature',
              source_id: feature.originalId || feature.id,
              target_type: 'growth_metric',
              target_id: growthMetricId,
              relationship_type: 'impacts',
              strength: impact === 'high' ? 3.0 : impact === 'medium' ? 2.0 : 1.0,
            }, {
              onConflict: 'source_id, target_id, relationship_type'
            });
        }
        
        toast({
          title: "Success",
          description: "Feature updated successfully",
        });
      } else {
        // Create new feature
        const { data, error } = await supabase
          .from('mvp_features')
          .insert({
            feature: featureText,
            priority,
            effort,
            impact,
            status,
            notes,
            project_id: projectId,
            growth_metric_id: growthMetricId,
          })
          .select();
          
        if (error) throw error;
        
        // Create entity dependency if growth metric is selected
        if (growthMetricId && data && data.length > 0) {
          await supabase
            .from('entity_dependencies')
            .insert({
              project_id: projectId,
              source_type: 'mvp_feature',
              source_id: data[0].id,
              target_type: 'growth_metric',
              target_id: growthMetricId,
              relationship_type: 'impacts',
              strength: impact === 'high' ? 3.0 : impact === 'medium' ? 2.0 : 1.0,
            });
        }
        
        toast({
          title: "Success",
          description: "Feature created successfully",
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving feature:", error);
      setError(error.message || "An error occurred while saving the feature");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{feature ? "Edit Feature" : "Create New Feature"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feature">Feature</Label>
              <Input
                id="feature"
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                placeholder="Feature Name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={priority} 
                onValueChange={(value: "high" | "medium" | "low") => setPriority(value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="effort">Effort</Label>
              <Select 
                value={effort} 
                onValueChange={(value: "high" | "medium" | "low") => setEffort(value)}
              >
                <SelectTrigger id="effort">
                  <SelectValue placeholder="Select effort level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="impact">Impact</Label>
              <Select 
                value={impact} 
                onValueChange={(value: "high" | "medium" | "low") => setImpact(value)}
              >
                <SelectTrigger id="impact">
                  <SelectValue placeholder="Select impact level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value: "planned" | "in-progress" | "completed" | "post-mvp") => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="post-mvp">Post MVP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="growthMetric">Growth Metric (Impact)</Label>
              <Select 
                value={growthMetricId || "none"} 
                onValueChange={(value) => setGrowthMetricId(value === "none" ? null : value)}
              >
                <SelectTrigger id="growthMetric">
                  <SelectValue placeholder="Select a growth metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {growthMetrics.map(metric => (
                    <SelectItem key={metric.id} value={metric.id}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this feature"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : feature ? "Update Feature" : "Create Feature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MVPFeatureForm;
