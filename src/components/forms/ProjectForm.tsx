
import React, { useState } from 'react';
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

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: { name: string; description: string; stage: string }) => Promise<void>;
}

const ProjectForm = ({ isOpen, onClose, onSave }: ProjectFormProps) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('problem-validation');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave({ name, description, stage });
      
      // Reset form
      setName('');
      setDescription('');
      setStage('problem-validation');
      
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to start tracking your validation journey
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project is about"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="stage">Current Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="Select current stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="problem-validation">Problem Validation</SelectItem>
                <SelectItem value="solution-validation">Solution Validation</SelectItem>
                <SelectItem value="mvp">MVP Development</SelectItem>
                <SelectItem value="product-market-fit">Product-Market Fit</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
