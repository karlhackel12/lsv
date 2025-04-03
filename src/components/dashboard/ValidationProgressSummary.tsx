import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, FlaskConical, Beaker, Layers, LineChart, GitFork, TrendingUp, CheckCircle, Circle, LucideIcon } from 'lucide-react';
import { Project } from '@/types/database';
import { toast } from '@/components/ui/use-toast';
import React from 'react';

const VALIDATION_STAGES = [
  { 
    id: 'problem', 
    label: 'Problem Validation', 
    icon: Lightbulb as LucideIcon, 
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
    icon: FlaskConical as LucideIcon, 
    color: 'bg-purple-500',
    criteria: [
      'Defined solution hypotheses',
      'Created solution sketches',
      'Tested with customers',
      'Received positive feedback'
    ]
  },
  { 
    id: 'mvp', 
    label: 'MVP', 
    icon: Layers as LucideIcon, 
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
    icon: LineChart as LucideIcon, 
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
    icon: GitFork as LucideIcon, 
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
    icon: TrendingUp as LucideIcon, 
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
  [key: string]: {
    criteria: Array<{
      text: string;
      completed: boolean;
    }>;
    completedCriteria: number;
  };
}

const ValidationProgressSummary = ({ projectId }: ValidationProgressSummaryProps) => {
  const [stageData, setStageData] = useState<StageData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentStage, setCurrentStage] = useState('problem');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [typedProjectData, setTypedProjectData] = useState<Project | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
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
      if (typedProjectData && typedProjectData.stage) {
        setCurrentStage(typedProjectData.stage || defaultStage);
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
      const newStageData: StageData = {
        problem: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'problem')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('problem')
        },
        solution: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'solution')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('solution')
        },
        mvp: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'mvp')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('mvp')
        },
        metrics: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'metrics')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('metrics')
        },
        pivot: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'pivot')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('pivot')
        },
        growth: {
          criteria: VALIDATION_STAGES.find(s => s.id === 'growth')?.criteria.map(c => ({ text: c, completed: false })) || [],
          completedCriteria: getCompletedCriteria('growth')
        }
      };
      
      // Calculate previous stage completion percentage to determine if a stage should be marked as visited
      const calculatePreviousStageCompletion = (stageIndex: number): number => {
        if (stageIndex <= 0) return 100; // First stage is always considered "visited"
        
        const prevStage = newStageData[Object.keys(newStageData)[stageIndex - 1]];
        const stageConfig = VALIDATION_STAGES[stageIndex - 1];
        return (prevStage.completedCriteria / stageConfig.criteria.length) * 100;
      };
      
      // Update hasVisited based on previous stage completion
      for (let i = 1; i < Object.keys(newStageData).length; i++) {
        // Also count as visited if any criteria are completed
        if (calculatePreviousStageCompletion(i) >= 50 || newStageData[Object.keys(newStageData)[i]].completedCriteria > 0) {
          newStageData[Object.keys(newStageData)[i]].completedCriteria = Math.min(
            newStageData[Object.keys(newStageData)[i]].completedCriteria,
            VALIDATION_STAGES[i - 1].criteria.length
          );
        }
      }
      
      setStageData(newStageData);
      
      // Calculate a more accurate progress percentage based on criteria completion
      const totalCriteriaCount = VALIDATION_STAGES.reduce((acc, stage) => acc + stage.criteria.length, 0);
      const completedCriteriaCount = Object.values(newStageData).reduce((acc, stage) => acc + stage.completedCriteria, 0);
      
      // Garantir que a porcentagem seja calculada corretamente
      let accurateProgressPercentage = 0;
      if (totalCriteriaCount > 0) {
        accurateProgressPercentage = Math.round((completedCriteriaCount / totalCriteriaCount) * 100);
      }

      // Atualizar o progresso na UI
      setProgressPercentage(accurateProgressPercentage);
      
      // Atualizar o estado local
      setTypedProjectData(typedProjectData);
      
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
  
  // Função para atualizar o progresso de um estágio específico
  const updateStageProgress = async (stageId: string, completedCriteriaCount: number) => {
    if (!projectId) return;
    
    try {
      // Pega o estágio que está sendo atualizado
      const stageToUpdate = stageData[stageId];
      if (!stageToUpdate) return;
      
      // Pega o estágio na definição para conhecer os critérios
      const stageDefinition = VALIDATION_STAGES.find(s => s.id === stageId);
      if (!stageDefinition) return;
      
      // Atualiza o objeto de acompanhamento correspondente
      let trackingKey = '';
      let trackingData = {};
      
      switch (stageId) {
        case 'problem':
          trackingKey = 'problem_tracking';
          trackingData = {
            problem_hypotheses_created: completedCriteriaCount >= 1,
            customer_interviews_conducted: completedCriteriaCount >= 2,
            pain_points_identified: completedCriteriaCount >= 3,
            market_need_validated: completedCriteriaCount >= 4
          };
          break;
        case 'solution':
          trackingKey = 'solution_tracking';
          trackingData = {
            solution_hypotheses_defined: completedCriteriaCount >= 1,
            solution_sketches_created: completedCriteriaCount >= 2,
            tested_with_customers: completedCriteriaCount >= 3,
            positive_feedback_received: completedCriteriaCount >= 4
          };
          break;
        case 'mvp':
          trackingKey = 'mvp_tracking';
          trackingData = {
            core_features_defined: completedCriteriaCount >= 1,
            mvp_built: completedCriteriaCount >= 2,
            released_to_users: completedCriteriaCount >= 3,
            metrics_gathered: completedCriteriaCount >= 4
          };
          break;
        case 'metrics':
          trackingKey = 'metrics_tracking';
          trackingData = {
            key_metrics_established: completedCriteriaCount >= 1,
            tracking_systems_setup: completedCriteriaCount >= 2,
            dashboards_created: completedCriteriaCount >= 3,
            data_driven_decisions: completedCriteriaCount >= 4
          };
          break;
        case 'pivot':
          trackingKey = 'pivot_tracking';
          trackingData = {
            validation_data_evaluated: completedCriteriaCount >= 1,
            pivot_assessment_conducted: completedCriteriaCount >= 2,
            strategic_decision_made: completedCriteriaCount >= 3,
            reasoning_documented: completedCriteriaCount >= 4
          };
          break;
        case 'growth':
          trackingKey = 'growth_tracking';
          trackingData = {
            channels_identified: completedCriteriaCount >= 1,
            growth_experiments_setup: completedCriteriaCount >= 2,
            funnel_optimized: completedCriteriaCount >= 3,
            repeatable_growth: completedCriteriaCount >= 4
          };
          break;
      }
      
      // Atualizar o banco de dados - garantir que seja uma string JSON
      if (trackingKey) {
        const trackingDataString = JSON.stringify(trackingData);
        
        const updateData = {
          [trackingKey]: trackingDataString,
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', projectId)
          .select()
          .single();
          
        if (error) {
          console.error('Erro ao atualizar progresso:', error);
          toast({
            title: 'Erro',
            description: 'Falha ao salvar o progresso',
            variant: 'destructive',
          });
        } else {
          console.log(`Progresso da etapa ${stageId} atualizado com sucesso:`, trackingData);
          
          // Atualizar o typedProjectData com os novos dados
          if (data && typedProjectData) {
            setTypedProjectData({
              ...typedProjectData,
              [trackingKey]: trackingDataString
            });
          }
        }
      }
      
    } catch (err) {
      console.error('Erro ao atualizar progresso da etapa:', err);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar o progresso',
        variant: 'destructive',
      });
    }
  };
  
  // Função para atualizar a etapa atual do projeto
  const updateProjectCurrentStage = async (stageId: string) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          stage: stageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar o estado local
      if (data) {
        // Se typedProjectData estiver definido, atualize seu valor de estágio
        if (typedProjectData) {
          setTypedProjectData({
            ...typedProjectData,
            stage: stageId
          });
        }
        
        // Atualizar o estágio atual se estiver sendo mostrado na UI
        setCurrentStage(stageId);
        
        toast({
          title: 'Estágio atualizado',
          description: `O estágio do projeto foi atualizado com sucesso`,
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar estágio:', err);
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Falha ao atualizar o estágio',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
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
          {VALIDATION_STAGES.map((stage) => {
            const stageId = stage.id;
            const isExpanded = expandedStage === stageId;
            const stageCriteria = stageData[stageId]?.criteria || [];
            const completedCriteria = stageData[stageId]?.completedCriteria || 0;
            const totalCriteria = stage.criteria.length;
            const percentComplete = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0;
            const isCurrentStage = currentStage === stageId;

            return (
              <div key={stageId} className="mb-4">
                <div
                  className={`flex flex-col p-4 rounded-lg cursor-pointer ${
                    isCurrentStage
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-white border border-gray-200"
                  }`}
                  onClick={() => setExpandedStage(isExpanded ? null : stageId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 rounded-full p-2 ${
                          isCurrentStage ? "bg-blue-100" : "bg-slate-100"
                        }`}
                      >
                        {React.createElement(stage.icon, { className: "h-5 w-5" })}
                      </div>
                      <div>
                        <div className="text-lg font-medium">{stage.label}</div>
                        <div className="text-sm text-gray-500">
                          {completedCriteria} de {totalCriteria} critérios completados
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isCurrentStage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Previne que o clique expanda/contraia a seção
                            updateProjectCurrentStage(stageId);
                          }}
                          className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-gray-700 transition-colors"
                          disabled={isUpdating}
                        >
                          Definir como atual
                        </button>
                      )}
                      {isCurrentStage && (
                        <span className="px-3 py-1 text-sm bg-blue-100 rounded-md text-blue-700">
                          Estágio atual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar section */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">
                        {completedCriteria}/{totalCriteria} ({percentComplete}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          percentComplete >= 75 
                            ? "bg-green-500" 
                            : percentComplete >= 50 
                              ? "bg-yellow-500" 
                              : percentComplete > 0 
                                ? "bg-orange-500" 
                                : "bg-gray-300"
                        }`}
                        style={{ width: `${percentComplete}%` }}
                        role="progressbar"
                        aria-valuenow={percentComplete}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Show checklist when expanded */}
                {isExpanded && (
                  <div className="mt-2 ml-11 space-y-2 p-2 text-sm">
                    <p className="text-xs text-gray-500 mb-2">Validation Checklist:</p>
                    <ul className="space-y-2">
                      {stage.criteria.map((criterion, idx) => {
                        const isChecked = idx < (stageData[stageId]?.completedCriteria || 0);
                        return (
                          <li key={idx} className="flex items-start">
                            <label className="flex items-start cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={Boolean(isChecked)}
                                onChange={(e) => {
                                  e.stopPropagation(); // Evitar propagação do clique
                                  
                                  // Update the number of completed criteria for this stage
                                  let newCompletedCriteria = completedCriteria;
                                  
                                  if (e.target.checked) {
                                    // If not already checked, increment the count
                                    if (!isChecked) {
                                      newCompletedCriteria = Math.min(
                                        completedCriteria + 1,
                                        stage.criteria.length
                                      );
                                    }
                                  } else {
                                    // If was checked, decrement the count
                                    if (isChecked) {
                                      newCompletedCriteria = Math.max(
                                        completedCriteria - 1,
                                        0
                                      );
                                    }
                                  }
                                  
                                  // Atualizar dados locais imediatamente para feedback visual
                                  const newStageData = {...stageData};
                                  if (newStageData[stageId]) {
                                    newStageData[stageId].completedCriteria = newCompletedCriteria;
                                    setStageData(newStageData);
                                  }
                                  
                                  // Atualizar no banco de dados com o novo valor
                                  // Usamos setTimeout para garantir que o estado local seja atualizado primeiro
                                  setTimeout(() => {
                                    updateStageProgress(stageId, newCompletedCriteria);
                                  }, 0);
                                  
                                  // Não disparamos o evento aqui para evitar loop de atualização
                                  // A atualização deve vir apenas do retorno da chamada ao servidor
                                }}
                                className="mr-2 h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`${isChecked ? 'text-gray-700' : 'text-gray-500'}`}>
                                {criterion}
                              </span>
                            </label>
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