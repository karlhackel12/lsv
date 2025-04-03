import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Circle, Lightbulb, Beaker, Layers, Sparkles, Target, LineChart, TrendingUp, GitBranch } from 'lucide-react';

// Define milestone types
interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: any;
  achieved: boolean;
}

interface MilestoneAchievementsProps {
  projectId: string;
}

const MilestoneAchievements = ({ projectId }: MilestoneAchievementsProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (projectId) {
      checkMilestones();
    }
  }, [projectId]);
  
  const checkMilestones = async () => {
    setIsLoading(true);
    try {
      // Fetch data needed to determine milestone achievements
      const { data: problemHypotheses } = await supabase
        .from('hypotheses')
        .select('id')
        .eq('project_id', projectId)
        .eq('phase', 'problem');
      
      const { data: solutionHypotheses } = await supabase
        .from('hypotheses')
        .select('id')
        .eq('project_id', projectId)
        .eq('phase', 'solution');
      
      const { data: experiments } = await supabase
        .from('experiments')
        .select('id, status, category')
        .eq('project_id', projectId);
      
      // Fetch project data to check tracking status
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      // Extract tracking data from project
      const mvpTracking = (projectData as any)?.mvp_tracking || {};
      const metricsTracking = (projectData as any)?.metrics_tracking || {};
      const growthTracking = (projectData as any)?.growth_tracking || {};
      const pivotTracking = (projectData as any)?.pivot_tracking || {};
      
      // Determine milestone achievements
      const problemValidated = problemHypotheses && problemHypotheses.length > 0;
      const solutionValidated = solutionHypotheses && solutionHypotheses.length > 0;
      const hasExperiments = experiments && experiments.length > 0;
      const hasCompletedExperiments = experiments?.some(exp => exp.status === 'completed') || false;
      const hasMvpExperiments = experiments?.some(exp => exp.category === 'mvp') || false;
      
      // Check MVP milestones
      const mvpDefined = hasMvpExperiments || mvpTracking?.core_features_defined;
      const mvpBuilt = mvpTracking?.mvp_built;
      const mvpReleased = mvpTracking?.released_to_users;
      
      // Check Metrics milestones
      const metricsEstablished = metricsTracking?.key_metrics_established;
      const metricsTracked = metricsTracking?.tracking_systems_setup;
      
      // Check Growth milestones
      const channelsIdentified = growthTracking?.channels_identified;
      const growthExperimentsSetup = growthTracking?.growth_experiments_setup;
      
      // Check Pivot milestones
      const pivotAssessmentConducted = pivotTracking?.pivot_assessment_conducted;
      
      // Define milestones with achievement status
      const milestoneList: Milestone[] = [
        {
          id: 'first-hypothesis',
          title: 'First Hypothesis Created',
          description: 'You\'ve created your first problem hypothesis',
          icon: Lightbulb,
          achieved: problemValidated
        },
        {
          id: 'first-experiment',
          title: 'First Experiment Designed',
          description: 'You\'ve designed your first validation experiment',
          icon: Beaker,
          achieved: hasExperiments
        },
        {
          id: 'experiment-completed',
          title: 'Experiment Completed',
          description: 'You\'ve completed at least one experiment and gathered data',
          icon: CheckCircle2,
          achieved: hasCompletedExperiments
        },
        {
          id: 'solution-validated',
          title: 'Solution Validated',
          description: 'You\'ve validated your solution with customers',
          icon: Target,
          achieved: solutionValidated && hasCompletedExperiments
        },
        {
          id: 'mvp-defined',
          title: 'MVP Defined',
          description: 'You\'ve defined your Minimum Viable Product',
          icon: Layers,
          achieved: mvpDefined
        },
        {
          id: 'mvp-built',
          title: 'MVP Built',
          description: 'You\'ve built your Minimum Viable Product',
          icon: Layers,
          achieved: mvpBuilt
        },
        {
          id: 'mvp-released',
          title: 'MVP Released',
          description: 'You\'ve released your MVP to test users',
          icon: Layers,
          achieved: mvpReleased
        },
        {
          id: 'metrics-established',
          title: 'Key Metrics Established',
          description: 'You\'ve established your key performance indicators',
          icon: LineChart,
          achieved: metricsEstablished
        },
        {
          id: 'metrics-tracked',
          title: 'Metrics Tracking Implemented',
          description: 'You\'ve implemented systems to track your metrics',
          icon: LineChart,
          achieved: metricsTracked
        },
        {
          id: 'growth-channels',
          title: 'Growth Channels Identified',
          description: 'You\'ve identified key channels for customer acquisition',
          icon: TrendingUp,
          achieved: channelsIdentified
        },
        {
          id: 'growth-experiments',
          title: 'Growth Experiments Running',
          description: 'You\'ve set up experiments to optimize growth',
          icon: TrendingUp,
          achieved: growthExperimentsSetup
        },
        {
          id: 'pivot-assessment',
          title: 'Pivot Assessment Complete',
          description: 'You\'ve evaluated if a pivot is needed based on data',
          icon: GitBranch,
          achieved: pivotAssessmentConducted
        }
      ];
      
      setMilestones(milestoneList);
    } catch (error) {
      console.error('Error checking milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const achievedCount = milestones.filter(m => m.achieved).length;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Milestone Achievements</span>
          <span className="text-sm font-normal text-gray-500">{achievedCount} of {milestones.length} Achieved</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            milestones.map(milestone => {
              const MilestoneIcon = milestone.icon;
              return (
                <div 
                  key={milestone.id}
                  className={`flex items-center p-3 rounded-md ${
                    milestone.achieved ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="mr-3">
                    {milestone.achieved ? (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <MilestoneIcon className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Circle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {milestone.title}
                      {milestone.achieved && (
                        <span className="ml-2 inline-flex items-center text-green-600 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Achieved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{milestone.description}</p>
                  </div>
                </div>
              );
            })
          )}
          
          {!isLoading && achievedCount === milestones.length && (
            <div className="flex items-center justify-center mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-md">
              <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-yellow-700">
                Congratulations! You've achieved all startup validation milestones!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneAchievements; 