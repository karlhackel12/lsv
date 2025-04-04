
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';

/**
 * Updates a project with the provided data
 */
export async function updateProject(projectId: string, updateData: Partial<Project>) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { data: null, error };
  }
}

/**
 * Fetches a project by ID
 */
export async function getProject(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return { data: null, error };
  }
}
