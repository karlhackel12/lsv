
import React from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { CheckCircle, Activity } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  complete: boolean;
  inProgress?: boolean;
  description: string;
}

interface OverviewSectionProps {
  project: {
    name: string;
    description: string;
    stage: string;
  };
  stages: Stage[];
}

const OverviewSection = ({ project, stages }: OverviewSectionProps) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-6 text-validation-gray-900">Project Overview</h2>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <h3 className="text-xl font-bold mb-3 text-validation-gray-900">{project.name}</h3>
        <p className="text-validation-gray-600 mb-6 text-lg leading-relaxed">{project.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Current Stage</p>
            <p className="font-semibold text-validation-gray-900">Solution Validation</p>
          </div>
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Key Focus</p>
            <p className="font-semibold text-validation-gray-900">Testing core value proposition with users</p>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Lean Startup Progress</h3>
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
        <div className="space-y-8">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {stage.complete ? (
                    <div className="w-8 h-8 bg-validation-green-500 rounded-full flex items-center justify-center shadow-subtle">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : stage.inProgress ? (
                    <div className="w-8 h-8 bg-validation-yellow-400 rounded-full flex items-center justify-center shadow-subtle">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-validation-gray-200 shadow-subtle">
                      <span className="text-validation-gray-600 font-medium">{index + 1}</span>
                    </div>
                  )}
                  {index < stages.length - 1 && (
                    <div className="h-12 w-0.5 bg-validation-gray-200 ml-4 mt-1"></div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className={`font-semibold text-lg ${
                    stage.complete ? 'text-validation-gray-500' : 
                    stage.inProgress ? 'text-validation-yellow-700' : 
                    'text-validation-gray-400'
                  }`}>
                    {stage.name}
                  </h4>
                  <p className="text-sm text-validation-gray-500 mt-1 mb-2">{stage.description}</p>
                  <StatusBadge status={stage.complete ? "completed" : stage.inProgress ? "in-progress" : "not-started"} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Key Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-5 animate-slideUpFade animate-delay-300">
          <p className="text-validation-gray-500 text-sm mb-1">Problem Interviews</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-validation-gray-900">20</p>
            <p className="text-sm text-validation-gray-500">Target: 20</p>
          </div>
          <p className="text-sm mb-3 text-validation-gray-600">Teachers interviewed</p>
          <ProgressBar value={100} variant="success" size="sm" />
        </Card>
        
        <Card className="p-5 animate-slideUpFade animate-delay-400">
          <p className="text-validation-gray-500 text-sm mb-1">Daily Student Activity</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-validation-gray-900">68%</p>
            <p className="text-sm text-validation-gray-500">Target: 65%</p>
          </div>
          <p className="text-sm mb-3 text-validation-gray-600">Completion rate</p>
          <ProgressBar value={68} variant="success" size="sm" />
        </Card>
        
        <Card className="p-5 animate-slideUpFade animate-delay-500">
          <p className="text-validation-gray-500 text-sm mb-1">User Base</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-validation-gray-900">5</p>
            <p className="text-sm text-validation-gray-500">Goal: 100</p>
          </div>
          <p className="text-sm mb-3 text-validation-gray-600">Active teachers (Year 1)</p>
          <ProgressBar value={5} max={100} variant="info" size="sm" />
        </Card>
        
        <Card className="p-5 animate-slideUpFade animate-delay-500">
          <p className="text-validation-gray-500 text-sm mb-1">Validated Hypotheses</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-validation-gray-900">1/5</p>
            <p className="text-sm text-validation-gray-500">20% complete</p>
          </div>
          <p className="text-sm mb-3 text-validation-gray-600">Critical assumptions</p>
          <ProgressBar value={20} variant="warning" size="sm" />
        </Card>
      </div>
    </div>
  );
};

export default OverviewSection;
