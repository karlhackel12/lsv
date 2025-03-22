
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
    isLoading,
    error,
  };
}
