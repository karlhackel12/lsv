
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
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error loading projects',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log('Fetched projects:', data);
      return data as Project[];
    },
  });

  useEffect(() => {
    // Set the first project as current if none is selected and projects are loaded
    if (projects.length > 0 && !currentProject) {
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
    if (savedProjectId && projects.length > 0) {
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
