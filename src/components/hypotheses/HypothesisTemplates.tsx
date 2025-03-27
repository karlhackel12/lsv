
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HypothesisTemplatesProps {
  showTemplates?: boolean;
  isOpen?: boolean; // Supporting both old and new versions
  onClose?: () => void; // Supporting both old and new versions
  onDismiss?: () => void; // Supporting both old and new versions
  setShowTemplates?: React.Dispatch<React.SetStateAction<boolean>>; // Added for backward compatibility
  onApply: (templateData: { statement: string; criteria: string; experiment: string }) => void;
  phaseType: "problem" | "solution";
}

const HypothesisTemplates = ({ 
  showTemplates, 
  isOpen, 
  onClose, 
  onDismiss, 
  setShowTemplates,
  onApply, 
  phaseType 
}: HypothesisTemplatesProps) => {
  // For backward compatibility, support both isOpen/onClose and showTemplates/onDismiss patterns
  const isDialogOpen = showTemplates || isOpen || false;
  
  // Handle close function based on available props
  const handleClose = (open: boolean) => {
    if (!open) {
      if (onClose) onClose();
      if (onDismiss) onDismiss();
      if (setShowTemplates) setShowTemplates(false);
    }
  };

  const templates = {
    problem: [
      {
        name: "Problem Discovery",
        statement: "We believe that [specific customer segment] experience [problem or pain point] when trying to [task or goal].",
        criteria: "Interviews with at least 10 potential users from the target segment confirm they experience this problem.",
        experiment: "Conduct problem interviews with potential users to understand their pain points."
      },
      {
        name: "Problem Severity",
        statement: "We believe that [specific problem] is a significant pain point for [customer segment] that they are actively seeking to solve.",
        criteria: "At least 70% of interviewed users rate the problem as 'important' or 'very important' to solve.",
        experiment: "Survey potential users to rate the severity of the problem and their willingness to pay for a solution."
      },
      {
        name: "Existing Solutions",
        statement: "We believe that [customer segment] is currently solving [problem] using [existing solutions], which is inadequate because of [limitations].",
        criteria: "At least 50% of interviewed users express dissatisfaction with current solutions.",
        experiment: "Research existing solutions and conduct competitive analysis to identify gaps."
      }
    ],
    solution: [
      {
        name: "Value Proposition",
        statement: "We believe that [specific solution feature] will solve [validated problem] for [customer segment] better than existing alternatives.",
        criteria: "In solution interviews, at least 60% of potential users express preference for our solution over alternatives.",
        experiment: "Create solution mockups and present them to potential users for feedback."
      },
      {
        name: "Willingness to Pay",
        statement: "We believe that [customer segment] is willing to pay [price point] for a solution that [value proposition].",
        criteria: "At least 30% of interviewed potential users verbally commit to purchase at the proposed price point.",
        experiment: "Conduct pricing interviews to gauge price sensitivity and willingness to pay."
      },
      {
        name: "MVP Feature Set",
        statement: "We believe that [specific MVP features] represent the minimum set of features needed to validate our solution in the market.",
        criteria: "At least 70% of potential users agree that the proposed features would adequately solve their problem.",
        experiment: "Present the MVP feature list to potential users and gather feedback on must-have versus nice-to-have features."
      }
    ]
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Hypothesis Templates</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={phaseType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="problem">Problem Validation</TabsTrigger>
            <TabsTrigger value="solution">Solution Validation</TabsTrigger>
          </TabsList>
          <TabsContent value="problem" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {templates.problem.map((template, index) => (
                  <div key={index} className="bg-validation-blue-50 p-4 rounded-lg border border-validation-blue-100">
                    <h3 className="font-semibold text-validation-blue-900 mb-2">{template.name}</h3>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Statement:</p>
                      <p className="text-sm">{template.statement}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Success Criteria:</p>
                      <p className="text-sm">{template.criteria}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Experiment Suggestion:</p>
                      <p className="text-sm">{template.experiment}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => onApply(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="solution" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {templates.solution.map((template, index) => (
                  <div key={index} className="bg-validation-purple-50 p-4 rounded-lg border border-validation-purple-100">
                    <h3 className="font-semibold text-validation-blue-900 mb-2">{template.name}</h3>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Statement:</p>
                      <p className="text-sm">{template.statement}</p>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Success Criteria:</p>
                      <p className="text-sm">{template.criteria}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-validation-blue-700 mb-1">Experiment Suggestion:</p>
                      <p className="text-sm">{template.experiment}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => onApply(template)}
                    >
                      Use This Template
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default HypothesisTemplates;
