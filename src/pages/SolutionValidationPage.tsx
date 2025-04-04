
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb, PenTool, Users, MessageCircle } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

// Define the interface for solution tracking
interface SolutionTracking {
  solution_hypotheses_created: boolean;
  solution_sketches_created: boolean;
  customer_testing_conducted: boolean;
  customer_feedback_implemented: boolean;
}

const SolutionValidationPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createHypothesisTrigger, setCreateHypothesisTrigger] = useState(0);
  const { toast } = useToast();
  const { t: translate } = useTranslation();
  
  // Ensure we have fallback translations in case they're missing
  const t = {
    validation: {
      solution: {
        title: 'Solution Validation',
        description: 'Test whether your proposed solution effectively addresses the validated problem.',
        bestPractices: {
          sketchSolutions: {
            title: 'Sketch Solution Ideas',
            description: 'Create sketches or prototypes to visualize your solutions'
          },
          testWithCustomers: {
            title: 'Test with Real Customers',
            description: 'Validate your solution with potential customers through interviews or prototypes'
          },
          iterateBasedOnFeedback: {
            title: 'Iterate Based on Feedback',
            description: 'Refine your solution based on customer feedback'
          }
        },
        checklist: {
          solutionHypothesesCreated: {
            label: 'Solution Hypotheses Created',
            description: 'Create hypotheses about your solution'
          },
          solutionSketchesCreated: {
            label: 'Solution Sketches Created',
            description: 'Create sketches or prototypes of your solution'
          },
          customerTestingConducted: {
            label: 'Customer Testing Conducted',
            description: 'Test your solution with potential customers'
          },
          customerFeedbackImplemented: {
            label: 'Customer Feedback Implemented',
            description: 'Implement feedback received from customers'
          }
        }
      },
      progress: {
        updated: 'Progress Updated',
        completed: 'marked as completed',
        incomplete: 'marked as incomplete',
        warning: {
          title: 'Warning',
          saveFailed: 'Failed to save progress update'
        }
      }
    },
    hypotheses: {
      solutionHypotheses: 'Solution Hypotheses'
    },
    common: {
      bestPractices: 'Best Practices',
      progressChecklist: 'Progress Checklist'
    }
  };
  
  const [solutionTracking, setSolutionTracking] = useState<SolutionTracking>({
    solution_hypotheses_created: false,
    solution_sketches_created: false,
    customer_testing_conducted: false,
    customer_feedback_implemented: false
  });
  
  const fetchHypotheses = async () => {
    try {
      setIsLoading(true);
      
      if (!currentProject) return;
      
      // Fetch hypotheses with phase filter
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('phase', 'solution')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching hypotheses:', error);
        return;
      }
      
      // Add originalId field to each hypothesis
      const processedData = data?.map(item => ({
        ...item,
        phase: 'solution' as 'solution',
        originalId: item.id
      })) as Hypothesis[];
      
      setHypotheses(processedData || []);
      
      // Auto-update the solution_hypotheses_defined flag if hypotheses exist
      if (processedData && processedData.length > 0 && !solutionTracking.solution_hypotheses_created) {
        updateSolutionTracking('solution_hypotheses_created', true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch solution tracking data
  const fetchSolutionTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
        
      if (projectError) {
        console.error('Error fetching solution tracking:', projectError);
        return;
      }
      
      // Check if solution_tracking exists in the projectData
      if (projectData) {
        let trackingData: SolutionTracking | null = null;
        
        if (projectData.solution_tracking) {
          try {
            trackingData = typeof projectData.solution_tracking === 'string'
              ? JSON.parse(projectData.solution_tracking)
              : projectData.solution_tracking as SolutionTracking;
              
            setSolutionTracking(trackingData);
          } catch (err) {
            console.error('Error parsing solution tracking data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  // Update solution tracking state
  const updateSolutionTracking = async (field: keyof SolutionTracking, value: boolean) => {
    if (!currentProject) return;
    
    // Primeiro, atualize o estado local para garantir que a UI seja responsiva
    const updatedTracking = { ...solutionTracking, [field]: value };
    setSolutionTracking(updatedTracking);
    
    // Função para salvar os dados no Supabase
    const saveToDatabase = async (retryCount = 0, maxRetries = 3) => {
      try {
        // Atualiza o banco de dados
        const { error } = await supabase
          .from('projects')
          .update({ 
            solution_tracking: JSON.stringify(updatedTracking) // Garante que os dados sejam salvos como JSON
          })
          .eq('id', currentProject.id);
          
        // Se houver erro, tente novamente até atingir o máximo de tentativas
        if (error) {
          if (retryCount < maxRetries) {
            // Aguarde um tempo exponencial entre as tentativas (300ms, 900ms, 2700ms...)
            const waitTime = 300 * Math.pow(3, retryCount);
            console.warn(`Tentativa ${retryCount + 1} falhou, tentando novamente em ${waitTime}ms`, error);
            
            setTimeout(() => {
              saveToDatabase(retryCount + 1, maxRetries);
            }, waitTime);
            return;
          } else {
            throw error;
          }
        }
        
        // Se salvou com sucesso, dispare o evento de atualização
        window.dispatchEvent(new CustomEvent('validation-progress-update'));
        
        toast({
          title: t.validation.progress.updated,
          description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? t.validation.progress.completed : t.validation.progress.incomplete}.`,
          variant: 'success',
        });
        
      } catch (err) {
        console.error('Erro ao atualizar o rastreamento da solução:', err);
        
        // Mesmo se falhar após todas as tentativas, mantenha a UI atualizada
        // para evitar confusão do usuário, mas mostre uma mensagem de erro
        toast({
          title: t.validation.progress.warning.title,
          description: t.validation.progress.warning.saveFailed,
          variant: 'destructive',
        });
        
        // Importante: NÃO revertemos o estado local aqui para evitar confusão do usuário
        // A alteração continua visível, mesmo que não tenha sido salva no banco
      }
    };
    
    // Inicie o processo de salvamento
    saveToDatabase();
  };
  
  useEffect(() => {
    if (currentProject) {
      fetchSolutionTrackingData();
      fetchHypotheses();
    }
  }, [currentProject]);
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <PenTool />,
      title: t.validation.solution.bestPractices.sketchSolutions.title,
      description: t.validation.solution.bestPractices.sketchSolutions.description
    },
    {
      icon: <Users />,
      title: t.validation.solution.bestPractices.testWithCustomers.title,
      description: t.validation.solution.bestPractices.testWithCustomers.description
    },
    {
      icon: <MessageCircle />,
      title: t.validation.solution.bestPractices.iterateBasedOnFeedback.title,
      description: t.validation.solution.bestPractices.iterateBasedOnFeedback.description
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'solution_hypotheses_created',
      label: t.validation.solution.checklist.solutionHypothesesCreated.label,
      description: t.validation.solution.checklist.solutionHypothesesCreated.description,
      icon: <Lightbulb />,
      checked: solutionTracking.solution_hypotheses_created,
      disabled: true
    },
    {
      key: 'solution_sketches_created',
      label: t.validation.solution.checklist.solutionSketchesCreated.label,
      description: t.validation.solution.checklist.solutionSketchesCreated.description,
      icon: <PenTool />,
      checked: solutionTracking.solution_sketches_created,
      onCheckedChange: (checked) => updateSolutionTracking('solution_sketches_created', checked)
    },
    {
      key: 'customer_testing_conducted',
      label: t.validation.solution.checklist.customerTestingConducted.label,
      description: t.validation.solution.checklist.customerTestingConducted.description,
      icon: <Users />,
      checked: solutionTracking.customer_testing_conducted,
      onCheckedChange: (checked) => updateSolutionTracking('customer_testing_conducted', checked)
    },
    {
      key: 'customer_feedback_implemented',
      label: t.validation.solution.checklist.customerFeedbackImplemented.label,
      description: t.validation.solution.checklist.customerFeedbackImplemented.description,
      icon: <MessageCircle />,
      checked: solutionTracking.customer_feedback_implemented,
      onCheckedChange: (checked) => updateSolutionTracking('customer_feedback_implemented', checked)
    }
  ];
  
  // Show a message if no project is selected
  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-500">Por favor, selecione um projeto para visualizar a validação de solução.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <PageIntroduction 
        title={t.validation.solution.title}
        description={t.validation.solution.description}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <HypothesesSection
            title={t.hypotheses.solutionHypotheses}
            hypotheses={hypotheses}
            isLoading={isLoading}
            phase="solution"
            onCreateTrigger={createHypothesisTrigger}
            onHypothesesUpdated={fetchHypotheses}
          />
        </div>
        
        <div className="space-y-6">
          <BestPracticesCard 
            title={t.common.bestPractices}
            practices={bestPractices} 
          />
          
          <ChecklistCard
            title={t.common.progressChecklist}
            color="cyan"
            items={checklistItems}
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionValidationPage;
