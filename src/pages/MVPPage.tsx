
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { MvpFeature } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Layers } from 'lucide-react';
import MVPTable from '@/components/MVPTable';
import MVPFeatureForm from '@/components/forms/MVPFeatureForm';
import CurrentlyWorkingOn from '@/components/CurrentlyWorkingOn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageIntroduction from '@/components/PageIntroduction';

const MVPPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [mvpFeatures, setMvpFeatures] = useState<MvpFeature[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<MvpFeature | null>(null);
  const { toast } = useToast();

  const fetchMvpFeatures = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingFeatures(true);
      const { data, error } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setMvpFeatures(data);
    } catch (err) {
      console.error('Error fetching MVP features:', err);
      toast({
        title: 'Error',
        description: 'Failed to load MVP features',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchMvpFeatures();
    }
  }, [currentProject]);

  const handleCreateFeature = () => {
    setSelectedFeature(null);
    setIsFormOpen(true);
  };

  const handleEditFeature = (feature: MvpFeature) => {
    setSelectedFeature(feature);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedFeature(null);
  };

  const handleFormSave = () => {
    fetchMvpFeatures();
    setIsFormOpen(false);
    setSelectedFeature(null);
  };

  const handleDeleteFeature = async (feature: MvpFeature) => {
    try {
      const { error } = await supabase
        .from('mvp_features')
        .delete()
        .eq('id', feature.id);
        
      if (error) throw error;
      
      setMvpFeatures(prev => prev.filter(f => f.id !== feature.id));
      
      toast({
        title: 'Feature deleted',
        description: 'The feature has been successfully deleted.',
      });
    } catch (err) {
      console.error('Error deleting feature:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete feature',
        variant: 'destructive',
      });
    }
  };

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
      <PageIntroduction
        title="Minimum Viable Product (MVP) Development"
        icon={<Layers className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              An MVP is the smallest version of your product that provides enough value for early customers while allowing you to 
              collect the maximum amount of validated learning with minimal effort.
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Focus on core value:</strong> Include only features that directly test your most critical hypotheses</li>
              <li><strong>Prioritize ruthlessly:</strong> Use the impact vs. effort matrix to select features</li>
              <li><strong>Embrace constraints:</strong> Limited resources force creative solutions and prevent over-engineering</li>
              <li><strong>Release early:</strong> Getting real user feedback quickly is more valuable than perfection</li>
            </ul>
            <p className="mt-2">
              <strong>MVP Feature Prioritization Framework:</strong>
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Must Have:</strong> Features critical to test your core value proposition</li>
              <li><strong>Should Have:</strong> Features that significantly enhance the user experience</li>
              <li><strong>Could Have:</strong> Nice-to-have features that can wait for future iterations</li>
              <li><strong>Won't Have:</strong> Features explicitly excluded from your MVP (but might come later)</li>
            </ul>
            <p className="mt-2">
              Remember that an MVP is not just a product with fewer features - it's a process designed to 
              test your most important assumptions with real users as quickly as possible.
            </p>
          </>
        }
      />
      
      {/* Feature form dialog */}
      {isFormOpen && (
        <MVPFeatureForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleFormSave}
          feature={selectedFeature}
          projectId={currentProject?.id || ''}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="all">All Features</TabsTrigger>
              <TabsTrigger value="add">Add Feature</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <MVPTable
                features={mvpFeatures}
                isLoading={isLoadingFeatures}
                onEdit={handleEditFeature}
                onDelete={handleDeleteFeature}
              />
            </TabsContent>
            
            <TabsContent value="add" className="mt-6">
              <div className="flex items-center justify-center p-12">
                <button
                  onClick={handleCreateFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Add New Feature
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <CurrentlyWorkingOn features={mvpFeatures} />
        </div>
      </div>
    </div>
  );
};

export default MVPPage;
