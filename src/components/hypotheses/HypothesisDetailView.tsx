
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Lightbulb, FileText, CheckSquare, AlertTriangle, CalendarClock } from 'lucide-react';
import { Hypothesis, Experiment } from '@/types/database';
import StatusBadge from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import HypothesisConnectionsPanel from './HypothesisConnectionsPanel';
import { supabase } from '@/integrations/supabase/client';

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
  const [linkedExperiments, setLinkedExperiments] = useState<Experiment[]>([]);
  const [isLoadingExperiments, setIsLoadingExperiments] = useState(false);

  useEffect(() => {
    if (hypothesis && projectId) {
      fetchLinkedExperiments();
    }
  }, [hypothesis, projectId]);

  const fetchLinkedExperiments = async () => {
    if (!hypothesis || !projectId) return;
    
    try {
      setIsLoadingExperiments(true);
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('hypothesis_id', hypothesis.id)
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      setLinkedExperiments(data || []);
    } catch (err) {
      console.error('Error fetching linked experiments:', err);
    } finally {
      setIsLoadingExperiments(false);
    }
  };
  
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    fetchLinkedExperiments();
  };
  
  return (
    <div className="animate-fadeIn space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-validation-gray-900 mb-2">{hypothesis.statement}</h1>
          <div className="flex items-center space-x-3 text-sm text-validation-gray-500">
            <StatusBadge status={hypothesis.status} />
            <span className="flex items-center">
              <CalendarClock className="h-4 w-4 mr-1" />
              {new Date(hypothesis.updated_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {hypothesis.category || 'Value Hypothesis'}
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit} className="flex items-center">
          <Edit className="h-4 w-4 mr-2" />
          Edit Hypothesis
        </Button>
      </div>
      
      {/* Add the connections panel if we have projectId */}
      {projectId && (
        <HypothesisConnectionsPanel
          hypothesis={hypothesis}
          projectId={projectId}
          linkedExperiments={linkedExperiments}
          onRefresh={handleRefresh}
        />
      )}
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="evidence">Evidence & Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Hypothesis Statement</h2>
            <p className="text-validation-gray-700">{hypothesis.statement}</p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Success Criteria</h2>
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.criteria}</p>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Experiment Approach</h2>
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.experiment}</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="evidence" className="space-y-6 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Evidence</h2>
            {hypothesis.evidence ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.evidence}</p>
            ) : (
              <div className="flex items-center text-validation-gray-500">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                No evidence recorded yet
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            {hypothesis.result ? (
              <p className="text-validation-gray-700 whitespace-pre-line">{hypothesis.result}</p>
            ) : (
              <div className="flex items-center text-validation-gray-500">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                No results recorded yet
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HypothesisDetailView;
