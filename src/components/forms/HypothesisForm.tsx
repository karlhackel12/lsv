import React, { useEffect } from 'react';
import { Hypothesis } from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lightbulb, Beaker } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useHypothesisForm } from '@/hooks/use-hypothesis-form';
import HypothesisTemplates from '../hypotheses/HypothesisTemplates';
import { FormSheet } from '@/components/ui/form-sheet';

interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Hypothesis) => Promise<void>;
  hypothesis?: Hypothesis | null;
  projectId: string;
  phaseType?: 'problem' | 'solution';
}

const HypothesisForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  hypothesis, 
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
  
  const formIcon = phaseType === 'problem' ? 
    <Lightbulb className="h-5 w-5 mr-2 text-blue-500" /> : 
    <Beaker className="h-5 w-5 mr-2 text-green-500" />;

  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={formTitle}
    >
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? 'Hide Templates' : 'Show Templates'}
        </Button>
      </div>

      {showTemplates && (
        <div className="mb-6">
          <HypothesisTemplates 
            showTemplates={showTemplates} 
            setShowTemplates={setShowTemplates} 
            onSelectTemplate={applyHypothesisTemplate}
            phaseType={phaseType}
          />
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="statement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hypothesis Statement</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={phaseType === 'problem' 
                      ? "We believe that [customer segment] has a problem with [pain point]..."
                      : "We believe that [solution approach] will solve [validated problem]..."
                    } 
                    className="h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label htmlFor="customer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="problem" id="problem" />
                      <Label htmlFor="problem">Problem</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="solution" id="solution" />
                      <Label htmlFor="solution">Solution</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business-model" id="business-model" />
                      <Label htmlFor="business-model">Business Model</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="criteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Success Criteria</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={phaseType === 'problem'
                      ? "How will you know the problem is real? E.g., 80% of interviewees mention this problem..."
                      : "How will you know the solution works? E.g., 50% of users complete the desired action..."
                    } 
                    className="h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="experiment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experiment Approach</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={phaseType === 'problem'
                      ? "How will you test this hypothesis? E.g., conduct 10 customer interviews with [specific segment]..."
                      : "How will you test this solution? E.g., create a prototype and show it to 5 potential customers..."
                    } 
                    className="h-24"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {isEditing && (
            <>
              <FormField
                control={form.control}
                name="evidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidence</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What evidence have you collected?" 
                        className="h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not-started" id="not-started" />
                          <Label htmlFor="not-started">Not Started</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="validating" id="validating" />
                          <Label htmlFor="validating">Validating</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="validated" id="validated" />
                          <Label htmlFor="validated">Validated</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="invalid" id="invalid" />
                          <Label htmlFor="invalid">Invalid</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="result"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What was the outcome of your experiment?"
                        className="h-24" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Form>
    </FormSheet>
  );
};

export default HypothesisForm;
