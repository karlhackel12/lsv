
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';

interface ValidationProgressSummaryProps {
  projectId: string;
}

interface StageMilestone {
  name: string;
  key: string;
  description: string;
  completed: boolean;
}

const ValidationProgressSummary = ({ projectId }: ValidationProgressSummaryProps) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);
  
  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      
      setProject(data as unknown as Project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProblemStages = (): StageMilestone[] => {
    if (!project?.problem_tracking) return [];
    
    const problemTracking = project.problem_tracking as any;
    
    return [
      {
        name: 'Hypotheses Created',
        key: 'hypotheses_created',
        description: 'Created problem hypotheses',
        completed: !!problemTracking.hypotheses_created
      },
      {
        name: 'Customer Interviews',
        key: 'customer_interviews_conducted',
        description: 'Conducted customer interviews',
        completed: !!problemTracking.customer_interviews_conducted
      },
      {
        name: 'Pain Points Identified',
        key: 'pain_points_identified',
        description: 'Identified key pain points',
        completed: !!problemTracking.pain_points_identified
      },
      {
        name: 'Market Need Validated',
        key: 'market_need_validated',
        description: 'Validated market need',
        completed: !!problemTracking.market_need_validated
      }
    ];
  };
  
  const getSolutionStages = (): StageMilestone[] => {
    if (!project?.solution_tracking) return [];
    
    const solutionTracking = project.solution_tracking as any;
    
    return [
      {
        name: 'Solution Hypotheses Defined',
        key: 'solution_hypotheses_defined',
        description: 'Defined solution hypotheses',
        completed: !!solutionTracking.solution_hypotheses_defined
      },
      {
        name: 'Solution Sketches Created',
        key: 'solution_sketches_created',
        description: 'Created solution sketches',
        completed: !!solutionTracking.solution_sketches_created
      },
      {
        name: 'Tested With Customers',
        key: 'tested_with_customers',
        description: 'Tested solutions with customers',
        completed: !!solutionTracking.tested_with_customers
      },
      {
        name: 'Positive Feedback Received',
        key: 'positive_feedback_received',
        description: 'Received positive feedback',
        completed: !!solutionTracking.positive_feedback_received
      }
    ];
  };
  
  const getMVPStages = (): StageMilestone[] => {
    if (!project?.mvp_tracking) return [];
    
    const mvpTracking = project.mvp_tracking as any;
    
    return [
      {
        name: 'Core Features Defined',
        key: 'core_features_defined',
        description: 'Defined core features',
        completed: !!mvpTracking.core_features_defined
      },
      {
        name: 'MVP Built',
        key: 'mvp_built',
        description: 'Built the MVP',
        completed: !!mvpTracking.mvp_built
      },
      {
        name: 'Released To Users',
        key: 'released_to_users',
        description: 'Released to initial users',
        completed: !!mvpTracking.released_to_users
      },
      {
        name: 'Metrics Gathered',
        key: 'metrics_gathered',
        description: 'Gathered usage metrics',
        completed: !!mvpTracking.metrics_gathered
      }
    ];
  };
  
  const getMetricsStages = (): StageMilestone[] => {
    if (!project?.metrics_tracking) return [];
    
    const metricsTracking = project.metrics_tracking as any;
    
    return [
      {
        name: 'Key Metrics Established',
        key: 'key_metrics_established',
        description: 'Established key metrics',
        completed: !!metricsTracking.key_metrics_established
      },
      {
        name: 'Tracking Systems Setup',
        key: 'tracking_systems_setup',
        description: 'Set up tracking systems',
        completed: !!metricsTracking.tracking_systems_setup
      },
      {
        name: 'Dashboards Created',
        key: 'dashboards_created',
        description: 'Created monitoring dashboards',
        completed: !!metricsTracking.dashboards_created
      },
      {
        name: 'Data-Driven Decisions',
        key: 'data_driven_decisions',
        description: 'Made data-driven decisions',
        completed: !!metricsTracking.data_driven_decisions
      }
    ];
  };
  
  const getStagesForCurrentPhase = (): { stages: StageMilestone[], path: string } => {
    if (!project || !project.current_stage) return { stages: [], path: '/' };
    
    switch (project.current_stage) {
      case 'problem':
        return { stages: getProblemStages(), path: '/problem-validation' };
      case 'solution':
        return { stages: getSolutionStages(), path: '/solution-validation' };
      case 'mvp':
        return { stages: getMVPStages(), path: '/mvp' };
      case 'metrics':
        return { stages: getMetricsStages(), path: '/metrics' };
      default:
        return { stages: [], path: '/' };
    }
  };
  
  const { stages, path } = getStagesForCurrentPhase();
  
  const calculateProgress = (stages: StageMilestone[]): number => {
    if (!stages.length) return 0;
    const completedCount = stages.filter(stage => stage.completed).length;
    return Math.round((completedCount / stages.length) * 100);
  };
  
  const progress = calculateProgress(stages);
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!project) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Validation Progress</CardTitle>
          <CardDescription>No project data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Please select a project to view its validation progress.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">
              {project.current_stage?.charAt(0).toUpperCase() + project.current_stage?.slice(1)} Validation
            </CardTitle>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate(path)}
          >
            Continue
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <CardDescription>
          {stages.length > 0 
            ? `${progress}% complete (${stages.filter(s => s.completed).length}/${stages.length} tasks)`
            : "No validation tasks defined for this stage"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />
        
        {stages.length > 0 ? (
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div 
                key={index} 
                className={`flex items-start p-2 rounded-md ${stage.completed ? 'bg-green-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                  stage.completed ? 'bg-green-100 border-green-500 text-green-500' : 'border-gray-300'
                }`}>
                  {stage.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${stage.completed ? 'text-green-700' : 'text-gray-700'}`}>
                    {stage.name}
                  </h4>
                  <p className="text-xs text-gray-500">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">No validation tasks for this stage.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationProgressSummary;
