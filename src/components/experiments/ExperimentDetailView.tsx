
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, BarChart2, Book, Beaker, ArrowUpRight, Lightbulb } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ExperimentHeader from './detail/ExperimentHeader';
import ExperimentProgressBar from './detail/ExperimentProgressBar';
import ExperimentStatusIndicator from './detail/ExperimentStatusIndicator';
import ExperimentStatusActions from './ExperimentStatusActions';

interface ExperimentDetailViewProps {
  experiment: Experiment;
  onEdit: () => void;
  onClose?: () => void;
  relatedHypothesis: Hypothesis | null;
  onRefresh?: () => void;
  projectId?: string;
  isGrowthExperiment?: boolean;
}

const ExperimentDetailView: React.FC<ExperimentDetailViewProps> = ({
  experiment,
  onEdit,
  onClose,
  relatedHypothesis,
  onRefresh,
  projectId,
  isGrowthExperiment = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resultsInput, setResultsInput] = useState(experiment.results || '');
  const [insightsInput, setInsightsInput] = useState(experiment.insights || '');
  const [decisionsInput, setDecisionsInput] = useState(experiment.decisions || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  const navigateToHypothesis = () => {
    if (!relatedHypothesis) return;
    
    // Navigate to the correct validation page based on hypothesis phase
    if (relatedHypothesis.phase === 'problem') {
      navigate('/dashboard/problem-validation');
    } else {
      navigate('/dashboard/solution-validation');
    }
  };

  const saveResults = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('experiments')
        .update({
          results: resultsInput,
          insights: insightsInput,
          decisions: decisionsInput,
          updated_at: new Date().toISOString()
        })
        .eq('id', experiment.id);
        
      if (error) throw error;
      
      toast({
        title: 'Results saved',
        description: 'Your experiment results have been saved successfully.'
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error saving results:', err);
      toast({
        title: 'Error saving',
        description: 'There was a problem saving your changes.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-gray-50 border-b">
          <ExperimentHeader 
            experiment={experiment} 
            onEdit={onEdit} 
            hasRelatedHypothesis={!!relatedHypothesis}
            isGrowthExperiment={isGrowthExperiment}
          />
          <ExperimentProgressBar experiment={experiment} />
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <ExperimentStatusIndicator 
              experiment={experiment}
              isGrowthExperiment={isGrowthExperiment}
            />
            
            <ExperimentStatusActions 
              experiment={experiment} 
              refreshData={handleRefresh} 
              onEdit={onEdit} 
              isGrowthExperiment={isGrowthExperiment}
            />
          </div>
          
          {relatedHypothesis && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {relatedHypothesis.phase === 'problem' ? (
                    <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                  ) : (
                    <Beaker className="h-5 w-5 text-purple-500 mr-2" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-blue-700">
                      Linked to {relatedHypothesis.phase === 'problem' ? 'Problem' : 'Solution'} Hypothesis
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{relatedHypothesis.statement}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7 flex items-center bg-white"
                  onClick={navigateToHypothesis}
                >
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold">Experiment Overview</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Hypothesis</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                    {experiment.hypothesis}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Method</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {experiment.method}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Success Criteria</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {experiment.metrics}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center mb-4">
                <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold">Results & Insights</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Results</h3>
                  <Textarea 
                    value={resultsInput}
                    onChange={(e) => setResultsInput(e.target.value)}
                    placeholder="Record the results of your experiment..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Insights</h3>
                  <Textarea 
                    value={insightsInput}
                    onChange={(e) => setInsightsInput(e.target.value)}
                    placeholder="What insights did you gain from this experiment?"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Next Steps</h3>
                  <Textarea 
                    value={decisionsInput}
                    onChange={(e) => setDecisionsInput(e.target.value)}
                    placeholder="What decisions or next steps will you take based on this experiment?"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={saveResults}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Results'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExperimentDetailView;
