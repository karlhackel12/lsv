import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, AlertCircle, Lightbulb, ArrowRight, Tag, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useExperimentInsights } from '@/hooks/ai/use-experiment-insights';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ExperimentInsightsPanelProps {
  projectId: string;
  experimentId?: string;
  refreshKey?: number;
  showDetailedView?: boolean;
  maxInsights?: number;
}

export function ExperimentInsightsPanel({
  projectId,
  experimentId,
  refreshKey,
  showDetailedView = false,
  maxInsights = 3
}: ExperimentInsightsPanelProps) {
  const { insights, isLoading, error } = useExperimentInsights({
    enabled: !!projectId,
    experimentId,
    refreshKey
  });
  
  // Show limited insights if not in detailed view
  const displayedInsights = showDetailedView 
    ? insights 
    : insights.slice(0, maxInsights);
  
  // Helper to render confidence badge
  const renderConfidenceBadge = (confidence: number) => {
    const color = 
      confidence >= 8 
        ? 'bg-green-100 text-green-800' 
        : confidence >= 5
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800';
    
    return (
      <Badge className={`${color}`}>
        Confidence: {confidence}/10
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load insights: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-xl">
            AI-Generated Insights
          </CardTitle>
        </div>
        <CardDescription>
          Smart analysis of your experiment results and learnings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-5/6 mb-4" />
                <Skeleton className="h-3 w-2/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : displayedInsights.length === 0 ? (
          // Empty state
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No insights yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Complete some experiments to get AI-powered insights
            </p>
          </div>
        ) : (
          // Insights list
          <div className="space-y-4">
            {displayedInsights.map((insight, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{insight.title}</h3>
                    {renderConfidenceBadge(insight.confidence)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {insight.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-1 pl-6 list-disc text-sm text-gray-600">
                        {insight.actionItems.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {showDetailedView && (
                      <>
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            Based on Experiments
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {insight.relatedExperiments.map((experiment, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {experiment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                            <Tag className="h-3.5 w-3.5 text-purple-600" />
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {insight.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs capitalize">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {!showDetailedView && insights.length > maxInsights && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => window.location.href = '/insights'}
          >
            View All Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 