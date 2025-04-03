import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, BarChart2, Book, Beaker, ArrowUpRight, Lightbulb, ArrowLeft, CheckCircle } from 'lucide-react';
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
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

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
  const [learningsInput, setLearningsInput] = useState(experiment.learnings || '');
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
      navigate('/problem-validation');
    } else {
      navigate('/solution-validation');
    }
  };

  const saveResults = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('experiments')
        .update({
          results: resultsInput,
          learnings: learningsInput,
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
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={onClose} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Experiments
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                {isGrowthExperiment ? 'Growth Experiment' : 'Experiment'}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-800">
            {experiment.title}
          </h2>
          <Badge variant={
            experiment.status === 'completed' ? 'default' :
            experiment.status === 'in-progress' ? 'secondary' : 'outline'
          } className="px-3 py-1 text-sm">
            {experiment.status === 'completed' ? 'Completed' : 
             experiment.status === 'in-progress' ? 'In Progress' : 'Planned'}
          </Badge>
        </div>
        
        <ExperimentProgressBar experiment={experiment} showLabels={true} />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Beaker className="h-5 w-5 text-blue-500 mr-2" />
                    Experiment Hypothesis
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
                    {experiment.hypothesis}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow mt-6">
            <CardContent className="p-6">
              <div className="space-y-6">
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
                      <h3 className="text-md font-semibold mb-2">Key Learnings</h3>
                      <Textarea 
                        value={learningsInput}
                        onChange={(e) => setLearningsInput(e.target.value)}
                        placeholder="What are the most important things you learned from this experiment?"
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
        
        <div className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <ExperimentStatusActions 
                  experiment={experiment} 
                  refreshData={handleRefresh} 
                  onEdit={onEdit} 
                  isGrowthExperiment={isGrowthExperiment}
                />
              </div>
              <ExperimentStatusIndicator 
                experiment={experiment}
                isGrowthExperiment={isGrowthExperiment}
                size="md"
              />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Validation Metrics</h3>
              {experiment.status === 'completed' ? (
                <div className="flex items-center p-3 bg-green-50 rounded-md border border-green-100">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">Experiment completed successfully</p>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-md">
                  <p className="text-gray-500">
                    {experiment.status === 'in-progress' 
                      ? 'Experiment is in progress. Results will be available when completed.' 
                      : 'Experiment not started yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={onEdit}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Edit Experiment
                </Button>
                
                {relatedHypothesis && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={navigateToHypothesis}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    View Related Hypothesis
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetailView;
