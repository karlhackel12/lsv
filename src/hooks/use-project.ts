
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
      const { data, error } = await supabase
        .from('projects')
        .update({ stage: newStage, updated_at: new Date() })
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
    isLoading,
    error,
  };
}
