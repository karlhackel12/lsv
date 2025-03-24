import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Beaker, Calendar, CheckCircle, FileText, PlusCircle } from 'lucide-react';
import { Experiment } from '@/types/database';

interface ExperimentsSummarySectionProps {
  experiments: Experiment[];
  projectId: string;
}

const ExperimentsSummarySection = ({ experiments, projectId }: ExperimentsSummarySectionProps) => {
  const navigate = useNavigate();
  
  // Count experiments by category and status
  const experimentCounts = {
    problem: experiments.filter(e => e.category === 'problem').length,
    solution: experiments.filter(e => e.category === 'solution').length,
    'business-model': experiments.filter(e => e.category === 'business-model').length,
    planned: experiments.filter(e => e.status === 'planned').length,
    'in-progress': experiments.filter(e => e.status === 'in-progress').length,
    completed: experiments.filter(e => e.status === 'completed').length,
  };

  // Get last 3 recently updated experiments
  const recentExperiments = [...experiments]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // Navigate to experiment list with specific filter
  const navigateToExperiments = (phase?: string, status?: string) => {
    // Create params object
    const params = new URLSearchParams();
    
    // Set the current phase if provided, otherwise use the default from the parent component
    if (phase) {
      params.set('phase', phase);
    } else {
      // If no phase specified, use 'problem' as default to ensure we go to a list view
      params.set('phase', 'problem');
    }
    
    // Add status filter if provided
    if (status) {
      params.set('status', status);
    }
    
    // Force summary mode to false to ensure we get the list view
    params.set('view', 'list');
    
    // Navigate to the experiments page with our parameters
    navigate(`/experiments?${params.toString()}`);
  };

  // Navigate to create new experiment
  const navigateToCreate = (phase: string) => {
    navigate(`/experiments?phase=${phase}&create=true`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Beaker className="h-5 w-5 mr-2 text-blue-500" />
              All Experiments
            </CardTitle>
            <CardDescription>
              {experiments.length} total experiments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">Problem validation:</span>
                <Badge variant="outline" className="bg-blue-50">{experimentCounts.problem}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">Solution validation:</span>
                <Badge variant="outline" className="bg-blue-50">{experimentCounts.solution}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">Business model:</span>
                <Badge variant="outline" className="bg-blue-50">{experimentCounts['business-model']}</Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => navigateToExperiments()}
              >
                View All Experiments <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-amber-500" />
              By Status
            </CardTitle>
            <CardDescription>
              Filter experiments by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">Planned:</span>
                <Badge variant="outline" className="bg-gray-50">{experimentCounts.planned}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">In progress:</span>
                <Badge variant="outline" className="bg-blue-50">{experimentCounts['in-progress']}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-validation-gray-600">Completed:</span>
                <Badge variant="outline" className="bg-green-50">{experimentCounts.completed}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => navigateToExperiments(undefined, 'planned')}>
                  Planned
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigateToExperiments(undefined, 'in-progress')}>
                  Running
                </Button>
                <Button size="sm" variant="outline" onClick={() => navigateToExperiments(undefined, 'completed')}>
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PlusCircle className="h-5 w-5 mr-2 text-green-500" />
              Create New
            </CardTitle>
            <CardDescription>
              Start a new experiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateToCreate('problem')}
              >
                <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                Problem Experiment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateToCreate('solution')}
              >
                <Beaker className="h-4 w-4 mr-2 text-purple-500" />
                Solution Experiment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigateToCreate('business-model')}
              >
                <Beaker className="h-4 w-4 mr-2 text-amber-500" />
                Business Model Experiment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {recentExperiments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Recent Experiments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentExperiments.map(experiment => (
              <Card key={experiment.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge className={`
                      ${experiment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        experiment.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {experiment.status === 'in-progress' ? 'Running' : 
                        experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)
                      }
                    </Badge>
                    <Badge variant="outline">{experiment.category}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-1">{experiment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-validation-gray-600 line-clamp-2 mb-3">
                    {experiment.hypothesis}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/experiments?id=${experiment.id}&phase=${experiment.category}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentsSummarySection;
