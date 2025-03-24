
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, ArrowRight, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Recommendation {
  id: string;
  type: 'experiment' | 'feature' | 'metric' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'implemented' | 'dismissed';
  source_id: string | null;
  target_id: string | null;
  created_at: string;
}

interface ScalingRecommendationsPanelProps {
  projectId: string;
  refreshData?: () => Promise<void>;
}

const PRIORITY_COLORS = {
  'high': 'bg-red-100 text-red-800 border-red-200',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'low': 'bg-blue-100 text-blue-800 border-blue-200'
};

const TYPE_LABELS = {
  'experiment': 'Experiment',
  'feature': 'Feature',
  'metric': 'Metric',
  'general': 'General'
};

const ScalingRecommendationsPanel: React.FC<ScalingRecommendationsPanelProps> = ({ 
  projectId,
  refreshData
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchRecommendations();
    }
  }, [projectId]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('scaling_recommendations')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setRecommendations(data as Recommendation[]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scaling recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'implemented' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('scaling_recommendations')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === id ? { ...rec, status: newStatus } : rec
        )
      );
      
      toast({
        title: 'Success',
        description: `Recommendation marked as ${newStatus}`,
      });
      
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recommendation status',
        variant: 'destructive',
      });
    }
  };

  const generateRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // This would normally be an edge function call to run a more complex algorithm
      // For now, we'll just create a simple recommendation based on existing data
      
      // Get metrics that need improvement
      const { data: scalingMetrics, error: metricsError } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .lt('current_value', 'target_value')
        .order('importance', { ascending: false })
        .limit(3);
        
      if (metricsError) throw metricsError;
      
      if (scalingMetrics && scalingMetrics.length > 0) {
        // Create recommendations based on metrics that need improvement
        const recommendations = scalingMetrics.map(metric => ({
          project_id: projectId,
          type: 'experiment' as const,
          title: `Run experiment to improve ${metric.name}`,
          description: `The ${metric.name} metric is currently below target (${metric.current_value}/${metric.target_value} ${metric.unit}). Consider running experiments to improve this key scaling metric.`,
          priority: metric.importance > 2 ? 'high' as const : 'medium' as const,
          target_id: metric.id,
          status: 'active' as const
        }));
        
        // Insert new recommendations
        const { error: insertError } = await supabase
          .from('scaling_recommendations')
          .insert(recommendations);
          
        if (insertError) throw insertError;
        
        toast({
          title: 'Success',
          description: 'Generated new scaling recommendations',
        });
        
        // Refresh the recommendations list
        fetchRecommendations();
      } else {
        toast({
          title: 'No new recommendations',
          description: 'All scaling metrics are on track or no metrics found',
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecommendations = activeTab === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.status === activeTab);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Scaling Recommendations
            </CardTitle>
            <CardDescription>
              Suggestions to improve your scaling readiness
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateRecommendations}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Generate Recommendations
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="implemented">Implemented</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : filteredRecommendations.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-500">No recommendations found</p>
                {activeTab === 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={generateRecommendations}
                    disabled={isLoading}
                  >
                    Generate Recommendations
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecommendations.map(recommendation => (
                  <div 
                    key={recommendation.id} 
                    className={`border rounded-md p-4 ${recommendation.status !== 'active' ? 'opacity-75' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-1">
                          <Badge className={PRIORITY_COLORS[recommendation.priority]}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">
                            {TYPE_LABELS[recommendation.type]}
                          </Badge>
                          {recommendation.status !== 'active' && (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              {recommendation.status}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium mb-1">{recommendation.title}</h4>
                        <p className="text-sm text-gray-600">{recommendation.description}</p>
                      </div>
                      
                      {recommendation.status === 'active' && (
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-green-600 border-green-200 hover:border-green-300 hover:bg-green-50"
                            onClick={() => handleStatusChange(recommendation.id, 'implemented')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span>Implement</span>
                          </Button>
                          <Button
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-gray-500 border-gray-200 hover:border-gray-300"
                            onClick={() => handleStatusChange(recommendation.id, 'dismissed')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            <span>Dismiss</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScalingRecommendationsPanel;
