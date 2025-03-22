
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { Lightbulb } from 'lucide-react';

interface Hypothesis {
  id: number;
  category: string;
  statement: string;
  experiment: string;
  criteria: string;
  status: 'validated' | 'validating' | 'not-started' | 'invalid';
  result: string;
  evidence: string;
}

interface HypothesesSectionProps {
  hypotheses: Hypothesis[];
}

const HypothesesSection = ({ hypotheses }: HypothesesSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Hypothesis Testing</h2>
        <button className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle">
          <Lightbulb className="h-4 w-4 mr-2" />
          Add New Hypothesis
        </button>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Track and validate key business assumptions using the Build-Measure-Learn cycle. Hypotheses should be specific, testable, and have clear success criteria.
        </p>
      </Card>

      <div className="space-y-6">
        {hypotheses.map((hypothesis, index) => (
          <Card 
            key={hypothesis.id} 
            className="p-6 animate-slideUpFade" 
            style={{ animationDelay: `${(index + 2) * 100}ms` }}
            hover={true}
          >
            <div className="flex justify-between mb-4">
              <span className={`text-xs font-semibold inline-block px-3 py-1 rounded-full ${
                hypothesis.category === 'value' 
                  ? 'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200' 
                  : 'bg-validation-gray-50 text-validation-gray-700 border border-validation-gray-200'
              }`}>
                {hypothesis.category === 'value' ? 'Value Hypothesis' : 'Growth Hypothesis'}
              </span>
              <StatusBadge status={hypothesis.status} />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-validation-gray-900">{hypothesis.statement}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Experiment</p>
                <p className="text-validation-gray-700 mb-4">{hypothesis.experiment}</p>
                
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Success Criteria</p>
                <p className="text-validation-gray-700">{hypothesis.criteria}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
                <p className="text-validation-gray-700 mb-4">
                  {hypothesis.result || 'No results yet'}
                </p>
                
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Evidence</p>
                <p className="text-validation-gray-700">
                  {hypothesis.evidence || 'No evidence collected yet'}
                </p>
              </div>
            </div>
            {(hypothesis.status === 'validating' || hypothesis.status === 'not-started') && (
              <div className="mt-6 flex justify-end gap-3">
                <button className="border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                  Update Results
                </button>
                <button className={`${
                  hypothesis.status === 'validating' 
                    ? 'bg-validation-yellow-500 hover:bg-validation-yellow-600' 
                    : 'bg-validation-blue-600 hover:bg-validation-blue-700'
                } text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-subtle`} 
                disabled={hypothesis.status !== 'validating'}>
                  {hypothesis.status === 'validating' ? 'Complete Validation' : 'Start Experiment'}
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HypothesesSection;
