import React, { useState } from 'react';
import { useSmartTemplates } from '@/hooks/ai/use-smart-templates';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Sparkles, 
  AlertCircle, 
  FileCode, 
  Lightbulb, 
  ClipboardCopy, 
  Copy, 
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartTemplatesPanelProps {
  templateType: 'experiment' | 'hypothesis' | 'metric' | 'mvp-feature' | 'pivot-option';
  projectId: string;
  stage?: string;
  onSelectTemplate?: (template: any) => void;
  specificFocus?: string;
  additionalContext?: Record<string, any>;
}

export function SmartTemplatesPanel({
  templateType,
  projectId,
  stage,
  onSelectTemplate,
  specificFocus,
  additionalContext = {}
}: SmartTemplatesPanelProps) {
  const [activeTab, setActiveTab] = useState('0');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Create context object for the templates request
  const templateContext = {
    specificFocus,
    ...additionalContext
  };

  const { templates, suggestedFields, adaptationReasoning, isLoading, error } = useSmartTemplates({
    templateType,
    enabled: !!projectId,
    stage,
    context: templateContext
  });

  // Determine the title based on template type
  const getTitleByType = () => {
    switch (templateType) {
      case 'experiment': return 'Experiment Templates';
      case 'hypothesis': return 'Hypothesis Templates';
      case 'metric': return 'Metric Templates';
      case 'mvp-feature': return 'MVP Feature Templates';
      case 'pivot-option': return 'Pivot Option Templates';
      default: return 'Smart Templates';
    }
  };

  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // Handle template copying
  const handleCopyTemplate = (template: any, index: number) => {
    // Copy the template data to clipboard as JSON
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    
    // Show copied indicator
    setCopiedTemplate(`${index}`);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load templates: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-xl">
            AI-Powered {getTitleByType()}
          </CardTitle>
        </div>
        <CardDescription>
          Smart templates tailored to your project context
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : templates.length === 0 ? (
          // Empty state
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No templates available</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add more project context to generate smart templates
            </p>
          </div>
        ) : (
          // Templates tabs
          <>
            {adaptationReasoning && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>How these templates were adapted</AlertTitle>
                <AlertDescription className="text-sm">
                  {adaptationReasoning}
                </AlertDescription>
              </Alert>
            )}
          
            <Tabs defaultValue="0" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-4">
                {templates.map((_, index) => (
                  <TabsTrigger key={index} value={`${index}`}>
                    Template {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {templates.map((template, index) => (
                <TabsContent key={index} value={`${index}`} className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">
                          {getTemplateTitle(template, templateType)}
                        </CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleCopyTemplate(template, index)}
                              >
                                {copiedTemplate === `${index}` ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedTemplate === `${index}` ? 'Copied!' : 'Copy template'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderTemplateContent(template, templateType)}
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get the title based on template type
function getTemplateTitle(template: any, templateType: string): string {
  switch (templateType) {
    case 'experiment': return template.title || 'Experiment Template';
    case 'hypothesis': return template.statement?.substring(0, 50) + '...' || 'Hypothesis Template';
    case 'metric': return template.name || 'Metric Template';
    case 'mvp-feature': return template.name || 'MVP Feature Template';
    case 'pivot-option': return template.type || 'Pivot Option Template';
    default: return 'Template';
  }
}

// Helper function to render template content based on type
function renderTemplateContent(template: any, templateType: string) {
  switch (templateType) {
    case 'experiment':
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{template.description}</p>
          <Separator />
          <div>
            <p className="text-xs text-gray-500">Method</p>
            <p className="font-medium">{template.method}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Hypothesis</p>
            <p className="text-sm">{template.hypothesis}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Success Criteria</p>
            <p className="text-sm">{template.successCriteria}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Duration:</span> {template.estimatedDuration}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Difficulty:</span> 
              <span className="capitalize">{template.difficulty}</span>
            </span>
          </div>
        </div>
      );
      
    case 'hypothesis':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Statement</p>
            <p className="text-sm font-medium">{template.statement}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Validation Criteria</p>
            <p className="text-sm">{template.criteria}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Experiment Approach</p>
            <p className="text-sm">{template.experiment}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Category:</span> 
              <span className="capitalize">{template.category}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Phase:</span> 
              <span className="capitalize">{template.phase}</span>
            </span>
          </div>
        </div>
      );
      
    case 'metric':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm">{template.description}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium capitalize">{template.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-sm font-medium">{template.target}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Unit</p>
            <p className="text-sm">{template.unit}</p>
          </div>
        </div>
      );
      
    case 'mvp-feature':
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{template.description}</p>
          <div>
            <p className="text-xs text-gray-500">User Value</p>
            <p className="text-sm">{template.userValue}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Complexity:</span> 
              <span className="capitalize">{template.complexity}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-500">Priority:</span> 
              <span className="capitalize">{template.priority}</span>
            </span>
          </div>
        </div>
      );
      
    case 'pivot-option':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm font-medium capitalize">{template.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm">{template.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Trigger</p>
            <p className="text-sm">{template.trigger}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Likelihood</p>
            <p className="text-sm capitalize">{template.likelihood}</p>
          </div>
        </div>
      );
      
    default:
      return (
        <pre className="text-xs overflow-auto p-2 bg-gray-50 rounded">
          {JSON.stringify(template, null, 2)}
        </pre>
      );
  }
} 