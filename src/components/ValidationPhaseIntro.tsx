import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Lightbulb, Beaker, Layers, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
interface PhaseInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  graduationCriteria: string[];
}
const phaseData: Record<string, PhaseInfo> = {
  problem: {
    title: 'Problem Validation Phase',
    description: 'Verify that you are addressing a real problem that customers care about solving. Focus on understanding the problem space deeply through customer interviews and observation.',
    icon: <Lightbulb className="h-6 w-6" />,
    color: 'blue',
    graduationCriteria: ['Conducted 10+ customer interviews', 'Identified a specific customer segment with this problem', 'Problem rated as "important" or "very important" by >70% of interviewees', 'Customers are actively trying to solve this problem already']
  },
  solution: {
    title: 'Solution Validation Phase',
    description: 'Test your proposed solution with potential customers to determine if it successfully addresses the validated problem and if customers are willing to adopt it.',
    icon: <Beaker className="h-6 w-6" />,
    color: 'green',
    graduationCriteria: ['Created low-fidelity prototypes or mockups', 'Tested solution concepts with 5+ potential customers', '>50% of testers express interest in using the solution', 'Identified key features for MVP']
  },
  mvp: {
    title: 'MVP Testing Phase',
    description: 'Build the smallest possible version of your product that delivers value and test it with real users to gather feedback and validate your business model.',
    icon: <Layers className="h-6 w-6" />,
    color: 'yellow',
    graduationCriteria: ['MVP built with core features only', 'Acquired first set of real users', 'Users actively engaging with product', 'Identified key metrics for tracking product-market fit']
  },
  growth: {
    title: 'Growth Model Validation Phase',
    description: 'Design, test and optimize your growth model to scale customer acquisition, retention and revenue in a repeatable and sustainable way.',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'purple',
    graduationCriteria: ['Acquisition cost lower than customer lifetime value', 'Identified scalable customer acquisition channels', 'Retention metrics show sustained usage', 'Revenue model demonstrating positive unit economics']
  }
};
interface ValidationPhaseIntroProps {
  phase: 'problem' | 'solution' | 'mvp' | 'growth';
  onCreateNew?: () => void;
  createButtonText?: string;
}
const ValidationPhaseIntro = ({
  phase,
  onCreateNew,
  createButtonText = 'Create New'
}: ValidationPhaseIntroProps) => {
  const phaseInfo = phaseData[phase];

  // Adding the return statement that was missing
  return <Card className="bg-white mb-6 overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full bg-${phaseInfo.color}-100 mr-4`}>
              {phaseInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{phaseInfo.title}</h3>
              <p className="text-gray-600">{phaseInfo.description}</p>
            </div>
          </div>
          
          {onCreateNew}
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="graduation-criteria">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">Graduation Criteria</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <ul className="space-y-2">
              {phaseInfo.graduationCriteria.map((criteria, index) => <li key={index} className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-gray-200 text-center text-sm font-medium leading-5 mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{criteria}</span>
                </li>)}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>;
};
export default ValidationPhaseIntro;