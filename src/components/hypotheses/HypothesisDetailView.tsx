
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Edit, ArrowRight, FileText, CalendarClock, BarChart2, Lightbulb, Beaker, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Hypothesis, Experiment } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface HypothesisDetailViewProps {
  hypothesis: Hypothesis;
  onEdit: () => void;
  onClose?: () => void;
  onRefresh?: () => void;
  projectId?: string;
}

const HypothesisDetailView: React.FC<HypothesisDetailViewProps> = ({
  hypothesis,
  onEdit,
  onClose,
  onRefresh,
  projectId
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [linkedExperiments, setLinkedExperiments] = useState<Experiment[]>([]);
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(false);
  const [evidenceInput, setEvidenceInput] = useState(hypothesis.evidence || '');
  const [resultInput, setResultInput] = useState(hypothesis.result || '');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (hypothesis && hypothesis.id) {
      fetchLinkedExperiments();
    }
  }, [hypothesis]);

  useEffect(() => {
    setEvidenceInput(hypothesis.evidence || '');
    setResultInput(hypothesis.result || '');
  }, [hypothesis.evidence, hypothesis.result]);
  
  const fetchLinkedExperiments = async () => {
    try {
      setIsLoadingExperiments(true);
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('hypothesis_id', hypothesis.originalId || hypothesis.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setLinkedExperiments(data || []);
    } catch (err) {
      console.error('Error fetching linked experiments:', err);
    } finally {
      setIsLoadingExperiments(false);
    }
  };
  
  const handleCreateExperiment = () => {
    navigate('/experiments', { 
      state: { 
        createNew: true, 
        hypothesisId: hypothesis.id 
      }
    });
  };
  
  const navigateToExperiment = (experimentId: string) => {
    navigate('/experiments', {
      state: {
        experimentId
      }
    });
  };
  
  const getHypothesisStatusIcon = (status: string) => {
    switch(status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'validating':
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };

  const saveResults = async () => {
    if (!hypothesis || !hypothesis.id) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('hypotheses')
        .update({
          evidence: evidenceInput,
          result: resultInput,
          updated_at: new Date().toISOString()
        })
        .eq('id', hypothesis.originalId || hypothesis.id);
        
      if (error) throw error;
      
      toast({
        title: 'Results saved',
        description: 'Your evidence and results have been saved successfully.'
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
    <div className="animate-fadeIn">
      <Card className="shadow-md border-t-4 border-t-blue-500">
        <CardHeader className="pb-2 pt-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-blue-50">
                {hypothesis.phase === 'problem' 
                  ? <Lightbulb className="h-6 w-6 text-blue-500" />
                  : <Beaker className="h-6 w-6 text-purple-500" />
                }
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{hypothesis.statement}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <StatusBadge status={hypothesis.status} />
                  <span className="flex items-center text-gray-500">
                    <CalendarClock className="h-4 w-4 mr-1" />
                    {new Date(hypothesis.updated_at).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {hypothesis.category || 'Value Hypothesis'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleCreateExperiment} className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Run Experiment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-md font-semibold mb-2 flex items-center text-gray-700">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Hypothesis Statement
              </h2>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                {hypothesis.statement}
              </p>
              
              <h2 className="text-md font-semibold mt-4 mb-2 flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                Success Criteria
              </h2>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-line">
                {hypothesis.criteria}
              </p>
            </div>
            
            <div>
              <h2 className="text-md font-semibold mb-2 flex items-center text-gray-700">
                <Beaker className="h-4 w-4 mr-2 text-purple-500" />
                Experiment Approach
              </h2>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-line">
                {hypothesis.experiment}
              </p>
              
              <div className="mt-4">
                <h2 className="text-md font-semibold mb-2 flex items-center text-gray-700">
                  <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                  Status
                </h2>
                <div className="flex items-center p-3 rounded-md border bg-gray-50">
                  {getHypothesisStatusIcon(hypothesis.status as string)}
                  <span className="ml-2 font-medium capitalize">{hypothesis.status}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
            Results & Evidence
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-md font-semibold mb-2 text-gray-700">Evidence</h3>
              <Textarea 
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Add evidence that supports or refutes your hypothesis..."
                className="min-h-[120px]"
              />
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2 text-gray-700">Results</h3>
              <Textarea 
                value={resultInput}
                onChange={(e) => setResultInput(e.target.value)}
                placeholder="Summarize the results of your experiments..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <Button 
              onClick={saveResults} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Results'}
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Beaker className="h-5 w-5 text-blue-500 mr-2" />
                Linked Experiments
              </h2>
              <Button 
                variant="outline" 
                onClick={handleCreateExperiment} 
                size="sm"
                className="flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </div>
            
            {isLoadingExperiments ? (
              <p className="text-gray-500 text-center py-4">Loading experiments...</p>
            ) : linkedExperiments.length > 0 ? (
              <div className="space-y-3">
                {linkedExperiments.map(experiment => (
                  <div 
                    key={experiment.id} 
                    className="border rounded-md p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigateToExperiment(experiment.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{experiment.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={experiment.status} />
                          <span className="text-sm text-gray-500">
                            Updated: {new Date(experiment.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${experiment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                           experiment.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                           'bg-amber-50 text-amber-700 border-amber-200'}
                        `}
                      >
                        {experiment.status === 'completed' ? 'Completed' : 
                         experiment.status === 'in-progress' ? 'In Progress' : 
                         'Planned'}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {experiment.hypothesis}
                    </p>
                    
                    {experiment.results && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <span className="text-xs font-medium text-blue-700 flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" /> 
                          Results available
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-md">
                <Beaker className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 mb-4">No experiments linked to this hypothesis yet</p>
                <Button 
                  variant="outline" 
                  onClick={handleCreateExperiment}
                  className="flex items-center mx-auto"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Create First Experiment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HypothesisDetailView;
