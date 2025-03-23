
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Share2, 
  FileUp, 
  ArrowRight, 
  Lightbulb, 
  FlaskConical, 
  Layers, 
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  className?: string;
  variant?: 'default' | 'expanded';
}

const QuickActions = ({ className, variant = 'default' }: QuickActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, updateProjectStage } = useProject();

  const handleMoveNextStage = async () => {
    if (!currentProject) return;
    
    const stages = ['problem-validation', 'solution-validation', 'mvp', 'product-market-fit', 'scale', 'mature'];
    const currentIndex = stages.indexOf(currentProject.stage);
    
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      const updated = await updateProjectStage(currentProject.id, nextStage);
      
      if (updated) {
        try {
          await supabase
            .from('stages')
            .update({ status: 'complete' })
            .eq('id', currentProject.stage);
          
          await supabase
            .from('stages')
            .update({ status: 'in-progress' })
            .eq('id', nextStage);
          
          toast({
            title: "Project stage updated",
            description: `Moved to ${nextStage.replace('-', ' ')}`,
          });
        } catch (error) {
          console.error('Error updating stage statuses:', error);
        }
      }
    } else {
      toast({
        title: "Already at final stage",
        description: "Your project is already at the mature stage.",
      });
    }
  };

  if (!currentProject) return null;

  const actionItems = [
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: "Hypotheses",
      onClick: () => navigate('/hypotheses'),
      color: "bg-amber-100 text-amber-800 hover:bg-amber-200"
    },
    {
      icon: <FlaskConical className="h-4 w-4" />,
      label: "Experiments",
      onClick: () => navigate('/experiments'),
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200"
    },
    {
      icon: <Layers className="h-4 w-4" />,
      label: "MVP Features",
      onClick: () => navigate('/mvp'),
      color: "bg-purple-100 text-purple-800 hover:bg-purple-200"
    },
    {
      icon: <LineChart className="h-4 w-4" />,
      label: "Metrics",
      onClick: () => navigate('/metrics'),
      color: "bg-green-100 text-green-800 hover:bg-green-200"
    },
  ];

  const adminActions = [
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Edit Project",
      onClick: () => navigate('/settings'),
      variant: "outline" as const
    },
    {
      icon: <Share2 className="h-4 w-4" />,
      label: "Share",
      onClick: () => toast({ title: "Coming soon", description: "Sharing will be available in a future update." }),
      variant: "outline" as const
    },
    {
      icon: <FileUp className="h-4 w-4" />,
      label: "Export",
      onClick: () => toast({ title: "Coming soon", description: "Exporting will be available in a future update." }),
      variant: "outline" as const
    },
  ];

  if (variant === 'expanded') {
    return (
      <Card className={cn("p-4 bg-white border-t-4 border-t-blue-500", className)}>
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {actionItems.map((item, index) => (
                <Button 
                  key={index}
                  onClick={item.onClick}
                  className={cn("justify-start h-auto py-3", item.color)}
                  variant="ghost"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Project Management</h3>
            <div className="flex flex-wrap gap-2">
              {adminActions.map((action, index) => (
                <Button 
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.onClick}
                  className="flex items-center gap-1"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Button>
              ))}
              <Button 
                variant="default" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                onClick={handleMoveNextStage}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Move to Next Stage</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actionItems.map((item, index) => (
        <Button 
          key={index}
          onClick={item.onClick}
          size="sm"
          className={cn("flex items-center gap-1", item.color)}
          variant="ghost"
        >
          {item.icon}
          <span>{item.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
