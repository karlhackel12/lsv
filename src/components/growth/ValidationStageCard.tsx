
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, Circle, Plus, Lightbulb } from 'lucide-react';
import { GrowthModel } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ValidationStage {
  id: string;
  title: string;
  description: string;
  criteria: string[];
}

interface ValidationStageCardProps {
  stage: ValidationStage;
  model: GrowthModel;
  projectId: string;
}

// This would be stored in database in the full implementation
const getStageStatus = (stageId: string, model: GrowthModel): 'not-started' | 'in-progress' | 'validated' | 'failed' => {
  // This is a placeholder - in a real implementation, this would be stored in the database
  const stageMapping: Record<string, number> = {
    'channel': 0,
    'activation': 1,
    'monetization': 2,
    'retention': 3,
    'referral': 4,
    'scaling': 5
  };
  
  // For demo, we'll consider stages as a progression
  const stageIndex = stageMapping[stageId];
  const modelIndex = model.framework === 'aarrr' ? 3 : 1; // Just a placeholder to simulate progress
  
  if (stageIndex < modelIndex - 1) return 'validated';
  if (stageIndex === modelIndex - 1) return 'in-progress';
  if (stageIndex === modelIndex) return 'in-progress';
  return 'not-started';
};

const ValidationStageCard: React.FC<ValidationStageCardProps> = ({ stage, model, projectId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'validated' | 'failed'>(
    getStageStatus(stage.id, model)
  );
  const [completion, setCompletion] = useState(0);
  const [hypothesesCount, setHypothesesCount] = useState(0);
  const [experimentsCount, setExperimentsCount] = useState(0);
  
  useEffect(() => {
    fetchStageData();
  }, [stage.id, model.id]);
  
  const fetchStageData = async () => {
    try {
      // Get count of hypotheses for this stage
      const { data: hypothesesData, error: hypothesesError } = await supabase
        .from('growth_hypotheses')
        .select('id')
        .eq('growth_model_id', model.id)
        .eq('stage', stage.id);
        
      if (!hypothesesError) {
        setHypothesesCount(hypothesesData.length);
        
        // Use hypotheses count to help determine completion percentage
        const calculatedCompletion = Math.min(
          Math.round((hypothesesData.length / 2) * 30) + // Up to 30% for having hypotheses
          (status === 'in-progress' ? 30 : 0) + // 30% for being in progress
          (status === 'validated' ? 70 : 0), // 70% for being validated
          100
        );
        
        setCompletion(calculatedCompletion);
      }
      
      // Calculate experiments (future enhancement)
      // This would get experiments linked to the hypotheses above
      
    } catch (error) {
      console.error("Error fetching stage data:", error);
    }
  };
  
  const handleUpdateStatus = async (newStatus: 'not-started' | 'in-progress' | 'validated' | 'failed') => {
    // In a full implementation, this would update the database
    toast({
      title: 'Status Updated',
      description: `Stage "${stage.title}" marked as ${newStatus}.`,
    });
    
    setStatus(newStatus);
    
    // Update completion percentage
    const newCompletion = newStatus === 'validated' ? 100 :
                          newStatus === 'in-progress' ? Math.max(30, completion) :
                          completion;
    setCompletion(newCompletion);
  };
  
  const handleCreateHypothesis = () => {
    navigate('/growth', { 
      state: { 
        tab: 'hypotheses',
        stageId: stage.id
      } 
    });
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-500">Validated</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{stage.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Completion</span>
            <span className="font-medium">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>
        
        <div className="flex justify-between text-xs mb-2">
          <span className="flex items-center">
            <Lightbulb className="h-3.5 w-3.5 mr-1 text-amber-500" />
            {hypothesesCount} Hypotheses
          </span>
          {experimentsCount > 0 && (
            <span className="text-blue-600">{experimentsCount} Experiments</span>
          )}
        </div>
        
        <h4 className="text-sm font-medium mb-2">Validation Criteria:</h4>
        <ul className="text-xs space-y-1 mb-3">
          {stage.criteria.map((criterion, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 mt-0.5">
                {completion > (index + 1) * (100 / stage.criteria.length) ? 
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
                  <Circle className="h-3.5 w-3.5 text-gray-300" />
                }
              </span>
              <span className="text-gray-600">{criterion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleCreateHypothesis}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Hypothesis
        </Button>
        
        {status !== 'in-progress' && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleUpdateStatus('in-progress')}
          >
            Start
          </Button>
        )}
        {status === 'in-progress' && (
          <Button 
            size="sm" 
            variant="outline"
            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            onClick={() => handleUpdateStatus('validated')}
          >
            Mark Validated
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ValidationStageCard;
