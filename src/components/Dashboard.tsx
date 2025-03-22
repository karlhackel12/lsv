
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, FlaskConical, Layers, LineChart, ChevronRight } from 'lucide-react';
import Card from './Card';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { Project, Hypothesis, Experiment, MvpFeature, Metric, PivotOption } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/hooks/use-project';

const Dashboard = () => {
  const { toast } = useToast();
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [mvpFeatures, setMvpFeatures] = useState<MvpFeature[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectId = currentProject.id;

        // Fetch hypotheses
        const { data: hypothesesData, error: hypothesesError } = await supabase
          .from('hypotheses')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (hypothesesError) throw hypothesesError;

        // Fetch experiments
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('experiments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (experimentsError) throw experimentsError;

        // Fetch MVP features
        const { data: mvpFeaturesData, error: mvpFeaturesError } = await supabase
          .from('mvp_features')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (mvpFeaturesError) throw mvpFeaturesError;

        // Fetch metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (metricsError) throw metricsError;

        // Fetch pivot options
        const { data: pivotOptionsData, error: pivotOptionsError } = await supabase
          .from('pivot_options')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (pivotOptionsError) throw pivotOptionsError;

        // Transform the data to include originalId for all records
        const transformedHypotheses = hypothesesData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id // Keep id as string
        }));

        const transformedExperiments = experimentsData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id
        }));

        const transformedMvpFeatures = mvpFeaturesData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id,
          // Add required fields to match MvpFeature interface
          name: item.feature,
          description: item.notes || '',
          effort: 'medium', // Default value
          impact: item.priority
        }));

        const transformedMetrics = metricsData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id
        }));

        const transformedPivotOptions = pivotOptionsData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id,
          name: item.type,
          pivot_type: item.type,
          potential_impact: item.likelihood,
          implementation_effort: 'medium', // Default value
          evidence: ''
        }));

        // Set the state with transformed data
        setHypotheses(transformedHypotheses);
        setExperiments(transformedExperiments);
        setMvpFeatures(transformedMvpFeatures);
        setMetrics(transformedMetrics);
        setPivotOptions(transformedPivotOptions);

      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load project data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentProject && currentProject.id) {
      fetchProjectData();
    }
  }, [currentProject, toast]);

  const getStageIndex = (stage: string): number => {
    const stages = ['problem-validation', 'solution-validation', 'mvp', 'product-market-fit', 'scale', 'mature'];
    return stages.indexOf(stage);
  };

  // Check if there's no current project
  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-validation-gray-500">No project selected. Please select or create a project.</p>
      </div>
    );
  }

  const stageIndex = getStageIndex(currentProject.stage);
  const progress = ((stageIndex + 1) / 6) * 100;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-validation-gray-500">Loading project data...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="col-span-2 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-validation-gray-900">Project Overview</h2>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-validation-gray-900">{currentProject.name}</h3>
          <p className="text-validation-gray-600">{currentProject.description}</p>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-validation-gray-500">Current Stage</h4>
          <div className="flex items-center justify-between">
            <p className="text-validation-gray-700">{currentProject.stage.replace('-', ' ')}</p>
            <StatusBadge status={currentProject.stage as any} />
          </div>
          <ProgressBar value={progress} max={100} variant="default" size="md" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-validation-gray-900 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Top Hypotheses
            </h2>
            <Link to="/hypotheses" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {hypotheses.length === 0 ? (
            <p className="text-validation-gray-500">No hypotheses created yet.</p>
          ) : (
            <div className="space-y-4">
              {hypotheses.map((hypothesis) => (
                <div key={hypothesis.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-validation-gray-900">{hypothesis.statement}</h3>
                    <p className="text-validation-gray-600 text-sm">{hypothesis.experiment}</p>
                  </div>
                  <StatusBadge status={hypothesis.status as any} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-validation-gray-900 flex items-center">
              <FlaskConical className="h-5 w-5 mr-2" />
              Latest Experiments
            </h2>
            <Link to="/experiments" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {experiments.length === 0 ? (
            <p className="text-validation-gray-500">No experiments created yet.</p>
          ) : (
            <div className="space-y-4">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-validation-gray-900">{experiment.title}</h3>
                    <p className="text-validation-gray-600 text-sm">{experiment.hypothesis}</p>
                  </div>
                  <StatusBadge status={experiment.status as any} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-validation-gray-900 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              MVP Features
            </h2>
            <Link to="/mvp" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {mvpFeatures.length === 0 ? (
            <p className="text-validation-gray-500">No MVP features defined yet.</p>
          ) : (
            <div className="space-y-4">
              {mvpFeatures.map((feature) => (
                <div key={feature.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-validation-gray-900">{feature.feature}</h3>
                    <p className="text-validation-gray-600 text-sm">{feature.notes}</p>
                  </div>
                  <StatusBadge status={feature.status as any} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-validation-gray-900 flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Key Metrics
            </h2>
            <Link to="/metrics" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {metrics.length === 0 ? (
            <p className="text-validation-gray-500">No metrics defined yet.</p>
          ) : (
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-validation-gray-900">{metric.name}</h3>
                    <p className="text-validation-gray-600 text-sm">Target: {metric.target}</p>
                  </div>
                  <StatusBadge status={metric.status as any} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
