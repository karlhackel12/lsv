import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, BarChart, AlertCircle, Lightbulb, PlusCircle, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useExperimentRecommendations } from '@/hooks/ai/use-experiment-recommendations';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RecommendedExperimentsPanelProps {
  projectId: string;
  stage?: string;
  onSelectRecommendation?: (recommendation: any) => void;
  showDetailedView?: boolean;
}

export function RecommendedExperimentsPanel({
  projectId,
  stage,
  onSelectRecommendation,
  showDetailedView = false
}: RecommendedExperimentsPanelProps) {
  const { recommendations, patterns, isLoading, error } = useExperimentRecommendations({
    enabled: !!projectId,
    stage
  });
  
  const navigate = useNavigate();
  
  // Show only top 3 recommendations if not in detailed view
  const displayedRecommendations = showDetailedView 
    ? recommendations 
    : recommendations.slice(0, 3);
  
  const handleCreateExperiment = (recommendation: any) => {
    if (onSelectRecommendation) {
      onSelectRecommendation(recommendation);
    } else {
      // Navigate to create experiment form with prefilled data
      navigate('/experiments?create=true', {
        state: {
          prefillData: {
            title: recommendation.title,
            description: recommendation.description,
            method: recommendation.method,
            hypothesis: recommendation.hypothesis,
            expected_outcome: recommendation.expectedOutcome,
            category: recommendation.category
          }
        }
      });
    }
  };
  
  // Helper to render difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    const color = 
      difficulty === 'easy' 
        ? 'bg-green-100 text-green-800' 
        : difficulty === 'medium'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800';
    
    return (
      <Badge className={`${color} capitalize`}>
        {difficulty}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load recommendations: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-xl">
              AI-Recommended Experiments
            </CardTitle>
          </div>
          
          {showDetailedView && (
            <Button 
              variant="outline"
              onClick={() => navigate('/experiments')}
              className="text-sm"
            >
              View All Experiments
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        <CardDescription>
          Smart suggestions based on your project context and validation stage
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
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : displayedRecommendations.length === 0 ? (
          // Empty state
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No recommendations yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Run more experiments to get AI-powered recommendations
            </p>
          </div>
        ) : (
          // Recommendations list
          <div className="space-y-4">
            {displayedRecommendations.map((recommendation, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{recommendation.title}</h3>
                    {renderDifficultyBadge(recommendation.difficulty)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Method</p>
                      <p className="text-sm font-medium">{recommendation.method}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-sm font-medium capitalize">{recommendation.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{recommendation.estimatedDuration}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs">
                        <span>Relevance</span>
                        <span>{recommendation.relevanceScore}/10</span>
                      </div>
                      <Progress 
                        value={recommendation.relevanceScore * 10} 
                        className="h-1.5 mt-1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleCreateExperiment(recommendation)}
                    className="w-full text-sm"
                    size="sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Experiment
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      
      {!showDetailedView && recommendations.length > 0 && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => navigate('/experiments?recommendations=true')}
          >
            View All Recommendations
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 