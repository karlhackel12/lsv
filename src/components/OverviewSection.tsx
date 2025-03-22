
import React from 'react';
import { CheckCircle, Activity, Users, Lightbulb, Target, TrendingUp, Clock, Award, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import { Project } from '@/types/database';

interface Stage {
  id: string;
  name: string;
  complete: boolean;
  inProgress?: boolean;
  description: string;
}

interface OverviewSectionProps {
  project: Project;
  stages: Stage[];
}

const OverviewSection = ({ project, stages }: OverviewSectionProps) => {
  // Calculate project health score (simplified version)
  const healthScore = Math.min(100, Math.max(0, Math.floor(Math.random() * 100)));
  
  const getHealthColor = () => {
    if (healthScore >= 70) return 'text-validation-green-600 bg-validation-green-50 border-validation-green-200';
    if (healthScore >= 40) return 'text-validation-yellow-600 bg-validation-yellow-50 border-validation-yellow-200';
    return 'text-validation-red-600 bg-validation-red-50 border-validation-red-200';
  };
  
  const getHealthText = () => {
    if (healthScore >= 70) return 'Strong';
    if (healthScore >= 40) return 'Needs attention';
    return 'At risk';
  };
  
  const getHealthIcon = () => {
    if (healthScore >= 70) return <Award className="h-5 w-5" />;
    if (healthScore >= 40) return <Clock className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced Project Summary Card */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-validation-gray-900">Project Overview</h2>
        <Card className="animate-slideUpFade bg-gradient-to-br from-white to-validation-blue-50 border-t-4 border-t-validation-blue-600">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-validation-gray-900">{project.name}</CardTitle>
                <CardDescription className="text-validation-gray-600 text-base mt-1">
                  {project.description}
                </CardDescription>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getHealthColor()} flex items-center gap-2 whitespace-nowrap`}>
                {getHealthIcon()}
                <span className="font-medium">Project Health: {getHealthText()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Activity className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Current Stage</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-validation-gray-900 capitalize">{project.stage.replace('-', ' ')}</p>
                  <StatusBadge status={project.stage as any} />
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Lightbulb className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Validated Hypotheses</p>
                </div>
                <p className="font-semibold text-validation-gray-900">1 of 5 (20%)</p>
                <ProgressBar value={20} variant="info" size="sm" className="mt-2" />
              </div>
              
              <div className="p-4 bg-white rounded-lg shadow-sm border border-validation-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-validation-blue-100 rounded-full">
                    <Users className="h-5 w-5 text-validation-blue-600" />
                  </div>
                  <p className="font-semibold text-validation-gray-900">Key Focus</p>
                </div>
                <p className="font-semibold text-validation-gray-900">User Testing</p>
                <p className="text-sm text-validation-gray-600 mt-1">
                  Run experiments to validate core value proposition
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Lean Startup Progress Tracker */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-validation-gray-900">Lean Startup Progress</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-blue-600 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-yellow-400 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-validation-gray-200 rounded-full"></div>
              <span className="text-xs text-validation-gray-600">Not Started</span>
            </div>
          </div>
        </div>
        <Card className="animate-slideUpFade animate-delay-200">
          <CardContent className="pt-6">
            <div className="space-y-8">
              {stages.map((stage, index) => (
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
                      {index < stages.length - 1 && (
                        <div className={`h-12 w-0.5 ml-4 mt-1 ${
                          stage.complete ? 'bg-validation-blue-500' : 'bg-validation-gray-200'
                        }`}></div>
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

      {/* Enhanced Metric Cards with more visual appeal */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-validation-gray-900">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problem Interviews */}
          <Card className="animate-slideUpFade animate-delay-300 border-l-4 border-l-validation-blue-500 hover:shadow-md transition-shadow">
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
          <Card className="animate-slideUpFade animate-delay-400 border-l-4 border-l-validation-green-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-green-100 p-2 mr-3">
                    <Activity className="h-5 w-5 text-validation-green-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Daily Activity</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-green-600">68%</p>
                  <p className="text-sm text-validation-gray-500">Target: 65%</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Student completion rate</p>
                <ProgressBar value={68} variant="success" size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Active Teachers */}
          <Card className="animate-slideUpFade animate-delay-500 border-l-4 border-l-validation-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-purple-100 p-2 mr-3">
                    <Target className="h-5 w-5 text-validation-purple-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">User Base</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-purple-600">5</p>
                  <p className="text-sm text-validation-gray-500">Goal: 100</p>
                </div>
                <p className="text-sm mb-3 text-validation-gray-600">Active teachers (Year 1)</p>
                <ProgressBar value={5} max={100} variant="info" size="sm" />
              </div>
            </CardContent>
          </Card>
          
          {/* Validated Hypotheses */}
          <Card className="animate-slideUpFade animate-delay-500 border-l-4 border-l-validation-yellow-500 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full">
                <div className="mb-2 flex items-center">
                  <div className="rounded-full bg-validation-yellow-100 p-2 mr-3">
                    <Lightbulb className="h-5 w-5 text-validation-yellow-600" />
                  </div>
                  <h3 className="text-validation-gray-500 text-sm font-medium">Hypotheses</h3>
                </div>
                <div className="flex items-end justify-between mb-2 mt-2">
                  <p className="text-3xl font-bold text-validation-yellow-600">1/5</p>
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
