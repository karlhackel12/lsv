
import React from 'react';
import { Hypothesis } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import HypothesisStatementField from './hypothesis/HypothesisStatementField';
import CategoryField from './hypothesis/CategoryField';
import StatusField from './hypothesis/StatusField';
import TextField from './hypothesis/TextField';
import { useHypothesisForm } from '@/hooks/use-hypothesis-form';
import HypothesisTemplates from '@/components/hypotheses/HypothesisTemplates';

interface HypothesisFormProps {
  hypothesis: Hypothesis | null;
  projectId: string;
  onSave: (hypothesis: Hypothesis) => void;
  onClose: () => void;
  isOpen: boolean;
  phaseType?: 'problem' | 'solution';
}

const HypothesisForm = ({
  hypothesis,
  isOpen,
  onSave,
  onClose,
  projectId,
  phaseType = 'problem'
}: HypothesisFormProps) => {
  const { form, isEditing, handleSubmit, applyHypothesisTemplate } = useHypothesisForm({
    hypothesis, 
    projectId, 
    onSave, 
    onClose,
    phaseType
  });
  const [showTemplates, setShowTemplates] = React.useState(false);
  
  const formTitle = phaseType === 'problem' ? 
    (isEditing ? 'Edit Problem Hypothesis' : 'Create Problem Hypothesis') :
    (isEditing ? 'Edit Solution Hypothesis' : 'Create Solution Hypothesis');

  // Update the applyTemplate function to match the expected type
  const handleApplyTemplate = (templateData: {
    statement: string;
    criteria: string;
    experiment: string;
  }) => {
    applyHypothesisTemplate(templateData);
    setShowTemplates(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formTitle}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <HypothesisStatementField control={form.control} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CategoryField control={form.control} />
                <StatusField control={form.control} />
              </div>
              
              <TextField 
                name="criteria"
                label="Success Criteria"
                description="How will you know if this hypothesis is true?"
                placeholder="We'll know this is true if..."
                control={form.control}
              />
              
              <TextField 
                name="experiment"
                label="Experiment Design"
                description="How will you test this hypothesis?"
                placeholder="We will test this by..."
                control={form.control}
              />
              
              {isEditing && (
                <>
                  <TextField 
                    name="evidence"
                    label="Evidence (Optional)"
                    description="What evidence have you collected?"
                    placeholder="Our evidence shows..."
                    control={form.control}
                  />
                  
                  <TextField 
                    name="result"
                    label="Result (Optional)"
                    description="What was the outcome of testing this hypothesis?"
                    placeholder="Based on our evidence, we conclude..."
                    control={form.control}
                  />
                </>
              )}
              
              <DialogFooter className="flex justify-between items-center gap-2 pt-4">
                <div>
                  {!isEditing && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowTemplates(true)}
                    >
                      Use Template
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Save Changes' : 'Create Hypothesis'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {showTemplates && (
        <HypothesisTemplates
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApply={handleApplyTemplate}
          phaseType={phaseType}
        />
      )}
    </>
  );
};

export default HypothesisForm;
