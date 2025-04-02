
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface HypothesisTemplate {
  id: string;
  title: string;
  description: string;
  statement: string;
  criteria: string;
  experiment: string;
  category: string;
}

export interface HypothesisTemplatesProps {
  showTemplates: boolean;
  onApply: (templateData: { statement: string; criteria: string; experiment: string; }) => void;
  onClose: () => void;
  phaseType: 'problem' | 'solution';
}

const problemTemplates: HypothesisTemplate[] = [
  {
    id: 'problem-1',
    title: 'Customer Pain Point',
    description: 'Test if your identified problem is a real pain point for customers',
    statement: 'We believe that [specific customer segment] are experiencing [specific problem] when they try to [specific activity].',
    criteria: 'At least 7 out of 10 interviewed customers confirm they face this problem.',
    experiment: 'Conduct 10 customer interviews focusing on pain points around [specific activity].',
    category: 'problem',
  },
  {
    id: 'problem-2',
    title: 'Problem Frequency',
    description: 'Test how often your customers encounter the problem',
    statement: 'We believe that [specific customer segment] encounter [specific problem] at least [frequency] times per [time period].',
    criteria: 'Survey data shows that at least 60% of respondents face this problem at the expected frequency or higher.',
    experiment: 'Conduct a survey with at least 50 potential customers from our target market.',
    category: 'problem',
  },
  {
    id: 'problem-3',
    title: 'Problem Severity',
    description: 'Test how significant the problem is to your target customers',
    statement: 'We believe that [specific problem] is causing [specific negative outcome] for [specific customer segment], resulting in [quantifiable impact].',
    criteria: 'At least 70% of interviewed customers rate this problem as "important" or "very important" to solve.',
    experiment: 'Conduct 15 customer interviews with a problem severity assessment.',
    category: 'problem',
  },
];

const solutionTemplates: HypothesisTemplate[] = [
  {
    id: 'solution-1',
    title: 'Value Proposition',
    description: 'Test if your solution delivers the claimed value',
    statement: 'We believe that [specific solution feature] will [specific benefit] for [specific customer segment].',
    criteria: 'At least 7 out of 10 users report that the feature delivered the expected benefit.',
    experiment: 'Create a simple prototype and collect feedback from 10 target users.',
    category: 'solution',
  },
  {
    id: 'solution-2',
    title: 'Solution Preference',
    description: 'Test if customers prefer your solution to alternatives',
    statement: 'We believe that [specific customer segment] will prefer our [specific solution] over [existing alternatives] because of [specific differentiator].',
    criteria: 'In A/B tests, our solution achieves at least 30% higher engagement than alternatives.',
    experiment: 'Run a comparative test between our solution and top alternatives with 100 participants.',
    category: 'solution',
  },
  {
    id: 'solution-3', 
    title: 'Willingness to Pay',
    description: 'Test if customers are willing to pay for your solution',
    statement: 'We believe that [specific customer segment] will be willing to pay [price point] for our [specific solution].',
    criteria: 'At least 30% of prospects convert at the proposed price point in our pre-sales campaign.',
    experiment: 'Create a pre-sales landing page with pricing and track conversion rates.',
    category: 'solution',
  },
];

const HypothesisTemplates: React.FC<HypothesisTemplatesProps> = ({ 
  showTemplates, 
  onApply, 
  onClose, 
  phaseType 
}) => {
  if (!showTemplates) return null;
  
  const templates = phaseType === 'problem' ? problemTemplates : solutionTemplates;
  
  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hypothesis Templates</h3>
        <Button variant="outline" size="sm" onClick={onClose}>Close Templates</Button>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 grid gap-4">
          {templates.map(template => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Statement:</span> {template.statement}</p>
                  <p><span className="font-semibold">Success Criteria:</span> {template.criteria}</p>
                  <p><span className="font-semibold">Experiment:</span> {template.experiment}</p>
                </div>
                <Button 
                  className="mt-4 w-full" 
                  size="sm"
                  onClick={() => onApply({
                    statement: template.statement,
                    criteria: template.criteria,
                    experiment: template.experiment
                  })}
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HypothesisTemplates;
