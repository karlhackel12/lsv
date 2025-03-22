
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { MvpFeature } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MVPSection from '@/components/MVPSection';
import { Loader2 } from 'lucide-react';

const MVPPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [mvpFeatures, setMvpFeatures] = useState<MvpFeature[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const { toast } = useToast();

  const fetchMVPFeatures = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingFeatures(true);
      const { data, error } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match the expected format and include originalId
      const transformedData = data.map(item => ({
        ...item,
        originalId: item.id,
        id: item.id,
        name: item.feature,
        description: item.notes || '',
        effort: item.priority, // Use priority as effort for now
        impact: item.priority === 'high' ? 'high' : item.priority === 'medium' ? 'medium' : 'low', // Derive impact from priority
      }));
      
      setMvpFeatures(transformedData);
    } catch (err) {
      console.error('Error fetching MVP features:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load MVP features',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchMVPFeatures();
    }
  }, [currentProject]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error instanceof Error ? error.message : 'Failed to load project'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All Features</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {currentProject && (
            <MVPSection 
              mvpFeatures={mvpFeatures} 
              refreshData={fetchMVPFeatures}
              projectId={currentProject.id}
            />
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-6">
          {currentProject && (
            <MVPSection 
              mvpFeatures={mvpFeatures.filter(f => f.status === 'in-progress')} 
              refreshData={fetchMVPFeatures}
              projectId={currentProject.id}
            />
          )}
        </TabsContent>
        
        <TabsContent value="phases" className="mt-6">
          <MVPPhases mvpFeatures={mvpFeatures} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MVPPhases = ({ mvpFeatures }: { mvpFeatures: MvpFeature[] }) => {
  // Define the phases
  const phases = [
    { id: 'foundation', name: 'Foundation Phase', description: 'Core infrastructure and basic features' },
    { id: 'teacher', name: 'Teacher Features Phase', description: 'Features for teachers and instructors' },
    { id: 'student', name: 'Student Features Phase', description: 'Features for students and learners' },
    { id: 'business', name: 'Business Model Phase', description: 'Features related to monetization and business operations' },
  ];

  // For this example, we'll randomly assign features to phases for visualization purposes
  // In a real application, you would have a phase field in your database
  
  // Create a function to calculate completion for each phase
  const calculatePhaseCompletion = (phaseId: string) => {
    // In a real application, you would filter features by phase
    // Here we're just using a deterministic pseudo-random assignment for demo purposes
    const phaseFeatures = mvpFeatures.filter((_, index) => index % phases.length === phases.findIndex(p => p.id === phaseId));
    
    if (phaseFeatures.length === 0) return 0;
    
    const completed = phaseFeatures.filter(f => f.status === 'completed').length;
    return Math.round((completed / phaseFeatures.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">MVP Progress by Phase</h2>
        <p className="text-gray-600">Track the progress of your MVP across different development phases.</p>
      </div>
      
      {phases.map(phase => (
        <div key={phase.id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{phase.name}</h3>
          <p className="text-gray-600 mb-4">{phase.description}</p>
          
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium">Completion:</span>
            <span className="text-sm font-medium">{calculatePhaseCompletion(phase.id)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                calculatePhaseCompletion(phase.id) >= 70 ? 'bg-green-600' :
                calculatePhaseCompletion(phase.id) >= 30 ? 'bg-yellow-500' : 'bg-red-600'
              }`} 
              style={{ width: `${calculatePhaseCompletion(phase.id)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MVPPage;
