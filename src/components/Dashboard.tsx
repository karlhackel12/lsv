
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

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
        const transformedHypotheses: Hypothesis[] = hypothesesData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id // Keep id as string
        }));

        // Ensure we cast the status to the correct type
        const transformedExperiments: Experiment[] = experimentsData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id,
          status: item.status as 'planned' | 'in-progress' | 'completed'
        }));

        const transformedMvpFeatures: MvpFeature[] = mvpFeaturesData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id,
          // Add required fields to match MvpFeature interface
          name: item.feature,
          description: item.notes || '',
          effort: 'medium', // Default value
          impact: item.priority
        }));

        const transformedMetrics: Metric[] = metricsData.map(item => ({
          ...item,
          originalId: item.id,
          id: item.id
        }));

        const transformedPivotOptions: PivotOption[] = pivotOptionsData.map(item => ({
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

  // Add null check for currentProject before accessing stage
  const stageIndex = currentProject && currentProject.stage ? getStageIndex(currentProject.stage) : 0;
  const progress = ((stageIndex + 1) / 6) * 100;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-validation-gray-500">Loading project data...</p>
      </div>
    );
  }

  // Add a check to handle case when currentProject is null
  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <Card className="bg-validation-yellow-50 border border-validation-yellow-200 p-4 shadow-md">
          <h3 className="font-semibold mb-2 text-validation-yellow-700">No Project Selected</h3>
          <p className="text-validation-yellow-600">Please select or create a project to view the dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="col-span-2 p-6 bg-white">
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

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={["hypotheses", "experiments"]}>
        <AccordionItem value="hypotheses" className="border rounded-lg overflow-hidden shadow-md bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center text-lg font-semibold text-validation-gray-900">
              <Lightbulb className="h-5 w-5 mr-3 text-validation-blue-600" />
              Hypotheses
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-validation-gray-700">Top Hypotheses</h3>
              <Link to="/hypotheses" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {hypotheses.length === 0 ? (
              <p className="text-validation-gray-500">No hypotheses created yet.</p>
            ) : (
              <div className="space-y-3">
                {hypotheses.map((hypothesis) => (
                  <div key={hypothesis.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="text-md font-semibold text-validation-gray-900">{hypothesis.statement}</h3>
                      <p className="text-validation-gray-600 text-sm">{hypothesis.experiment}</p>
                    </div>
                    <StatusBadge status={hypothesis.status as any} />
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experiments" className="border rounded-lg overflow-hidden shadow-md bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center text-lg font-semibold text-validation-gray-900">
              <FlaskConical className="h-5 w-5 mr-3 text-validation-blue-600" />
              Experiments
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-validation-gray-700">Latest Experiments</h3>
              <Link to="/experiments" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {experiments.length === 0 ? (
              <p className="text-validation-gray-500">No experiments created yet.</p>
            ) : (
              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div key={experiment.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="text-md font-semibold text-validation-gray-900">{experiment.title}</h3>
                      <p className="text-validation-gray-600 text-sm">{experiment.hypothesis}</p>
                    </div>
                    <StatusBadge status={experiment.status as any} />
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mvp" className="border rounded-lg overflow-hidden shadow-md bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center text-lg font-semibold text-validation-gray-900">
              <Layers className="h-5 w-5 mr-3 text-validation-blue-600" />
              MVP Features
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-validation-gray-700">Top Features</h3>
              <Link to="/mvp" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {mvpFeatures.length === 0 ? (
              <p className="text-validation-gray-500">No MVP features defined yet.</p>
            ) : (
              <div className="space-y-3">
                {mvpFeatures.map((feature) => (
                  <div key={feature.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="text-md font-semibold text-validation-gray-900">{feature.feature}</h3>
                      <p className="text-validation-gray-600 text-sm">{feature.notes}</p>
                    </div>
                    <StatusBadge status={feature.status as any} />
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="metrics" className="border rounded-lg overflow-hidden shadow-md bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center text-lg font-semibold text-validation-gray-900">
              <LineChart className="h-5 w-5 mr-3 text-validation-blue-600" />
              Key Metrics
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-validation-gray-700">Performance Metrics</h3>
              <Link to="/metrics" className="text-validation-blue-600 hover:text-validation-blue-700 font-medium text-sm flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {metrics.length === 0 ? (
              <p className="text-validation-gray-500">No metrics defined yet.</p>
            ) : (
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <h3 className="text-md font-semibold text-validation-gray-900">{metric.name}</h3>
                      <p className="text-validation-gray-600 text-sm">Target: {metric.target}</p>
                    </div>
                    <StatusBadge status={metric.status as any} />
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Dashboard;
