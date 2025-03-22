
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Hypothesis } from '@/types/database';
import { useHypothesisForm } from '@/hooks/use-hypothesis-form';
import CategoryField from './hypothesis/CategoryField';
import HypothesisStatementField from './hypothesis/HypothesisStatementField';
import TextField from './hypothesis/TextField';
import StatusField from './hypothesis/StatusField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info } from 'lucide-react';
import Card from '@/components/Card';

export interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Hypothesis) => Promise<void>;
  hypothesis?: Hypothesis;
  projectId?: string; 
}

const HypothesisForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  hypothesis, 
  projectId 
}: HypothesisFormProps) => {
  const { 
    form, 
    isEditing, 
    handleSubmit, 
    applyHypothesisTemplate, 
    getHypothesisTemplates 
  } = useHypothesisForm(hypothesis, onSave, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-validation-blue-600 to-validation-blue-500 text-white">
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Edit Hypothesis' : 'Create New Hypothesis'}
          </DialogTitle>
          <p className="text-sm opacity-90 mt-1">
            {isEditing 
              ? 'Update your hypothesis and review the evidence collected'
              : 'Define a clear, testable hypothesis to validate your assumptions'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue="details" className="w-full">
              <div className="px-6">
                <TabsList className="w-full mt-4 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="details" className="flex-1">Hypothesis Details</TabsTrigger>
                  {isEditing && (
                    <TabsTrigger value="results" className="flex-1">Results & Evidence</TabsTrigger>
                  )}
                </TabsList>
              </div>
              
              <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <TabsContent value="details" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                      <CategoryField form={form} />
                    </div>
                    
                    {isEditing && (
                      <div className="col-span-1">
                        <StatusField form={form} />
                      </div>
                    )}
                  </div>

                  <Card className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <HypothesisStatementField 
                      form={form} 
                      templates={getHypothesisTemplates()} 
                      onApplyTemplate={applyHypothesisTemplate} 
                    />
                  </Card>

                  <TextField 
                    form={form} 
                    name="criteria" 
                    label="Success Criteria" 
                    placeholder="What would make this hypothesis true? Define measurable outcomes."
                    infoTooltip="Specify clear, measurable criteria that will help you determine if your hypothesis is validated or invalidated."
                    height="min-h-[100px]"
                  />

                  <TextField 
                    form={form} 
                    name="experiment" 
                    label="Experiment Plan" 
                    placeholder="How will you test this hypothesis? Describe your approach and methodology."
                    infoTooltip="Outline the specific experiment, test, or research method you'll use to validate this hypothesis."
                    height="min-h-[100px]"
                  />
                </TabsContent>

                {isEditing && (
                  <TabsContent value="results" className="space-y-6 mt-0">
                    <TextField 
                      form={form} 
                      name="evidence" 
                      label="Evidence Collected" 
                      placeholder="What evidence did you collect during your experiment?"
                      infoTooltip="Document all relevant data, observations, and measurements from your experiment."
                      height="min-h-[120px]"
                    />

                    <TextField 
                      form={form} 
                      name="result" 
                      label="Result & Conclusions" 
                      placeholder="What was the outcome of testing this hypothesis? What did you learn?"
                      infoTooltip="Analyze the evidence and explain what it means for your hypothesis and product direction."
                      height="min-h-[120px]"
                    />
                  </TabsContent>
                )}
              </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <Button type="button" variant="outline" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
              >
                {isEditing ? 'Update Hypothesis' : 'Create Hypothesis'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HypothesisForm;
