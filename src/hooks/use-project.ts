
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';

export const useProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Convert to typed data
      const typedData = data as unknown as Project[];
      setProjects(typedData || []);

      // Set first project as current if none is selected
      if (typedData?.length > 0 && !currentProject) {
        setCurrentProject(typedData[0] as Project);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = async (projectId: string) => {
    try {
      const selectedProject = projects.find(p => p.id === projectId);
      if (selectedProject) {
        setCurrentProject(selectedProject as Project);
        // Store in local storage for persistence
        localStorage.setItem('currentProjectId', projectId);
      }
    } catch (err) {
      console.error('Error selecting project:', err);
      throw err;
    }
  };

  const createProject = async (projectData: { name: string; description: string }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { 
            name: projectData.name, 
            description: projectData.description, 
            stage: 'problem',
            current_stage: 'problem'
          }
        ])
        .select();

      if (error) throw error;
      
      await fetchProjects();
      
      // Set as current project if it's our first project
      if (data && data.length > 0) {
        setCurrentProject(data[0] as Project);
        localStorage.setItem('currentProjectId', data[0].id);
      }
      
      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  // New methods to handle stages
  const fetchProjectStages = async () => {
    try {
      if (!currentProject) return [];
      
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching project stages:', err);
      return [];
    }
  };

  const updateStage = async (stageId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', stageId)
        .select();
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error updating stage:', err);
      throw err;
    }
  };

  const updateProjectStage = async (stage: string) => {
    if (!currentProject) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ current_stage: stage })
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedProject = { ...currentProject, current_stage: stage };
      setCurrentProject(updatedProject as Project);
      
      return updatedProject;
    } catch (err) {
      console.error('Error updating project stage:', err);
      throw err;
    }
  };
  
  const updateCurrentStage = async (projectId: string, stageName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ current_stage: stageName })
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update local state if this is the current project
      if (currentProject && currentProject.id === projectId) {
        const updatedProject = { ...currentProject, current_stage: stageName };
        setCurrentProject(updatedProject as Project);
      }
      
      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      console.error('Error updating current stage:', err);
      throw err;
    }
  };

  return {
    projects,
    currentProject,
    selectProject,
    createProject,
    fetchProjects,
    isLoading,
    error,
    // Add new methods
    fetchProjectStages,
    updateStage,
    updateProjectStage,
    updateCurrentStage
  };
};
