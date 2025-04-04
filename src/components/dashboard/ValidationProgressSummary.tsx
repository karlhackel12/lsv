import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, FlaskConical, Beaker, Layers, LineChart, GitFork, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { Project } from '@/types/database';

const VALIDATION_STAGES = [
  { 
    id: 'problem', 
    label: 'Problem Validation', 
    icon: Lightbulb, 
    color: 'bg-blue-500',
    criteria: [
      'Created problem hypotheses',
      'Conducted customer interviews',
      'Identified pain points',
      'Validated market need'
    ]
  },
  { 
    id: 'solution', 
    label: 'Solution Validation', 
    icon: FlaskConical, 
    color: 'bg-purple-500',
    criteria: [
      'Defined solution hypotheses',
      'Created solution sketches',
      'Tested with customers',
      'Received positive feedback'
    ]
  },
  { 
    id: 'experiments', 
    label: 'Experiments', 
    icon: Beaker, 
    color: 'bg-amber-500',
    criteria: [
      'Designed validation experiments',
      'Collected measurable data',
      'Analyzed results',
      'Iterated based on findings'
    ]
  },
  { 
    id: 'mvp', 
    label: 'MVP', 
    icon: Layers, 
    color: 'bg-green-500',
    criteria: [
      'Defined core features',
      'Built minimum viable product',
      'Released to test users',
      'Gathered usage metrics'
    ]
  },
  { 
    id: 'metrics', 
    label: 'Metrics', 
    icon: LineChart, 
    color: 'bg-cyan-500',
    criteria: [
      'Established key metrics',
      'Set up tracking systems',
      'Created data dashboards',
      'Used data for decisions'
    ]
  },
  { 
    id: 'pivot', 
    label: 'Pivot Decision', 
    icon: GitFork, 
    color: 'bg-pink-500',
    criteria: [
      'Evaluated all validation data',
      'Conducted pivot assessment',
      'Made strategic decision',
      'Documented reasoning'
    ]
  },
  { 
    id: 'growth', 
    label: 'Growth', 
    icon: TrendingUp, 
    color: 'bg-indigo-500',
    criteria: [
      'Identified growth channels',
      'Set up growth experiments',
      'Optimized conversion funnel',
      'Achieved repeatable growth'
    ]
  }
];

interface ValidationProgressSummaryProps {
  projectId: string;
}

interface StageData {
  id: string;
  count: number;
  hasVisited: boolean;
  completedCriteria: number;
}

const ValidationProgressSummary = ({ projectId }: ValidationProgressSummaryProps) => {
  const [stageData, setStageData] = useState<StageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentStage, setCurrentStage] = useState('problem');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Refresh function that can be called to update the validation progress
  const refreshProgress = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  useEffect(() => {
    if (projectId) {
      fetchValidationData();
    }
  }, [projectId, refreshCounter]);
  
  // Add event listener for the validation-progress-update custom event
  useEffect(() => {
    const handleProgressUpdate = () => {
      refreshProgress();
    };
    
    window.addEventListener('validation-progress-update', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('validation-progress-update', handleProgressUpdate);
    };
  }, []);
  
  const fetchValidationData = async () => {
    setIsLoading(true);
    try {
      // Fetch problem hypotheses count
      const { data: problemHypotheses, error: problemError } = await supabase
        .from('hypotheses')
        .select('id')
        .eq('project_id', projectId)
        .eq('phase', 'problem');
      
      if (problemError) {
        console.error('Error fetching problem hypotheses:', problemError);
      }
      
      // Fetch solution hypotheses count
      const { data: solutionHypotheses, error: solutionError } = await supabase
        .from('hypotheses')
        .select('id')
        .eq('project_id', projectId)
        .eq('phase', 'solution');
      
      if (solutionError) {
        console.error('Error fetching solution hypotheses:', solutionError);
      }
      
      // Fetch experiments count
      const { data: experiments, error: experimentsError } = await supabase
        .from('experiments')
        .select('id, category')
        .eq('project_id', projectId);
      
      if (experimentsError) {
        console.error('Error fetching experiments:', experimentsError);
      }
      
      // Try to fetch the current_stage and tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        console.error('Error fetching project data:', projectError);
      }
      
      // Type-cast projectData to the Project interface
      const typedProjectData = projectData as Project;
      
      // Extract Problem tracking data if it exists
      let problemTrackingData = {
        problem_hypotheses_created: false,
        customer_interviews_conducted: false,
        pain_points_identified: false,
        market_need_validated: false
      };
      
      if (typedProjectData && typedProjectData.problem_tracking) {
        try {
          const trackingData = typeof typedProjectData.problem_tracking === 'string'
            ? JSON.parse(typedProjectData.problem_tracking)
            : typedProjectData.problem_tracking;
            
          problemTrackingData = {
            problem_hypotheses_created: !!trackingData.problem_hypotheses_created,
            customer_interviews_conducted: !!trackingData.customer_interviews_conducted,
            pain_points_identified: !!trackingData.pain_points_identified,
            market_need_validated: !!trackingData.market_need_validated
          };
        } catch (err) {
          console.error('Error parsing problem tracking data:', err);
        }
      }
      
      // Extract Solution tracking data if it exists
      let solutionTrackingData = {
        solution_hypotheses_defined: false,
        solution_sketches_created: false,
        tested_with_customers: false,
        positive_feedback_received: false
      };
      
      if (typedProjectData && typedProjectData.solution_tracking) {
        try {
          const trackingData = typeof typedProjectData.solution_tracking === 'string'
            ? JSON.parse(typedProjectData.solution_tracking)
            : typedProjectData.solution_tracking;
            
          solutionTrackingData = {
            solution_hypotheses_defined: !!trackingData.solution_hypotheses_defined,
            solution_sketches_created: !!trackingData.solution_sketches_created,
            tested_with_customers: !!trackingData.tested_with_customers,
            positive_feedback_received: !!trackingData.positive_feedback_received
          };
        } catch (err) {
          console.error('Error parsing solution tracking data:', err);
        }
      }
      
      // Extract MVP tracking data if it exists
      let mvpTrackingData = {
        core_features_defined: false,
        mvp_built: false,
        released_to_users: false,
        metrics_gathered: false
      };
      
      if (typedProjectData && typedProjectData.mvp_tracking) {
        try {
          const trackingData = typeof typedProjectData.mvp_tracking === 'string' 
            ? JSON.parse(typedProjectData.mvp_tracking) 
            : typedProjectData.mvp_tracking;
            
          mvpTrackingData = {
            core_features_defined: !!trackingData.core_features_defined,
            mvp_built: !!trackingData.mvp_built,
            released_to_users: !!trackingData.released_to_users,
            metrics_gathered: !!trackingData.metrics_gathered
          };
        } catch (err) {
          console.error('Error parsing MVP tracking data:', err);
        }
      }
      
      // Extract Metrics tracking data if it exists
      let metricsTrackingData = {
        key_metrics_established: false,
        tracking_systems_setup: false,
        dashboards_created: false,
        data_driven_decisions: false
      };
      
      if (typedProjectData && typedProjectData.metrics_tracking) {
        try {
          const trackingData = typeof typedProjectData.metrics_tracking === 'string'
            ? JSON.parse(typedProjectData.metrics_tracking)
            : typedProjectData.metrics_tracking;
            
          metricsTrackingData = {
            key_metrics_established: !!trackingData.key_metrics_established,
            tracking_systems_setup: !!trackingData.tracking_systems_setup,
            dashboards_created: !!trackingData.dashboards_created,
            data_driven_decisions: !!trackingData.data_driven_decisions
          };
        } catch (err) {
          console.error('Error parsing metrics tracking data:', err);
        }
      }
      
      // Extract Growth tracking data if it exists
      let growthTrackingData = {
        channels_identified: false,
        growth_experiments_setup: false,
        funnel_optimized: false,
        repeatable_growth: false
      };
      
      if (typedProjectData && typedProjectData.growth_tracking) {
        try {
          const trackingData = typeof typedProjectData.growth_tracking === 'string'
            ? JSON.parse(typedProjectData.growth_tracking)
            : typedProjectData.growth_tracking;
            
          growthTrackingData = {
            channels_identified: !!trackingData.channels_identified,
            growth_experiments_setup: !!trackingData.growth_experiments_setup,
            funnel_optimized: !!trackingData.funnel_optimized,
            repeatable_growth: !!trackingData.repeatable_growth
          };
        } catch (err) {
          console.error('Error parsing growth tracking data:', err);
        }
      }
      
      // Extract Pivot tracking data if it exists
      let pivotTrackingData = {
        validation_data_evaluated: false,
        pivot_assessment_conducted: false,
        strategic_decision_made: false,
        reasoning_documented: false
      };
      
      if (typedProjectData && typedProjectData.pivot_tracking) {
        try {
          const trackingData = typeof typedProjectData.pivot_tracking === 'string'
            ? JSON.parse(typedProjectData.pivot_tracking)
            : typedProjectData.pivot_tracking;
            
          pivotTrackingData = {
            validation_data_evaluated: !!trackingData.validation_data_evaluated,
            pivot_assessment_conducted: !!trackingData.pivot_assessment_conducted,
            strategic_decision_made: !!trackingData.strategic_decision_made,
            reasoning_documented: !!trackingData.reasoning_documented
          };
        } catch (err) {
          console.error('Error parsing pivot tracking data:', err);
        }
      }
      
      // If current_stage exists in the result, use it
      const defaultStage = 'problem';
      if (typedProjectData && typedProjectData.current_stage) {
        setCurrentStage(typedProjectData.current_stage || defaultStage);
      } else {
        setCurrentStage(defaultStage);
      }
      
      // Count experiments by category
      const experimentsByCategory: Record<string, number> = {
        problem: 0,
        solution: 0,
        mvp: 0,
        metrics: 0,
        growth: 0
      };
      
      experiments?.forEach(exp => {
        if (exp.category && experimentsByCategory[exp.category] !== undefined) {
          experimentsByCategory[exp.category]++;
        }
      });
      
      // Calculate completed criteria - updated to use tracking data
      const getCompletedCriteria = (stageId: string) => {
        switch(stageId) {
          case 'problem':
            // Count completed Problem criteria
            let problemCriteriaCount = 0;
            if (problemTrackingData.problem_hypotheses_created) problemCriteriaCount++;
            if (problemTrackingData.customer_interviews_conducted) problemCriteriaCount++;
            if (problemTrackingData.pain_points_identified) problemCriteriaCount++;
            if (problemTrackingData.market_need_validated) problemCriteriaCount++;
            return problemCriteriaCount;
          case 'solution':
            // Count completed Solution criteria
            let solutionCriteriaCount = 0;
            if (solutionTrackingData.solution_hypotheses_defined) solutionCriteriaCount++;
            if (solutionTrackingData.solution_sketches_created) solutionCriteriaCount++;
            if (solutionTrackingData.tested_with_customers) solutionCriteriaCount++;
            if (solutionTrackingData.positive_feedback_received) solutionCriteriaCount++;
            return solutionCriteriaCount;
          case 'experiments':
            return Math.min(
              (experiments?.length || 0) > 0 ? 2 : 0, 
              4
            );
          case 'mvp':
            // Count completed MVP criteria
            let mvpCriteriaCount = 0;
            if (mvpTrackingData.core_features_defined) mvpCriteriaCount++;
            if (mvpTrackingData.mvp_built) mvpCriteriaCount++;
            if (mvpTrackingData.released_to_users) mvpCriteriaCount++;
            if (mvpTrackingData.metrics_gathered) mvpCriteriaCount++;
            return mvpCriteriaCount;
          case 'metrics':
            // Count completed Metrics criteria
            let metricsCriteriaCount = 0;
            if (metricsTrackingData.key_metrics_established) metricsCriteriaCount++;
            if (metricsTrackingData.tracking_systems_setup) metricsCriteriaCount++;
            if (metricsTrackingData.dashboards_created) metricsCriteriaCount++;
            if (metricsTrackingData.data_driven_decisions) metricsCriteriaCount++;
            return metricsCriteriaCount;
          case 'pivot':
            // Count completed Pivot criteria
            let pivotCriteriaCount = 0;
            if (pivotTrackingData.validation_data_evaluated) pivotCriteriaCount++;
            if (pivotTrackingData.pivot_assessment_conducted) pivotCriteriaCount++;
            if (pivotTrackingData.strategic_decision_made) pivotCriteriaCount++;
            if (pivotTrackingData.reasoning_documented) pivotCriteriaCount++;
            return pivotCriteriaCount;
          case 'growth':
            // Count completed Growth criteria
            let growthCriteriaCount = 0;
            if (growthTrackingData.channels_identified) growthCriteriaCount++;
            if (growthTrackingData.growth_experiments_setup) growthCriteriaCount++;
            if (growthTrackingData.funnel_optimized) growthCriteriaCount++;
            if (growthTrackingData.repeatable_growth) growthCriteriaCount++;
            return growthCriteriaCount;
          default:
            return 0;
        }
      };
      
      // Build stage data
      const newStageData: StageData[] = [
        { 
          id: 'problem', 
          count: problemHypotheses?.length || 0, 
          hasVisited: true || 
                     (typedProjectData && typedProjectData.problem_tracking && problemTrackingData.problem_hypotheses_created) || 
                     (typedProjectData && typedProjectData.problem_tracking && problemTrackingData.customer_interviews_conducted) || 
                     (typedProjectData && typedProjectData.problem_tracking && problemTrackingData.pain_points_identified) ||
                     (typedProjectData && typedProjectData.problem_tracking && problemTrackingData.market_need_validated), 
          completedCriteria: getCompletedCriteria('problem') 
        },
        { 
          id: 'solution', 
          count: solutionHypotheses?.length || 0, 
          hasVisited: !!solutionHypotheses?.length || 
                     (typedProjectData && typedProjectData.solution_tracking && solutionTrackingData.solution_hypotheses_defined) || 
                     (typedProjectData && typedProjectData.solution_tracking && solutionTrackingData.solution_sketches_created) ||
                     (typedProjectData && typedProjectData.solution_tracking && solutionTrackingData.tested_with_customers) ||
                     (typedProjectData && typedProjectData.solution_tracking && solutionTrackingData.positive_feedback_received) ||
                     (currentStage === 'solution'), 
          completedCriteria: getCompletedCriteria('solution') 
        },
        { 
          id: 'experiments', 
          count: experiments?.length || 0, 
          hasVisited: !!experiments?.length || (currentStage === 'experiments'), 
          completedCriteria: getCompletedCriteria('experiments') 
        },
        { 
          id: 'mvp', 
          count: experimentsByCategory.mvp || 0, 
          hasVisited: !!experimentsByCategory.mvp || 
                     (typedProjectData && typedProjectData.mvp_tracking && mvpTrackingData.core_features_defined) || 
                     (typedProjectData && typedProjectData.mvp_tracking && mvpTrackingData.mvp_built) || 
                     (typedProjectData && typedProjectData.mvp_tracking && mvpTrackingData.released_to_users) || 
                     (typedProjectData && typedProjectData.mvp_tracking && mvpTrackingData.metrics_gathered) || 
                     (currentStage === 'mvp'), 
          completedCriteria: getCompletedCriteria('mvp') 
        },
        { 
          id: 'metrics', 
          count: experimentsByCategory.metrics || 0, 
          hasVisited: !!experimentsByCategory.metrics || 
                     (typedProjectData && typedProjectData.metrics_tracking && metricsTrackingData.key_metrics_established) || 
                     (typedProjectData && typedProjectData.metrics_tracking && metricsTrackingData.tracking_systems_setup) || 
                     (typedProjectData && typedProjectData.metrics_tracking && metricsTrackingData.dashboards_created) || 
                     (typedProjectData && typedProjectData.metrics_tracking && metricsTrackingData.data_driven_decisions) || 
                     (currentStage === 'metrics'), 
          completedCriteria: getCompletedCriteria('metrics') 
        },
        { 
          id: 'pivot', 
          count: 0, 
          hasVisited: currentStage === 'pivot' || 
                     (typedProjectData && typedProjectData.pivot_tracking && pivotTrackingData.validation_data_evaluated) || 
                     (typedProjectData && typedProjectData.pivot_tracking && pivotTrackingData.pivot_assessment_conducted) || 
                     (typedProjectData && typedProjectData.pivot_tracking && pivotTrackingData.strategic_decision_made) || 
                     (typedProjectData && typedProjectData.pivot_tracking && pivotTrackingData.reasoning_documented), 
          completedCriteria: getCompletedCriteria('pivot') 
        },
        { 
          id: 'growth', 
          count: experimentsByCategory.growth || 0, 
          hasVisited: !!experimentsByCategory.growth || 
                     (typedProjectData && typedProjectData.growth_tracking && growthTrackingData.channels_identified) || 
                     (typedProjectData && typedProjectData.growth_tracking && growthTrackingData.growth_experiments_setup) || 
                     (typedProjectData && typedProjectData.growth_tracking && growthTrackingData.funnel_optimized) || 
                     (typedProjectData && typedProjectData.growth_tracking && growthTrackingData.repeatable_growth) || 
                     (currentStage === 'growth'), 
          completedCriteria: getCompletedCriteria('growth') 
        }
      ];
      
      // Calculate previous stage completion percentage to determine if a stage should be marked as visited
      const calculatePreviousStageCompletion = (stageIndex: number): number => {
        if (stageIndex <= 0) return 100; // First stage is always considered "visited"
        
        const prevStage = newStageData[stageIndex - 1];
        const stageConfig = VALIDATION_STAGES[stageIndex - 1];
        return (prevStage.completedCriteria / stageConfig.criteria.length) * 100;
      };
      
      // Update hasVisited based on previous stage completion
      for (let i = 1; i < newStageData.length; i++) {
        // Also count as visited if any criteria are completed
        if (calculatePreviousStageCompletion(i) >= 50 || newStageData[i].completedCriteria > 0) {
          newStageData[i].hasVisited = true;
        }
      }
      
      setStageData(newStageData);
      
      // Calculate progress percentage
      const visitedStages = newStageData.filter(stage => stage.hasVisited).length;
      const totalStages = VALIDATION_STAGES.length;

      // Calculate a more accurate progress percentage based on criteria completion
      const totalCriteriaCount = VALIDATION_STAGES.reduce((acc, stage) => acc + stage.criteria.length, 0);
      const completedCriteriaCount = newStageData.reduce((acc, stage) => acc + stage.completedCriteria, 0);
      const accurateProgressPercentage = Math.round((completedCriteriaCount / totalCriteriaCount) * 100);

      // Use the more accurate percentage based on criteria completion
      setProgressPercentage(accurateProgressPercentage);
      
    } catch (error) {
      console.error('Error fetching validation data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get the current stage index
  const currentStageIndex = VALIDATION_STAGES.findIndex(stage => stage.id === currentStage);
  
  const toggleStageExpansion = (stageId: string) => {
    if (expandedStage === stageId) {
      setExpandedStage(null);
    } else {
      setExpandedStage(stageId);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Validation Journey Progress</span>
          <span className="text-sm font-normal text-gray-500">{progressPercentage}% Complete</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercentage} className="h-2 mb-6" />
        
        <div className="space-y-4">
          {VALIDATION_STAGES.map((stage, index) => {
            const StageIcon = stage.icon;
            const stageInfo = stageData.find(s => s.id === stage.id) || { count: 0, hasVisited: false, completedCriteria: 0 };
            const isCurrent = stage.id === currentStage;
            const isCompleted = index < currentStageIndex;
            const isExpanded = expandedStage === stage.id;
            const criteriaPercentage = stageInfo.completedCriteria / stage.criteria.length * 100;
            
            return (
              <div key={stage.id}>
                <div 
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    isCurrent ? 'bg-blue-50 border border-blue-100' : 
                    (stageInfo.completedCriteria === stage.criteria.length) ? 'bg-green-50 border border-green-100' : 
                    stageInfo.hasVisited ? 'bg-blue-50/30 border border-blue-50' : ''
                  }`}
                  onClick={() => toggleStageExpansion(stage.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage.color} text-white mr-3`}>
                    <StageIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className={`font-medium ${isCurrent ? 'text-blue-700' : ''}`}>{stage.label}</span>
                      {stageInfo.count > 0 && (
                        <span className="text-sm text-gray-500">{stageInfo.count} {stage.id === 'problem' || stage.id === 'solution' ? 'hypotheses' : 'items'}</span>
                      )}
                    </div>
                    
                    {isCurrent && (
                      <p className="text-xs text-blue-600 mt-1">Current focus area</p>
                    )}
                    
                    {/* Small progress bar for criteria completion */}
                    <div className="w-full mt-2">
                      <div className="h-1 w-full bg-gray-100 rounded-full">
                        <div 
                          className={`h-1 rounded-full ${
                            criteriaPercentage >= 75 ? 'bg-green-500' :
                            criteriaPercentage >= 50 ? 'bg-yellow-500' :
                            criteriaPercentage > 0 ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                          style={{ width: `${criteriaPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {stageInfo.hasVisited && !isCurrent && !isCompleted && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">In progress</span>
                  )}
                  
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>
                  )}
                </div>
                
                {/* Show checklist when expanded */}
                {isExpanded && (
                  <div className="mt-2 ml-11 space-y-2 p-2 text-sm">
                    <p className="text-xs text-gray-500 mb-2">Validation Checklist:</p>
                    <ul className="space-y-2">
                      {stage.criteria.map((criterion, idx) => {
                        const isChecked = idx < stageInfo.completedCriteria;
                        return (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-0.5">
                              {isChecked ? 
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
                                <Circle className="h-3.5 w-3.5 text-gray-300" />
                              }
                            </span>
                            <span className={`${isChecked ? 'text-gray-700' : 'text-gray-500'}`}>
                              {criterion}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationProgressSummary; 