
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
    graduationCriteria: [
      'Conducted 10+ customer interviews',
      'Identified a specific customer segment with this problem',
      'Problem rated as "important" or "very important" by >70% of interviewees',
      'Customers are actively trying to solve this problem already'
    ]
  },
  solution: {
    title: 'Solution Validation Phase',
    description: 'Test your proposed solution with potential customers to determine if it successfully addresses the validated problem and if customers are willing to adopt it.',
    icon: <Beaker className="h-6 w-6" />,
    color: 'green',
    graduationCriteria: [
      'Created low-fidelity prototypes or mockups',
      'Tested solution concepts with 5+ potential customers',
      '>50% of testers express interest in using the solution',
      'Identified key features for MVP'
    ]
  },
  mvp: {
    title: 'MVP Testing Phase',
    description: 'Build the smallest possible version of your product that delivers value and test it with real users to gather feedback and validate your business model.',
    icon: <Layers className="h-6 w-6" />,
    color: 'yellow',
    graduationCriteria: [
      'MVP built with core features only',
      'Acquired first set of real users',
      'Users actively engaging with product',
      'Identified key metrics for tracking product-market fit'
    ]
  },
  growth: {
    title: 'Growth Model Validation Phase',
    description: 'Design, test and optimize your growth model to scale customer acquisition, retention and revenue in a repeatable and sustainable way.',
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'purple',
    graduationCriteria: [
      'Acquisition cost lower than customer lifetime value',
      'Identified scalable customer acquisition channels',
      'Retention metrics show sustained usage',
      'Revenue model demonstrating positive unit economics'
    ]
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
  
  return (
    <Card className={`p-6 mb-6 border-l-4 border-l-validation-${phaseInfo.color}-500 animate-fadeIn`}>
      <div className="flex items-start">
        <div className={`p-3 rounded-full bg-validation-${phaseInfo.color}-100 mr-4`}>
          {phaseInfo.icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">{phaseInfo.title}</h2>
              <p className="text-validation-gray-600 mb-4">{phaseInfo.description}</p>
            </div>
            {onCreateNew && (
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`mr-2 bg-validation-${phaseInfo.color}-50 text-validation-${phaseInfo.color}-700 border-validation-${phaseInfo.color}-200 hover:bg-validation-${phaseInfo.color}-100`}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent 
                      className={`w-80 p-0 border-validation-${phaseInfo.color}-200 bg-white`}
                      side="bottom"
                    >
                      <div className={`px-4 py-2 bg-validation-${phaseInfo.color}-50 border-b border-validation-${phaseInfo.color}-200 text-validation-${phaseInfo.color}-700 font-medium`}>
                        Graduation Criteria
                      </div>
                      <div className="px-1 py-1">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="criteria" className="border-0">
                            <AccordionTrigger className="px-3 py-2 text-sm">
                              View criteria to advance
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-none space-y-1 p-2">
                                {phaseInfo.graduationCriteria.map((criteria, index) => (
                                  <li key={index} className="flex items-start text-sm">
                                    <div className={`h-2 w-2 rounded-full bg-validation-${phaseInfo.color}-500 mt-1.5 mr-2 flex-shrink-0`}></div>
                                    <span className="text-validation-gray-600">{criteria}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  onClick={onCreateNew}
                  className={`bg-validation-${phaseInfo.color}-600 hover:bg-validation-${phaseInfo.color}-700`}
                >
                  {createButtonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ValidationPhaseIntro;
