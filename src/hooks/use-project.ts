
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to Project[] since we know the structure matches
      const typedData = data as unknown as Project[];
      setProjects(typedData);

      // If we have projects but no current project selected,
      // auto-select the first one
      if (typedData.length > 0 && !currentProject) {
        handleSelectProject(typedData[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      
      toast({
        title: "Error loading projects",
        description: "There was a problem loading your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      // Cast to Project type
      const typedData = data as unknown as Project;
      setCurrentProject(typedData);
      
      // Store the selected project ID in localStorage
      localStorage.setItem('selectedProjectId', projectId);
    } catch (err) {
      console.error('Error fetching project:', err);
      
      toast({
        title: "Error loading project",
        description: "There was a problem loading the selected project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description: string }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            name: projectData.name, 
            description: projectData.description,
            current_stage: 'problem',
          }
        ])
        .select();

      if (error) throw error;
      
      await fetchProjects();
      
      if (data && data.length > 0) {
        // Cast to Project type
        const newProject = data[0] as unknown as Project;
        await handleSelectProject(newProject.id);
        
        return newProject;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating project:', err);
      
      toast({
        title: "Error creating project",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    currentProject,
    selectProject: handleSelectProject,
    createProject,
    fetchProjects,
    isLoading,
    error,
  };
}
