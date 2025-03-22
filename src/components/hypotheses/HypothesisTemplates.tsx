
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import Card from '@/components/Card';
import { TEMPLATE_VALUE_HYPOTHESES, TEMPLATE_GROWTH_HYPOTHESES } from '@/types/pivot';

interface HypothesisTemplatesProps {
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
}

const HypothesisTemplates = ({ showTemplates, setShowTemplates }: HypothesisTemplatesProps) => {
  return (
    <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
      <p className="text-validation-gray-600 text-lg mb-4">
        Track and validate key business assumptions using the Build-Measure-Learn cycle. Hypotheses should be specific, testable, and have clear success criteria.
      </p>
      <Button 
        variant="outline" 
        onClick={() => setShowTemplates(!showTemplates)}
        className="flex items-center"
      >
        <Lightbulb className="h-4 w-4 mr-2" />
        {showTemplates ? 'Hide Templates' : 'Show Templates'}
      </Button>
      
      {showTemplates && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Value Hypothesis Templates</h4>
            <ul className="space-y-2 text-sm">
              {TEMPLATE_VALUE_HYPOTHESES.map((template, index) => (
                <li key={index} className="p-2 bg-blue-50 rounded border border-blue-100">
                  {template}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Growth Hypothesis Templates</h4>
            <ul className="space-y-2 text-sm">
              {TEMPLATE_GROWTH_HYPOTHESES.map((template, index) => (
                <li key={index} className="p-2 bg-green-50 rounded border border-green-100">
                  {template}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HypothesisTemplates;
