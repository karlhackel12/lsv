
import React, { useState } from 'react';
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
import { MVPFeature } from '@/types/database';
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
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
            updated_at: new Date().toISOString(),
          })
          .eq('id', feature.originalId || feature.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Feature updated successfully",
        });
      } else {
        // Create new feature
        const { error } = await supabase
          .from('mvp_features')
          .insert({
            feature: featureText,
            priority,
            effort,
            impact,
            status,
            notes,
            project_id: projectId,
          });
          
        if (error) throw error;
        
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional Notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MVPFeatureForm;
