
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface UseProjectReturn {
  projects: Project[];
  currentProject: Project | null;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (projectData: { name: string; description: string }) => Promise<Project | null>;
  fetchProjects: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  updateProjectStage?: (projectId: string, stageName: string) => Promise<void>;
  fetchProjectStages?: () => Promise<void>;
  updateStage?: (stage: string) => Promise<void>;
  updateCurrentStage?: (stage: string) => Promise<void>;
}

export const useProject = (): UseProjectReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Cast the response data to the Project type
      const typedProjects = data as unknown as Project[];
      setProjects(typedProjects);
      
      // If there's at least one project and no current project selected, select the first one
      if (typedProjects.length > 0 && !currentProject) {
        setCurrentProject(typedProjects[0]);
        localStorage.setItem('currentProjectId', typedProjects[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const selectProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      
      const project = data as unknown as Project;
      setCurrentProject(project);
      localStorage.setItem('currentProjectId', projectId);
    } catch (err) {
      console.error('Error selecting project:', err);
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to select project',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createProject = useCallback(async (projectData: { name: string; description: string }): Promise<Project | null> => {
    setIsLoading(true);
    try {
      // Add the stage field with "problem" as default
      const dataWithStage = {
        ...projectData,
        current_stage: 'problem',
        stage: 'problem'
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert([dataWithStage])
        .select()
        .single();
        
      if (error) throw error;
      
      const newProject = data as unknown as Project;
      
      await fetchProjects(); // Refresh the projects list
      await selectProject(newProject.id); // Select the newly created project
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, selectProject, toast]);

  // Mock implementations for the missing methods
  const updateProjectStage = async (projectId: string, stageName: string) => {
    console.log('updateProjectStage called with', projectId, stageName);
    // Implement this functionality if needed
  };

  const fetchProjectStages = async () => {
    console.log('fetchProjectStages called');
    // Implement this functionality if needed
  };

  const updateStage = async (stage: string) => {
    console.log('updateStage called with', stage);
    // Implement this functionality if needed
  };

  const updateCurrentStage = async (stage: string) => {
    console.log('updateCurrentStage called with', stage);
    // Implement this functionality if needed
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    currentProject,
    selectProject,
    createProject,
    fetchProjects,
    isLoading,
    error,
    updateProjectStage,
    fetchProjectStages,
    updateStage,
    updateCurrentStage
  };
};
