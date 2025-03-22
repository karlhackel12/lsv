
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { CheckSquare } from 'lucide-react';

interface Experiment {
  id: number;
  title: string;
  hypothesis: string;
  status: 'completed' | 'in-progress' | 'planned';
  method: string;
  metrics: string;
  results: string;
  insights: string;
  decisions: string;
}

interface ExperimentsSectionProps {
  experiments: Experiment[];
}

const ExperimentsSection = ({ experiments }: ExperimentsSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Experiment Tracking</h2>
        <button className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle">
          <CheckSquare className="h-4 w-4 mr-2" />
          Design New Experiment
        </button>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Design and track experiments to validate your hypotheses. Good experiments have a clear hypothesis, methodology, and success metrics.
        </p>
      </Card>

      <div className="space-y-6">
        {experiments.map((experiment, index) => (
          <Card 
            key={experiment.id} 
            className="p-6 animate-slideUpFade" 
            style={{ animationDelay: `${(index + 2) * 100}ms` }}
            hover={true}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-validation-gray-900">{experiment.title}</h3>
                <p className="text-validation-gray-600 italic mb-2">Testing: {experiment.hypothesis}</p>
              </div>
              <StatusBadge status={experiment.status} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Method</p>
                  <p className="text-validation-gray-700">{experiment.method}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Key Metrics</p>
                  <p className="text-validation-gray-700">{experiment.metrics}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Results</p>
                  <p className="text-validation-gray-700">
                    {experiment.results || 'No results yet'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Insights</p>
                  <p className="text-validation-gray-700">
                    {experiment.insights || 'No insights yet'}
                  </p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-validation-gray-500 mb-1">Decisions</p>
                  <p className="text-validation-gray-700">
                    {experiment.decisions || 'Pending experiment completion'}
                  </p>
                </div>
                
                {experiment.status === 'in-progress' && (
                  <button className="mt-2 bg-validation-yellow-500 hover:bg-validation-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-subtle">
                    Log Results
                  </button>
                )}
                
                {experiment.status === 'planned' && (
                  <button className="mt-2 bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-subtle">
                    Start Experiment
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExperimentsSection;
