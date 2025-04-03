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
import { adaptExperiments } from '@/utils/experiment-adapter';

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
  const [relatedExperiments, setRelatedExperiments] = useState<Experiment[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);

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
  
  useEffect(() => {
    const fetchRelatedExperiments = async () => {
      try {
        if (!hypothesis || !projectId) return;
        
        const { data, error } = await supabase
          .from('experiments')
          .select('*')
          .eq('project_id', projectId)
          .eq('hypothesis_id', hypothesis.id);
          
        if (error) {
          console.error('Error fetching related experiments:', error);
          return;
        }
        
        const typedData = data?.map(item => ({
          ...item,
          metrics: Array.isArray(item.metrics) ? item.metrics : [item.metrics || ''],
          insights: item.insights || '',
          decisions: item.decisions || '',
          hypothesis_id: item.hypothesis_id || null
        })) as Experiment[];
        
        setRelatedExperiments(typedData || []);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    
    fetchRelatedExperiments();
  }, [hypothesis, projectId]);
  
  const fetchExperiments = async () => {
    try {
      setIsLoadingExperiments(true);
      
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('hypothesis_id', hypothesis.id);
        
      if (error) throw error;
      
      setExperiments(adaptExperiments(data));
    } catch (err) {
      console.error('Error fetching related experiments:', err);
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
  
  const getValidationProgress = () => {
    switch(hypothesis.status) {
      case 'validated':
        return 100;
      case 'invalid':
        return 100;
      case 'validating':
        return 75;
      default:
        return 25;
    }
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-800">
            {hypothesis.phase === 'problem' ? 'Problem Hypothesis' : 'Solution Hypothesis'}
          </h2>
          <StatusBadge 
            status={hypothesis.status as any} 
            className="px-3 py-1 text-sm" 
          />
        </div>
        
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="h-4 bg-blue-600 rounded-full"
              style={{ width: `${getValidationProgress()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Not Started</span>
            <span>Validating</span>
            <span>Validated</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 text-blue-500 mr-2" />
                    Hypothesis Statement
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100">
                    {hypothesis.statement}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Success Criteria
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-line">
                      {hypothesis.criteria}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold mb-2 flex items-center">
                      <Beaker className="h-4 w-4 mr-2 text-purple-500" />
                      Experiment Approach
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 whitespace-pre-line">
                      {hypothesis.experiment}
                    </p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
                    Results & Evidence
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-semibold mb-2 text-gray-700">Evidence</h4>
                      <Textarea 
                        value={evidenceInput}
                        onChange={(e) => setEvidenceInput(e.target.value)}
                        placeholder="Add evidence that supports or refutes your hypothesis..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold mb-2 text-gray-700">Results</h4>
                      <Textarea 
                        value={resultInput}
                        onChange={(e) => setResultInput(e.target.value)}
                        placeholder="Summarize the results of your experiments..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={saveResults} 
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? 'Saving...' : 'Save Results'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow mt-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <Beaker className="h-5 w-5 text-blue-500 mr-2" />
                  Linked Experiments
                </h3>
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
                            <StatusBadge status={experiment.status as any} />
                            <span className="text-sm text-gray-500">
                              Updated: {new Date(experiment.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            experiment.status === 'completed' ? 'default' :
                            experiment.status === 'in-progress' ? 'secondary' : 'outline'
                          }
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
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="flex items-center p-3 rounded-md border bg-gray-50">
                {getHypothesisStatusIcon(hypothesis.status as string)}
                <span className="ml-2 font-medium capitalize">{hypothesis.status}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Category</span>
                  <p className="font-medium">{hypothesis.category || 'Value Hypothesis'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phase</span>
                  <p className="font-medium capitalize">{hypothesis.phase} Validation</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <p className="font-medium">
                    {new Date(hypothesis.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
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
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Hypothesis
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleCreateExperiment}
                >
                  <Beaker className="h-4 w-4 mr-2" />
                  Run Experiment
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Validation Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-600">Evidence Collected</p>
                    <span>{evidenceInput ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: evidenceInput ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-gray-600">Experiments Linked</p>
                    <span>{linkedExperiments.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: linkedExperiments.length > 0 ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HypothesisDetailView;
