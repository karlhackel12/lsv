
import React, { useState, useEffect } from 'react';
import { BarChart, Lightbulb, CheckSquare, Target, Gauge, RotateCcw } from 'lucide-react';
import TabNavigation, { TabItem } from './TabNavigation';
import OverviewSection from './OverviewSection';
import HypothesesSection from './HypothesesSection';
import ExperimentsSection from './ExperimentsSection';
import MVPSection from './MVPSection';
import MetricsSection from './MetricsSection';
import PivotSection from './PivotSection';
import { supabase } from '@/integrations/supabase/client';
import { Project, Stage, Hypothesis, Experiment, MvpFeature, Metric, PivotOption } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Interface for the transformed Stage data that OverviewSection expects
interface TransformedStage {
  id: string;
  name: string;
  complete: boolean;
  inProgress?: boolean;
  description: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for storing data from Supabase
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [mvpFeatures, setMvpFeatures] = useState<MvpFeature[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching data for user:', user?.id);

      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .limit(1)
        .single();

      if (projectError) {
        console.error('Project fetch error:', projectError);
        if (projectError.code === 'PGRST116') {
          // No rows returned is expected for new users
          toast({
            title: 'No projects found',
            description: 'You need to create a project first.',
            variant: 'default',
          });
          setLoading(false);
          return;
        }
        throw new Error(`Error fetching project: ${projectError.message}`);
      }
      
      if (!projectData) {
        toast({
          title: 'No projects found',
          description: 'You need to create a project first.',
          variant: 'default',
        });
        setLoading(false);
        return;
      }

      console.log('Fetched project:', projectData);
      
      // Fetch stages data
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('*')
        .eq('project_id', projectData.id)
        .order('position', { ascending: true });

      if (stagesError) throw new Error(`Error fetching stages: ${stagesError.message}`);
      console.log('Fetched stages:', stagesData);

      // Fetch hypotheses data
      const { data: hypothesesData, error: hypothesesError } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', projectData.id);

      if (hypothesesError) throw new Error(`Error fetching hypotheses: ${hypothesesError.message}`);
      console.log('Fetched hypotheses:', hypothesesData);

      // Fetch experiments data
      const { data: experimentsData, error: experimentsError } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', projectData.id);

      if (experimentsError) throw new Error(`Error fetching experiments: ${experimentsError.message}`);
      console.log('Fetched experiments:', experimentsData);

      // Fetch mvp features data
      const { data: mvpFeaturesData, error: mvpFeaturesError } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', projectData.id);

      if (mvpFeaturesError) throw new Error(`Error fetching MVP features: ${mvpFeaturesError.message}`);
      console.log('Fetched MVP features:', mvpFeaturesData);

      // Fetch metrics data
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', projectData.id);

      if (metricsError) throw new Error(`Error fetching metrics: ${metricsError.message}`);
      console.log('Fetched metrics:', metricsData);

      // Fetch pivot options data
      const { data: pivotOptionsData, error: pivotOptionsError } = await supabase
        .from('pivot_options')
        .select('*')
        .eq('project_id', projectData.id);

      if (pivotOptionsError) throw new Error(`Error fetching pivot options: ${pivotOptionsError.message}`);
      console.log('Fetched pivot options:', pivotOptionsData);

      // Update state with fetched data
      setProject(projectData);
      setStages(stagesData || []);
      setHypotheses(hypothesesData || []);
      setExperiments(experimentsData || []);
      setMvpFeatures(mvpFeaturesData || []);
      setMetrics(metricsData || []);
      setPivotOptions(pivotOptionsData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error loading data',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, toast]);

  // Transform Stage data to match the format expected by OverviewSection
  const transformStages = (stages: Stage[]): TransformedStage[] => {
    return stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      complete: stage.status === 'complete',
      inProgress: stage.status === 'in-progress',
      description: stage.description
    }));
  };

  // Transform data with string IDs to have proper typing while preserving all other properties
  const transformIds = <T extends { id: string }>(items: T[]): (T & { originalId: string })[] => {
    return items.map((item) => {
      const originalId = item.id;
      // Return a new object with all properties from the original item and add originalId
      return { ...item, originalId };
    });
  };

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'hypotheses', label: 'Hypotheses', icon: Lightbulb },
    { id: 'experiments', label: 'Experiments', icon: CheckSquare },
    { id: 'mvp', label: 'MVP', icon: Target },
    { id: 'metrics', label: 'Metrics', icon: Gauge },
    { id: 'pivot', label: 'Pivot', icon: RotateCcw }
  ];

  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-validation-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-validation-red-50 border border-validation-red-200 rounded-lg p-4 text-validation-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            className="mt-4 bg-validation-red-100 hover:bg-validation-red-200 text-validation-red-800 px-4 py-2 rounded-md transition-colors"
            onClick={() => fetchData()}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!project) {
      return (
        <div className="bg-validation-yellow-50 border border-validation-yellow-200 rounded-lg p-4 text-validation-yellow-800">
          <h3 className="text-lg font-semibold mb-2">No Project Found</h3>
          <p>No project data is available. Please check your database configuration or create a new project.</p>
        </div>
      );
    }

    const projectId = project.id;

    switch (activeTab) {
      case 'overview':
        return <OverviewSection project={project} stages={transformStages(stages)} />;
      case 'hypotheses':
        return <HypothesesSection 
          hypotheses={transformIds(hypotheses)} 
          refreshData={fetchData}
          projectId={projectId}
        />;
      case 'experiments':
        return <ExperimentsSection 
          experiments={transformIds(experiments)} 
          refreshData={fetchData}
          projectId={projectId}
        />;
      case 'mvp':
        return <MVPSection 
          mvpFeatures={transformIds(mvpFeatures)} 
          refreshData={fetchData}
          projectId={projectId}
        />;
      case 'metrics':
        return <MetricsSection 
          metrics={transformIds(metrics)} 
          refreshData={fetchData}
          projectId={projectId}
        />;
      case 'pivot':
        return <PivotSection 
          pivotOptions={transformIds(pivotOptions)} 
          refreshData={fetchData}
          projectId={projectId}
        />;
      default:
        return <OverviewSection project={project} stages={transformStages(stages)} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        className="mb-8 animate-slideDownFade" 
      />
      
      <div>
        {renderTab()}
      </div>
    </div>
  );
};

export default Dashboard;
