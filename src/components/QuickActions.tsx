
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Beaker, FileText, Lightbulb, TrendingUp } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const navigate = useNavigate();
  const { currentProject, updateProjectStage } = useProject();
  const { toast } = useToast();
  
  const handleStageChange = async (stage: string, path: string) => {
    if (!currentProject) {
      toast({
        title: 'No Project Selected',
        description: 'Please select a project first',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await updateProjectStage(stage);
      
      toast({
        title: 'Stage Updated',
        description: `Moved to ${stage} stage`,
      });
      
      navigate(path);
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-between" onClick={() => handleStageChange('problem', '/problem-validation')}>
          <div className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Validate Problem
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" className="w-full justify-between" onClick={() => handleStageChange('solution', '/solution-validation')}>
          <div className="flex items-center">
            <Beaker className="h-4 w-4 mr-2" />
            Test Solutions
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" className="w-full justify-between" onClick={() => handleStageChange('mvp', '/mvp')}>
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Define MVP
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" className="w-full justify-between" onClick={() => handleStageChange('growth', '/growth')}>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Growth Experiments
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
