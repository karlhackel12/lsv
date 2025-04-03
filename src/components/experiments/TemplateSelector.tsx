import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExperimentTemplate } from '@/types/database';
import { Beaker, Lightbulb, FlaskConical, Layers, BadgeCheck } from 'lucide-react';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ExperimentTemplate[];
  onSelectTemplate: (template: ExperimentTemplate) => void;
  isLoading?: boolean;
}

const TemplateSelector = ({
  open,
  onOpenChange,
  templates,
  onSelectTemplate,
  isLoading = false
}: TemplateSelectorProps) => {
  // Get icon based on template category
  const getTemplateIcon = (category?: string) => {
    switch (category) {
      case 'problem':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'solution':
        return <FlaskConical className="h-5 w-5 text-purple-500" />;
      case 'mvp':
        return <Layers className="h-5 w-5 text-green-500" />;
      default:
        return <Beaker className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select an Experiment Template</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Choose a pre-defined template to get started quickly
          </p>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1 max-h-[70vh] overflow-y-auto">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getTemplateIcon(template.category)}
                      <CardTitle className="ml-2 text-lg">{template.name}</CardTitle>
                    </div>
                    {template.category && (
                      <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {template.category}
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Method:</span>
                      <p className="text-gray-600 text-sm mt-1">
                        {template.method}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector; 