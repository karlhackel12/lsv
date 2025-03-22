
import React from 'react';
import { CheckCircle, Activity, Users, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

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
  // Define default stages if none are provided
  const defaultStages: Stage[] = stages.length ? stages : [
    {
      id: '1',
      name: 'Problem Validation',
      description: 'Identify and validate the problem your solution addresses',
      complete: true,
      inProgress: false
    },
    {
      id: '2',
      name: 'Solution Validation',
      description: 'Test your proposed solution with potential users',
      complete: false,
      inProgress: true
    },
    {
      id: '3',
      name: 'MVP Development',
      description: 'Build a minimum viable product to test with users',
      complete: false,
      inProgress: false
    },
    {
      id: '4',
      name: 'User Acquisition',
      description: 'Acquire initial users and gather feedback',
      complete: false,
      inProgress: false
    },
    {
      id: '5',
      name: 'Business Model Validation',
      description: 'Validate your business model and revenue streams',
      complete: false,
      inProgress: false
    },
    {
      id: '6',
      name: 'Scale',
      description: 'Scale your solution to reach more users',
      complete: false,
      inProgress: false
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Project Summary Card */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-validation-gray-900">Project Overview</h2>
        <Card className="animate-slideUpFade">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-validation-gray-900">{project.name}</CardTitle>
            <CardDescription className="text-validation-gray-600 text-base">
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Current Stage</p>
                <p className="font-semibold text-validation-gray-900">{project.stage || 'Solution Validation'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-validation-gray-500 mb-1">Key Focus</p>
                <p className="font-semibold text-validation-gray-900">Testing core value proposition with users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Lean Startup Progress Tracker */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-validation-gray-900">Lean Startup Progress</h2>
        <Card className="animate-slideUpFade animate-delay-200">
          <CardContent className="pt-6">
            <div className="space-y-8">
              {defaultStages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      {stage.complete ? (
                        <div className="w-8 h-8 bg-validation-blue-500 rounded-full flex items-center justify-center shadow-subtle">
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
                      {index < defaultStages.length - 1 && (
                        <div className="h-12 w-0.5 bg-validation-gray-200 ml-4 mt-1"></div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-semibold text-lg ${
                        stage.complete ? 'text-validation-blue-600' : 
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
          </CardContent>
        </Card>
      </section>

      {/* Metric Cards */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-validation-gray-900">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problem Interviews */}
          <Card className="animate-slideUpFade animate-delay-300">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-blue-100 p-2 mr-3">
                    <Users className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Problem Interviews</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-blue-600">20</p>
                  <p className="text-sm text-validation-gray-500">Target: 20</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Teachers interviewed</p>
                <ProgressBar value={100} variant="success" size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Student Activity */}
          <Card className="animate-slideUpFade animate-delay-400">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-blue-100 p-2 mr-3">
                    <Activity className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Daily Activity</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-blue-600">68%</p>
                  <p className="text-sm text-validation-gray-500">Target: 65%</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Student completion rate</p>
                <ProgressBar value={68} variant="success" size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Active Teachers */}
          <Card className="animate-slideUpFade animate-delay-500">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-blue-100 p-2 mr-3">
                    <Target className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">User Base</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-blue-600">5</p>
                  <p className="text-sm text-validation-gray-500">Goal: 100</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Active teachers (Year 1)</p>
                <ProgressBar value={5} max={100} variant="info" size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Validated Hypotheses */}
          <Card className="animate-slideUpFade animate-delay-500">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-blue-100 p-2 mr-3">
                    <Lightbulb className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Hypotheses</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-blue-600">1/5</p>
                  <p className="text-sm text-validation-gray-500">20% validated</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Critical assumptions</p>
                <ProgressBar value={20} variant="warning" size="sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default OverviewSection;
