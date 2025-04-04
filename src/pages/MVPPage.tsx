import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import MVPKanban from '@/components/MVPKanban';
import PageIntroduction from '@/components/PageIntroduction';
import { Layers, Users, BarChart2, CheckCircle, Zap, Sparkles, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import InfoTooltip from '@/components/InfoTooltip';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { Project } from '@/types/database';

interface MVPTracking {
  core_features_defined: boolean;
  mvp_built: boolean;
  released_to_users: boolean;
  metrics_gathered: boolean;
}

const MVPPage = () => {
  const { currentProject } = useProject();
  const [mvpFeatures, setMvpFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMvpForm, setShowMvpForm] = useState(false);
  const [mvpTracking, setMvpTracking] = useState<MVPTracking>({
    core_features_defined: false,
    mvp_built: false,
    released_to_users: false,
    metrics_gathered: false
  });
  const { toast } = useToast();
  
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
      
      // Fetch project MVP tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
        
      if (projectError) {
        console.error('Error fetching MVP tracking:', projectError);
        return;
      }
      
      // Check if mvp_tracking exists in the projectData
      if (projectData) {
        // Use type assertion and optional chaining to safely access mvp_tracking
        const trackingData = (projectData as any).mvp_tracking as MVPTracking | null;
        if (trackingData) {
          setMvpTracking(trackingData);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update MVP tracking state
  const updateMVPTracking = async (field: keyof MVPTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...mvpTracking, [field]: value };
      
      // Optimistically update the UI
      setMvpTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          mvp_tracking: updatedTracking 
        } as Partial<Project>)
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'MVP Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating MVP tracking:', err);
      
      // Revert the local state change on error
      setMvpTracking(mvpTracking);
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
  
  const handleCloseMvpForm = () => {
    setShowMvpForm(false);
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Zap />,
      title: 'Focus on Core Features',
      description: 'Include only features essential to solving the validated problem.'
    },
    {
      icon: <Clock />,
      title: 'Build it Quickly',
      description: 'Aim to get your MVP to real users as fast as possible.'
    },
    {
      icon: <Sparkles />,
      title: 'Quality Where it Matters',
      description: 'Ensure core features work well, even if secondary features are basic.'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'core_features_defined',
      label: 'Core Features Defined',
      description: 'Automatically tracked based on feature creation',
      icon: <Layers />,
      checked: mvpTracking.core_features_defined,
      disabled: true
    },
    {
      key: 'mvp_built',
      label: 'MVP Built',
      description: 'Automatically tracked when features are marked as completed',
      icon: <CheckCircle />,
      checked: mvpTracking.mvp_built,
      disabled: true
    },
    {
      key: 'released_to_users',
      label: 'Released to Test Users',
      description: "Toggle when you've shared your MVP with test users",
      icon: <Users />,
      checked: mvpTracking.released_to_users,
      onCheckedChange: (checked) => updateMVPTracking('released_to_users', checked)
    },
    {
      key: 'metrics_gathered',
      label: 'Usage Metrics Gathered',
      description: "Toggle when you've collected usage data from your MVP",
      icon: <BarChart2 />,
      checked: mvpTracking.metrics_gathered,
      onCheckedChange: (checked) => updateMVPTracking('metrics_gathered', checked)
    }
  ];
  
  if (!currentProject) {
    return <div>Select a project to view MVP features</div>;
  }
  
  return (
    <div className="space-y-6">
      <PageIntroduction 
        title="Minimum Viable Product" 
        icon={<Layers className="h-5 w-5 text-yellow-500" />}
        description="Define and prioritize the essential features for your MVP. Focus on features that deliver the most value with the least effort."
        showDescription={false}
      />
      
      <BestPracticesCard 
        title="Best Practices for MVP Development"
        color="yellow"
        tooltip="These practices help you build and test your Minimum Viable Product effectively."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="MVP Validation Checklist"
        color="yellow"
        items={checklistItems}
      />
      
      <ValidationPhaseIntro 
        phase="mvp"
        onCreateNew={handleOpenMvpForm}
        createButtonText="Add MVP Feature"
      />
      
      <MVPKanban 
        mvpFeatures={mvpFeatures}
        refreshData={fetchMVPFeatures}
        projectId={currentProject.id}
        isFormOpen={showMvpForm}
        onFormClose={handleCloseMvpForm}
        onFormOpen={handleOpenMvpForm}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MVPPage;
