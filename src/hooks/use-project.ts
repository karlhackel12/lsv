
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useProject() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        // First try to get projects the user owns
        const { data: ownedProjects, error: ownedError } = await supabase
          .from('projects')
          .select('*')
          .order('name');
        
        if (ownedError) {
          console.error('Error fetching owned projects:', ownedError);
          throw ownedError;
        }
        
        console.log('Fetched projects:', ownedProjects);
        return ownedProjects as Project[];
      } catch (err) {
        console.error('Error in projects query:', err);
        toast({
          title: 'Error loading projects',
          description: err instanceof Error ? err.message : 'Unknown error occurred',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  useEffect(() => {
    // Set the first project as current if none is selected and projects are loaded
    if (projects && projects.length > 0 && !currentProject) {
      console.log('Setting initial project:', projects[0]);
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject]);

  const selectProject = (project: Project) => {
    console.log('Selecting project:', project);
    setCurrentProject(project);
    // Save to localStorage for persistence
    localStorage.setItem('selectedProjectId', project.id);
  };

  // Used to update project stage when moving to next stage
  const updateProjectStage = async (projectId: string, newStage: string) => {
    try {
      const now = new Date().toISOString(); // Convert Date to ISO string format
      const { data, error } = await supabase
        .from('projects')
        .update({ stage: newStage, updated_at: now })
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Update the current project in state
        setCurrentProject(prev => prev?.id === projectId ? data as Project : prev);
        
        toast({
          title: 'Project Updated',
          description: `Project stage updated to ${newStage.replace('-', ' ')}`,
        });
        
        return data as Project;
      }
    } catch (err) {
      console.error('Error updating project stage:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update project stage',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Fetch project stages from the database
  const fetchProjectStages = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('project_id', projectId)
        .order('position');
      
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching project stages:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch project stages',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Update an existing stage
  const updateStage = async (stageId: string, stageData: any) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('stages')
        .update({ ...stageData, updated_at: now })
        .eq('id', stageId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Stage Updated',
        description: 'The stage has been successfully updated.',
      });
      
      return data;
    } catch (err) {
      console.error('Error updating stage:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update stage',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a new default stage if none exist
  const createDefaultStages = async (projectId: string) => {
    try {
      const defaultStages = [
        { id: 'problem-validation', name: 'Problem Validation', description: 'Identify and validate the problem your solution addresses', position: 1, status: 'in-progress', project_id: projectId },
        { id: 'solution-validation', name: 'Solution Validation', description: 'Test your proposed solution with potential users', position: 2, status: 'not-started', project_id: projectId },
        { id: 'mvp', name: 'MVP Development', description: 'Build a minimum viable product to test with users', position: 3, status: 'not-started', project_id: projectId },
        { id: 'product-market-fit', name: 'Product-Market Fit', description: 'Achieve measurable traction that proves market demand', position: 4, status: 'not-started', project_id: projectId },
        { id: 'scale', name: 'Scale', description: 'Scale your solution to reach more users', position: 5, status: 'not-started', project_id: projectId },
        { id: 'mature', name: 'Mature', description: 'Optimize and expand your validated business', position: 6, status: 'not-started', project_id: projectId },
      ];
      
      const { error } = await supabase
        .from('stages')
        .insert(defaultStages);
      
      if (error) throw error;
      
      toast({
        title: 'Stages Created',
        description: 'Default stages have been created for your project.',
      });
      
      return defaultStages;
    } catch (err) {
      console.error('Error creating default stages:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create default stages',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Load selected project from localStorage on init
  useEffect(() => {
    const savedProjectId = localStorage.getItem('selectedProjectId');
    if (savedProjectId && projects && projects.length > 0) {
      const savedProject = projects.find(p => p.id === savedProjectId);
      if (savedProject) {
        console.log('Loading saved project:', savedProject);
        setCurrentProject(savedProject);
      }
    }
  }, [projects]);

  return {
    projects,
    currentProject,
    selectProject,
    updateProjectStage,
    fetchProjectStages,
    updateStage,
    createDefaultStages,
    isLoading,
    error,
  };
}
