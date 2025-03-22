
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';

export function useProject() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Project[];
    },
  });

  useEffect(() => {
    // Set the first project as current if none is selected and projects are loaded
    if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [projects, currentProject]);

  const selectProject = (project: Project) => {
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
        setCurrentProject(savedProject);
      }
    }
  }, [projects]);

  return {
    projects,
    currentProject,
    selectProject,
    isLoading,
  };
}
