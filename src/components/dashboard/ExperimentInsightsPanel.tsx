
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Beaker, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Experiment } from '@/types/database';

interface ExperimentInsightsPanelProps {
  projectId: string;
}

const ExperimentInsightsPanel = ({ projectId }: ExperimentInsightsPanelProps) => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (projectId) {
      fetchExperiments();
    }
  }, [projectId]);
  
  const fetchExperiments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      
      // Ensure metrics is always an array
      const processedData = data.map(exp => ({
        ...exp,
        metrics: Array.isArray(exp.metrics) ? exp.metrics : [exp.metrics]
      }));
      
      setExperiments(processedData as unknown as Experiment[]);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Beaker className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Experiment Insights</CardTitle>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate('/experiments')}
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <CardDescription>
          {experiments.length > 0 
            ? "Latest experiment results and insights"
            : "No experiments found"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : experiments.length > 0 ? (
          <div className="space-y-3">
            {experiments.map((experiment) => (
              <div 
                key={experiment.id} 
                className="p-3 rounded-md border hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{experiment.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    experiment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    experiment.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {experiment.status === 'completed' ? 'Completed' : 
                     experiment.status === 'in-progress' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-1 italic">"{experiment.hypothesis}"</p>
                
                {experiment.results && (
                  <div className="text-sm mt-2">
                    <span className="font-medium text-gray-700">Result:</span> {experiment.results}
                  </div>
                )}
                
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6"
                    onClick={() => navigate(`/experiments?id=${experiment.id}`)}
                  >
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Run experiments to validate your hypotheses</p>
            <Button 
              onClick={() => navigate('/experiments?create=true')}
              variant="outline"
              className="mx-auto"
            >
              Create Experiment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperimentInsightsPanel;
