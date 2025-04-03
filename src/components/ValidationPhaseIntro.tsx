import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-storage';

// Define styled types for each phase
const PHASES = {
  problem: {
    title: 'Problem Validation Phase',
    description: "Create and validate hypotheses about your target customers' problems and needs.",
    icon: Plus,
    color: 'text-blue-600',
    bgClass: 'bg-blue-50 border-blue-100',
    graduationCriteria: ['Created problem hypotheses', 'Conducted customer interviews', 'Identified pain points', 'Validated market need']
  },
  solution: {
    title: 'Solution Validation Phase',
    description: 'Test whether your proposed solution effectively addresses the validated problem.',
    icon: Plus,
    color: 'text-green-600',
    bgClass: 'bg-green-50 border-green-100',
    graduationCriteria: ['Defined solution hypotheses', 'Created solution sketches', 'Tested with customers', 'Received positive feedback']
  },
  mvp: {
    title: 'Minimum Viable Product Phase',
    description: 'Build the smallest possible version of your product that delivers value and test it with real users to gather feedback and validate your business model.',
    icon: Plus,
    color: 'text-yellow-600',
    bgClass: 'bg-yellow-50 border-yellow-100',
    graduationCriteria: ['Defined core features', 'Built minimum viable product', 'Released to test users', 'Gathered usage metrics']
  },
  metrics: {
    title: 'Metrics Definition Phase',
    description: "Define and track key metrics to measure your product's performance and guide decision-making.",
    icon: Plus,
    color: 'text-cyan-600',
    bgClass: 'bg-cyan-50 border-cyan-100',
    graduationCriteria: ['Established key performance indicators (KPIs)', 'Implemented tracking systems for all metrics', 'Created dashboards for data visualization', 'Regularly using data to drive business decisions']
  },
  growth: {
    title: 'Growth & Scaling Phase',
    description: 'Identify scalable acquisition channels and optimize your growth funnel to sustainably grow your product.',
    icon: Plus,
    color: 'text-indigo-600',
    bgClass: 'bg-indigo-50 border-indigo-100',
    graduationCriteria: ['Identified effective acquisition channels', 'Set up growth experiments', 'Optimized conversion funnel', 'Achieved repeatable, sustainable growth']
  },
  pivot: {
    title: 'Pivot Decision Phase',
    description: 'Evaluate all validation data to determine if a fundamental change in strategy is needed.',
    icon: Plus,
    color: 'text-pink-600',
    bgClass: 'bg-pink-50 border-pink-100',
    graduationCriteria: ['Evaluated all validation data', 'Conducted pivot assessment', 'Made strategic decision', 'Documented reasoning']
  }
};

interface ValidationPhaseIntroProps {
  phase: keyof typeof PHASES;
  onCreateNew: () => void;
  createButtonText: string;
}

const ValidationPhaseIntro = ({ phase, onCreateNew, createButtonText }: ValidationPhaseIntroProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage(`phase-intro-${phase}-expanded`, false);
  
  const phaseData = PHASES[phase];
  
  return (
    <Card className={`${phaseData.bgClass} border shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className={`text-lg font-bold ${phaseData.color}`}>
            {phaseData.title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          {phaseData.description}
        </CardDescription>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-2">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">To complete this phase:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {phaseData.graduationCriteria.map((criterion, index) => (
                  <li key={index} className="text-gray-600">{criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
      
      <div className="p-4 border-t border-gray-100 flex justify-end bg-white bg-opacity-50 rounded-b-lg">
        <Button 
          onClick={onCreateNew}
          className={phaseData.color.replace('text', 'bg').replace('-600', '-600 hover:bg-slate-800')}
        >
          <Plus className="h-4 w-4 mr-2" />
          {createButtonText}
        </Button>
      </div>
    </Card>
  );
};

export default ValidationPhaseIntro;
