import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ArrowRight, CircleHelp } from 'lucide-react';
import { Stage } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import InfoTooltip from '@/components/InfoTooltip';

interface OverviewSectionProps {
  onboardingComplete?: boolean;
}

const OverviewSection = ({ onboardingComplete }: OverviewSectionProps = {}) => {
  const { currentProject, isLoading } = useProject();
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    if (currentProject) {
      const projectStages: Stage[] = [
        {
          id: 'problem',
          title: 'Problem Validation',
          description: 'Understand the problem you are solving and validate the market need.',
          status: currentProject.problem_tracking?.market_need_validated ? 'completed' :
                    currentProject.problem_tracking?.customer_interviews_conducted ? 'in-progress' : 'not-started',
          link: '/problem-validation',
          tracking: currentProject.problem_tracking,
        },
        {
          id: 'solution',
          title: 'Solution Validation',
          description: 'Define and validate your proposed solution with potential customers.',
          status: currentProject.solution_tracking?.positive_feedback_received ? 'completed' :
                    currentProject.solution_tracking?.tested_with_customers ? 'in-progress' : 'not-started',
          link: '/solution-validation',
          tracking: currentProject.solution_tracking,
        },
        {
          id: 'mvp',
          title: 'MVP & Testing',
          description: 'Build a Minimum Viable Product and gather initial user feedback.',
          status: currentProject.mvp_tracking?.metrics_gathered ? 'completed' :
                    currentProject.mvp_tracking?.released_to_users ? 'in-progress' : 'not-started',
          link: '/mvp',
          tracking: currentProject.mvp_tracking,
        },
        {
          id: 'metrics',
          title: 'Metrics & Analysis',
          description: 'Establish key metrics and analyze your product performance.',
          status: currentProject.metrics_tracking?.data_driven_decisions ? 'completed' :
                    currentProject.metrics_tracking?.dashboards_created ? 'in-progress' : 'not-started',
          link: '/metrics',
          tracking: currentProject.metrics_tracking,
        },
        {
          id: 'growth',
          title: 'Growth & Scaling',
          description: 'Focus on scaling your product and expanding your user base.',
          status: currentProject.growth_tracking?.repeatable_growth ? 'completed' :
                    currentProject.growth_tracking?.funnel_optimized ? 'in-progress' : 'not-started',
          link: '/growth',
          tracking: currentProject.growth_tracking,
        },
        {
          id: 'pivot',
          title: 'Pivot or Persevere',
          description: 'Evaluate your progress and decide whether to pivot or continue.',
          status: currentProject.pivot_tracking?.strategic_decision_made ? 'completed' :
                    currentProject.pivot_tracking?.reasoning_documented ? 'in-progress' : 'not-started',
          link: '/pivot',
          tracking: currentProject.pivot_tracking,
        },
      ];
      setStages(projectStages);
    }
  }, [currentProject]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!currentProject) {
    return <p>No project selected.</p>;
  }

  // Fix the button variant type error - changing 'success' to 'default'
  const getButtonVariant = (stageStatus: string) => {
    switch(stageStatus) {
      case 'completed':
        return 'default'; // Changed from 'success' to 'default'
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stages.map((stage) => (
        <Card key={stage.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium flex items-center">
              {stage.status === 'completed' && <Check className="mr-2 h-4 w-4 text-green-500" />}
              {stage.title}
              <InfoTooltip content={stage.description} className="ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs text-gray-500">
              {stage.description}
            </CardDescription>
          </CardContent>
          <Button asChild variant={getButtonVariant(stage.status)} className="w-full justify-start rounded-none rounded-b-md text-xs">
            <a href={stage.link} className="flex justify-between w-full items-center">
              <span>{stage.status === 'completed' ? 'View Results' : 'Get Started'}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default OverviewSection;
