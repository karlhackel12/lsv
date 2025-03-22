
import React, { useState, useEffect } from 'react';
import { CheckCircle, Activity, Users, Lightbulb, Target, TrendingUp, Clock, Award, AlertTriangle, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { Project } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import StageEditDialog from './stage/StageEditDialog';
import { supabase } from '@/integrations/supabase/client';

interface Stage {
  id: string;
  name: string;
  description: string;
  position: number;
  status: 'complete' | 'in-progress' | 'not-started';
  project_id: string;
}

interface OverviewSectionProps {
  project: Project;
}

const OverviewSection = ({ project }: OverviewSectionProps) => {
  const { fetchProjectStages, updateStage, createDefaultStages } = useProject();
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Helper function to calculate project health
  const calculateHealthScore = () => {
    // Basic calculation based on metrics and stages
    let score = 50; // Start with neutral
    
    // Add points for completed stages
    const completedStages = stages.filter(s => s.status === 'complete').length;
    score += (completedStages / Math.max(1, stages.length)) * 20;
    
    // Add points for validated hypotheses
    const validatedHypotheses = hypotheses.filter(h => h.status === 'validated').length;
    if (hypotheses.length > 0) {
      score += (validatedHypotheses / hypotheses.length) * 15;
    }
    
    // Add points for metrics meeting targets
    const successMetrics = metrics.filter(m => m.status === 'success').length;
    if (metrics.length > 0) {
      score += (successMetrics / metrics.length) * 15;
    }
    
    return Math.min(100, Math.max(0, Math.floor(score)));
  };
  
  const healthScore = calculateHealthScore();
  
  const getHealthColor = () => {
    if (healthScore >= 70) return 'text-validation-green-600 bg-validation-green-50 border-validation-green-200';
    if (healthScore >= 40) return 'text-validation-yellow-600 bg-validation-yellow-50 border-validation-yellow-200';
    return 'text-validation-red-600 bg-validation-red-50 border-validation-red-200';
  };
  
  const getHealthText = () => {
    if (healthScore >= 70) return 'Strong';
    if (healthScore >= 40) return 'Needs attention';
    return 'At risk';
  };
  
  const getHealthIcon = () => {
    if (healthScore >= 70) return <Award className="h-5 w-5" />;
    if (healthScore >= 40) return <Clock className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  // Load project stages and metrics
  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      try {
        if (project?.id) {
          // Fetch project stages
          const stagesData = await fetchProjectStages(project.id);
          
          // If no stages exist, create default ones
          if (stagesData.length === 0) {
            const defaultStages = await createDefaultStages(project.id);
            setStages(defaultStages as Stage[]);
          } else {
            setStages(stagesData as Stage[]);
          }
          
          // Fetch metrics
          const { data: metricsData } = await supabase
            .from('metrics')
            .select('*')
            .eq('project_id', project.id);
          
          setMetrics(metricsData || []);
          
          // Fetch hypotheses
          const { data: hypothesesData } = await supabase
            .from('hypotheses')
            .select('*')
            .eq('project_id', project.id);
          
          setHypotheses(hypothesesData || []);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProjectData();
  }, [project, fetchProjectStages, createDefaultStages, toast]);

  // Calculate the current stage based on the project.stage field
  const getCurrentStage = () => {
    if (!project?.stage) return null;
    return stages.find(s => s.id === project.stage) || null;
  };

  // Determine the key focus area based on stage and progress
  const getKeyFocus = () => {
    const currentStage = getCurrentStage();
    if (!currentStage) return { title: 'Define Stages', description: 'Set up your project stages' };
    
    switch (currentStage.id) {
      case 'problem-validation':
        return { 
          title: 'Problem Interviews', 
          description: 'Interview potential users to validate the problem' 
        };
      case 'solution-validation':
        return { 
          title: 'Solution Testing', 
          description: 'Test proposed solutions with users' 
        };
      case 'mvp':
        return { 
          title: 'MVP Development', 
          description: 'Build minimal features that solve core problem' 
        };
      case 'product-market-fit':
        return { 
          title: 'User Acquisition', 
          description: 'Focus on growing active user base' 
        };
      case 'scale':
        return { 
          title: 'Growth Channels', 
          description: 'Expand marketing and sales channels' 
        };
      case 'mature':
        return { 
          title: 'Optimization', 
          description: 'Optimize processes and expand offerings' 
        };
      default:
        return { 
          title: 'User Testing', 
          description: 'Run experiments to validate core value proposition' 
        };
    }
  };

  const handleEditStage = (stage: Stage) => {
    setSelectedStage(stage);
    setIsEditDialogOpen(true);
  };

  const handleSaveStage = async (updatedStageData: Partial<Stage>) => {
    if (!selectedStage) return;
    
    try {
      const updatedStage = await updateStage(selectedStage.id, updatedStageData);
      
      if (updatedStage) {
        // Update the stages list
        setStages(prev => 
          prev.map(stage => 
            stage.id === selectedStage.id ? {...stage, ...updatedStageData} : stage
          )
        );
      }
    } catch (error) {
      console.error('Error saving stage:', error);
    }
  };

  // Get metrics data
  const getMetricByCategoryAndName = (category: string, defaultName: string) => {
    const metric = metrics.find(m => m.category === category);
    if (!metric) {
      return {
        value: '-',
        description: defaultName,
        targetDescription: 'Target: N/A',
        progress: 0,
        status: 'not-started'
      };
    }
    
    return {
      value: metric.current || '-',
      description: metric.name,
      targetDescription: `Target: ${metric.target}`,
      progress: metric.status === 'success' ? 100 : 
               metric.status === 'warning' ? 70 : 
               metric.status === 'error' ? 30 : 0,
      status: metric.status
    };
  };

  // Get metrics for each category
  const problemInterviews = getMetricByCategoryAndName('acquisition', 'Problem Interviews');
  const studentActivity = getMetricByCategoryAndName('activation', 'Daily Activity');
  const userBase = getMetricByCategoryAndName('retention', 'User Base');
  
  // Calculate validated hypotheses percentage
  const validatedHypotheses = hypotheses.filter(h => h.status === 'validated').length;
  const totalHypotheses = hypotheses.length;
  const hypothesesPercentage = totalHypotheses > 0 ? Math.round((validatedHypotheses / totalHypotheses) * 100) : 0;

  // Calculate progress based on stages
  const completedStages = stages.filter(s => s.status === 'complete').length;
  const stageProgress = stages.length > 0 ? Math.round((completedStages / stages.length) * 100) : 0;

  const keyFocus = getKeyFocus();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced Project Summary Card */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-validation-gray-900">Project Overview</h2>
        <Card className="animate-slideUpFade bg-gradient-to-br from-white to-validation-blue-50 border-t-4 border-t-validation-blue-600">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-validation-gray-900">{project.name}</CardTitle>
                <CardDescription className="text-validation-gray-600 text-base mt-1">
                  {project.description}
                </CardDescription>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getHealthColor()} flex items-center gap-2 whitespace-nowrap`}>
                {getHealthIcon()}
                <span className="font-medium">Project Health: {getHealthText()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Activity className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Current Stage</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-validation-gray-900 capitalize">{project.stage.replace('-', ' ')}</p>
                  <StatusBadge status={project.stage as any} />
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Lightbulb className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Validated Hypotheses</p>
                </div>
                <p className="font-semibold text-validation-gray-900">
                  {validatedHypotheses} of {totalHypotheses} ({hypothesesPercentage}%)
                </p>
                <ProgressBar value={hypothesesPercentage} variant="info" size="sm" className="mt-2" />
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Users className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Key Focus</p>
                </div>
                <p className="font-semibold text-validation-gray-900">{keyFocus.title}</p>
                <p className="text-sm text-validation-gray-600 mt-1">
                  {keyFocus.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Lean Startup Progress Tracker */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-validation-gray-900">Lean Startup Progress</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-blue-600 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-yellow-400 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-gray-200 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">Not Started</span>
            </div>
          </div>
        </div>
        <Card className="animate-slideUpFade animate-delay-200">
          <CardContent className="pt-6">
            <div className="space-y-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-validation-gray-500">Loading stages...</p>
                </div>
              ) : (
                stages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        {stage.status === 'complete' ? (
                          <div className="w-8 h-8 bg-validation-blue-500 rounded-full flex items-center justify-center shadow-subtle">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : stage.status === 'in-progress' ? (
                          <div className="w-8 h-8 bg-validation-yellow-400 rounded-full flex items-center justify-center shadow-subtle">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-validation-gray-200 shadow-subtle">
                            <span className="text-validation-gray-600 font-medium">{index + 1}</span>
                          </div>
                        )}
                        {index < stages.length - 1 && (
                          <div className={`h-12 w-0.5 ml-4 mt-1 ${
                            stage.status === 'complete' ? 'bg-validation-blue-500' : 'bg-validation-gray-200'
                          }`}></div>
                        )}
                      </div>
                      <div className="ml-4 flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className={`font-semibold text-lg ${
                            stage.status === 'complete' ? 'text-validation-blue-600' : 
                            stage.status === 'in-progress' ? 'text-validation-yellow-700' : 
                            'text-validation-gray-400'
                          }`}>
                            {stage.name}
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleEditStage(stage)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <p className="text-sm text-validation-gray-500 mt-1 mb-2">{stage.description}</p>
                        <StatusBadge status={stage.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Metric Cards with more visual appeal */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-validation-gray-900">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problem Interviews */}
          <Card className="animate-slideUpFade animate-delay-300 border-l-4 border-l-validation-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-blue-100 p-2 mr-3">
                    <Users className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">{problemInterviews.description}</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-blue-600">{problemInterviews.value}</p>
                  <p className="text-sm text-validation-gray-500">{problemInterviews.targetDescription}</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">User acquisition</p>
                <ProgressBar value={problemInterviews.progress} variant={problemInterviews.status as any} size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Student Activity */}
          <Card className="animate-slideUpFade animate-delay-400 border-l-4 border-l-validation-green-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-green-100 p-2 mr-3">
                    <Activity className="h-5 w-5 text-validation-green-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">{studentActivity.description}</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-green-600">{studentActivity.value}</p>
                  <p className="text-sm text-validation-gray-500">{studentActivity.targetDescription}</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Activity level</p>
                <ProgressBar value={studentActivity.progress} variant={studentActivity.status as any} size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Active Teachers */}
          <Card className="animate-slideUpFade animate-delay-500 border-l-4 border-l-validation-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-purple-100 p-2 mr-3">
                    <Target className="h-5 w-5 text-validation-purple-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">{userBase.description}</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-purple-600">{userBase.value}</p>
                  <p className="text-sm text-validation-gray-500">{userBase.targetDescription}</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Active users</p>
                <ProgressBar value={userBase.progress} variant={userBase.status as any} size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Validated Hypotheses */}
          <Card className="animate-slideUpFade animate-delay-500 border-l-4 border-l-validation-yellow-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-yellow-100 p-2 mr-3">
                    <Lightbulb className="h-5 w-5 text-validation-yellow-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Hypotheses</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-yellow-600">{validatedHypotheses}/{totalHypotheses}</p>
                  <p className="text-sm text-validation-gray-500">{hypothesesPercentage}% validated</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Critical assumptions</p>
                <ProgressBar value={hypothesesPercentage} variant="warning" size="sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stage Edit Dialog */}
      <StageEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        stage={selectedStage}
        onSave={handleSaveStage}
      />
    </div>
  );
};

export default OverviewSection;
