
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import MVPSection from '@/components/MVPSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Layers } from 'lucide-react';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

const MVPPage = () => {
  const { currentProject } = useProject();
  const [mvpFeatures, setMvpFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMvpForm, setShowMvpForm] = useState(false);
  
  const fetchMVPFeatures = async () => {
    try {
      setIsLoading(true);
      
      if (!currentProject) return;
      
      // Fetch MVP features
      const { data, error } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching MVP features:', error);
        return;
      }
      
      // Add originalId field to each feature for tracking original database ID
      const processedData = data?.map(item => ({
        ...item,
        originalId: item.id
      }));
      
      setMvpFeatures(processedData || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refetch when project changes
  useEffect(() => {
    if (currentProject) {
      fetchMVPFeatures();
    }
  }, [currentProject]);
  
  const handleOpenMvpForm = () => {
    setShowMvpForm(true);
  };
  
  if (!currentProject) {
    return <div>Select a project to view MVP features</div>;
  }
  
  return (
    <div className="space-y-6">
      <PageIntroduction 
        title="Minimum Viable Product" 
        icon={<Layers className="h-5 w-5 text-yellow-500" />}
        description="Define and prioritize the essential features for your MVP. Focus on features that deliver the most value with the least effort."
      />
      
      <ValidationPhaseIntro 
        phase="mvp" 
        onCreateNew={handleOpenMvpForm}
        createButtonText="Add MVP Feature"
      />
      
      <MVPSection 
        mvpFeatures={mvpFeatures}
        refreshData={fetchMVPFeatures}
        projectId={currentProject.id}
        isFormOpen={showMvpForm}
        onFormClose={() => setShowMvpForm(false)}
      />
    </div>
  );
};

export default MVPPage;
