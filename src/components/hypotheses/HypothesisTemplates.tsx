
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Beaker, Copy } from 'lucide-react';
import { 
  TEMPLATE_PROBLEM_HYPOTHESES, 
  TEMPLATE_SOLUTION_HYPOTHESES,
  TEMPLATE_PROBLEM_CRITERIA,
  TEMPLATE_SOLUTION_CRITERIA
} from '@/types/pivot';

interface HypothesisTemplatesProps {
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
  onSelectTemplate?: (template: string) => void;
  phaseType?: 'problem' | 'solution';
}

const HypothesisTemplates = ({ 
  showTemplates, 
  setShowTemplates,
  onSelectTemplate,
  phaseType = 'problem'
}: HypothesisTemplatesProps) => {
  if (!showTemplates) return null;
  
  // Select appropriate templates based on phase
  const hypothesisTemplates = phaseType === 'problem' 
    ? TEMPLATE_PROBLEM_HYPOTHESES 
    : TEMPLATE_SOLUTION_HYPOTHESES;
    
  const criteriaTemplates = phaseType === 'problem'
    ? TEMPLATE_PROBLEM_CRITERIA
    : TEMPLATE_SOLUTION_CRITERIA;
  
  return (
    <Card className="p-6 mb-6 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          {phaseType === 'problem' ? (
            <Lightbulb className="h-5 w-5 text-validation-blue-500 mr-2" />
          ) : (
            <Beaker className="h-5 w-5 text-validation-green-500 mr-2" />
          )}
          <h3 className="text-lg font-medium">
            {phaseType === 'problem' ? 'Problem Hypothesis Templates' : 'Solution Hypothesis Templates'}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setShowTemplates(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-validation-gray-700 mb-2">Hypothesis Statements</h4>
        <div className="space-y-2">
          {hypothesisTemplates.map((template, i) => (
            <div 
              key={i} 
              className="p-3 bg-validation-gray-50 rounded-md border border-validation-gray-200 text-sm hover:bg-validation-gray-100 transition-colors cursor-pointer flex justify-between items-start"
              onClick={() => onSelectTemplate && onSelectTemplate(template)}
            >
              <p className="text-validation-gray-600">{template}</p>
              <Copy className="h-4 w-4 text-validation-gray-400 mt-1 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-validation-gray-700 mb-2">Success Criteria Examples</h4>
        <div className="space-y-2">
          {criteriaTemplates.map((template, i) => (
            <div 
              key={i} 
              className="p-3 bg-validation-gray-50 rounded-md border border-validation-gray-200 text-sm hover:bg-validation-gray-100 transition-colors cursor-pointer flex justify-between items-start"
              onClick={() => onSelectTemplate && onSelectTemplate(template)}
            >
              <p className="text-validation-gray-600">{template}</p>
              <Copy className="h-4 w-4 text-validation-gray-400 mt-1 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default HypothesisTemplates;
