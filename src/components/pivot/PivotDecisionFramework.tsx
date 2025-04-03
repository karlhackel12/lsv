import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, GitFork, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PivotQuestion {
  id: string;
  question: string;
  description: string;
  icon: any;
}

interface PivotDecisionFrameworkProps {
  projectId: string;
  onComplete?: () => void;
}

const PIVOT_QUESTIONS: PivotQuestion[] = [
  {
    id: 'problem-validation',
    question: 'Have you validated that customers have the problem you think they have?',
    description: 'Customer interviews, surveys, and problem validation experiments confirm the problem exists and is significant.',
    icon: Lightbulb
  },
  {
    id: 'solution-fit',
    question: 'Does your solution solve the validated problem effectively?',
    description: 'Experiments and customer feedback show your solution addresses the problem in a way that customers value.',
    icon: CheckCircle2
  },
  {
    id: 'customer-willingness',
    question: 'Are customers willing to pay for your solution?',
    description: 'Customers have demonstrated willingness to pay through pre-orders, commitments, or actual purchases.',
    icon: ArrowRight
  },
  {
    id: 'growth-potential',
    question: 'Can this business model scale to reach your growth targets?',
    description: 'The economics, market size, and acquisition channels can support your desired growth trajectory.',
    icon: GitFork
  }
];

const PivotDecisionFramework = ({ projectId, onComplete }: PivotDecisionFrameworkProps) => {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'maybe'>>({});
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleAnswerChange = (questionId: string, value: 'yes' | 'no' | 'maybe') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const getRecommendation = () => {
    // Count the number of each type of answer
    const counts = Object.values(answers).reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate a recommendation based on the pattern of answers
    if (counts.no && counts.no >= 2) {
      return {
        recommendation: 'Consider a major pivot',
        description: 'Your current direction has significant challenges. Consider pivoting to a different problem, solution, or business model.',
        severity: 'high'
      };
    } else if (counts.no && counts.no >= 1) {
      return {
        recommendation: 'Consider a partial pivot',
        description: 'Some aspects of your current approach need rethinking, but the foundation may be solid.',
        severity: 'medium'
      };
    } else if (counts.maybe && counts.maybe >= 2) {
      return {
        recommendation: 'Gather more data',
        description: 'You have uncertainty in key areas. Run more focused experiments before deciding on a pivot.',
        severity: 'low'
      };
    } else {
      return {
        recommendation: 'Continue current direction',
        description: 'Your validation results suggest you\'re on the right track. Keep iterating and refining.',
        severity: 'none'
      };
    }
  };
  
  const isComplete = Object.keys(answers).length === PIVOT_QUESTIONS.length;
  
  const recommendation = isComplete ? getRecommendation() : null;
  
  const savePivotAssessment = async () => {
    if (!isComplete) return;
    
    setIsSaving(true);
    try {
      // Check if we can save to pivot_assessments table (if it exists)
      try {
        const { error } = await supabase
          .from('pivot_assessments')
          .insert({
            project_id: projectId,
            answers: answers,
            notes: notes,
            recommendation: recommendation?.recommendation,
            created_at: new Date().toISOString()
          });
          
        if (!error) {
          toast({
            title: 'Assessment saved',
            description: 'Your pivot assessment has been saved successfully.'
          });
          if (onComplete) onComplete();
          return;
        }
      } catch (err) {
        // If pivot_assessments table doesn't exist, fall back to updating project
        console.log('Falling back to project update for pivot assessment');
      }
      
      // Fallback: Save to project as JSON string
      const { error } = await supabase
        .from('projects')
        .update({
          pivot_assessment: JSON.stringify({
            answers,
            notes,
            recommendation: recommendation?.recommendation,
            created_at: new Date().toISOString()
          })
        })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: 'Assessment saved',
        description: 'Your pivot assessment has been saved successfully.'
      });
      
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Error saving pivot assessment:', err);
      toast({
        title: 'Error saving assessment',
        description: 'There was a problem saving your assessment.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle>Pivot Decision Framework</CardTitle>
        <CardDescription>
          Answer these key questions to determine if you should continue your current approach or pivot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {PIVOT_QUESTIONS.map((question) => {
            const QuestionIcon = question.icon;
            return (
              <div key={question.id} className="border rounded-md p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="mt-1">
                    <QuestionIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{question.question}</h3>
                    <p className="text-sm text-gray-500">{question.description}</p>
                  </div>
                </div>
                
                <RadioGroup 
                  value={answers[question.id]} 
                  onValueChange={(value) => handleAnswerChange(question.id, value as 'yes' | 'no' | 'maybe')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                    <Label htmlFor={`${question.id}-yes`} className="text-green-600">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maybe" id={`${question.id}-maybe`} />
                    <Label htmlFor={`${question.id}-maybe`} className="text-amber-600">Unsure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${question.id}-no`} />
                    <Label htmlFor={`${question.id}-no`} className="text-red-600">No</Label>
                  </div>
                </RadioGroup>
              </div>
            );
          })}
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Additional Notes</h3>
            <Textarea 
              placeholder="Enter any additional context or notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          {isComplete && recommendation && (
            <div className={`p-4 rounded-md border ${
              recommendation.severity === 'high' ? 'bg-red-50 border-red-200' :
              recommendation.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
              recommendation.severity === 'low' ? 'bg-blue-50 border-blue-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {recommendation.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  {recommendation.severity === 'medium' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  {recommendation.severity === 'low' && <GitFork className="h-5 w-5 text-blue-500" />}
                  {recommendation.severity === 'none' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </div>
                <div>
                  <h3 className="font-medium">Recommendation: {recommendation.recommendation}</h3>
                  <p className="text-sm">{recommendation.description}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={savePivotAssessment} 
              disabled={!isComplete || isSaving}
              className="flex items-center"
            >
              {isSaving ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PivotDecisionFramework; 