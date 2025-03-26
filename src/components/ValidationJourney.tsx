
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Beaker, Layers, BarChart2, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  isActive?: boolean;
}

const JourneyStep = ({ icon, title, description, color, isActive = false }: JourneyStepProps) => {
  return (
    <div className={cn(
      "flex flex-col border rounded-lg p-4", 
      isActive ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
    )}>
      <div className={cn("p-2 rounded-full w-fit mb-3", color)}>
        {icon}
      </div>
      <h3 className="font-medium text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

interface ValidationJourneyProps {
  activePhase?: 'problem' | 'solution' | 'mvp' | 'growth' | 'pivot';
  className?: string;
}

const ValidationJourney = ({ activePhase, className }: ValidationJourneyProps) => {
  const steps = [
    {
      id: 'problem',
      icon: <Lightbulb className="h-5 w-5 text-blue-600" />,
      title: "Problem Validation",
      description: "Verify that your target customers actually have the problem you're trying to solve.",
      color: "bg-blue-100"
    },
    {
      id: 'solution',
      icon: <Beaker className="h-5 w-5 text-green-600" />,
      title: "Solution Validation",
      description: "Test if your proposed solution effectively addresses the validated problem.",
      color: "bg-green-100"
    },
    {
      id: 'mvp',
      icon: <Layers className="h-5 w-5 text-yellow-600" />,
      title: "MVP Testing",
      description: "Build a minimal version of your product to test with real users.",
      color: "bg-yellow-100"
    },
    {
      id: 'growth',
      icon: <BarChart2 className="h-5 w-5 text-purple-600" />,
      title: "Growth Model",
      description: "Establish and optimize your growth metrics and acquisition channels.",
      color: "bg-purple-100"
    },
    {
      id: 'pivot',
      icon: <GitFork className="h-5 w-5 text-red-600" />,
      title: "Pivot Decision",
      description: "Determine if you need to change your strategy based on validation results.",
      color: "bg-red-100"
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-medium mb-2">Validation Journey</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map(step => (
          <JourneyStep
            key={step.id}
            icon={step.icon}
            title={step.title}
            description={step.description}
            color={step.color}
            isActive={activePhase === step.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ValidationJourney;
