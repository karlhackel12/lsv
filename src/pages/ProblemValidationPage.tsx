import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import HypothesesSection from '@/components/HypothesesSection';
import PageIntroduction from '@/components/PageIntroduction';
import { Lightbulb, Users, MessageCircle, CheckSquare } from 'lucide-react';
import { useProject } from '@/hooks/use-project';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

// Define the interface for problem tracking
interface ProblemTracking {
  problem_hypotheses_created: boolean;
  customer_interviews_conducted: boolean;
  pain_points_identified: boolean;
  market_need_validated: boolean;
}

const ProblemValidationPage = () => {
  const { currentProject } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createHypothesisTrigger, setCreateHypothesisTrigger] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [problemTracking, setProblemTracking] = useState<ProblemTracking>({
    problem_hypotheses_created: false,
    customer_interviews_conducted: false,
    pain_points_identified: false,
    market_need_validated: false
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
        .eq('phase', 'problem')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching hypotheses:', error);
        return;
      }
      
      // Add originalId field to each hypothesis
      const processedData = data?.map(item => ({
        ...item,
        phase: 'problem' as 'problem',
        originalId: item.id
      })) as Hypothesis[];
      
      setHypotheses(processedData || []);
      
      // Auto-update the problem_hypotheses_created flag if hypotheses exist
      if (processedData && processedData.length > 0 && !problemTracking.problem_hypotheses_created) {
        updateProblemTracking('problem_hypotheses_created', true);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch problem tracking data
  const fetchProblemTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
        
      if (projectError) {
        console.error('Error fetching problem tracking:', projectError);
        return;
      }
      
      // Check if problem_tracking exists in the projectData
      if (projectData) {
        let trackingData: ProblemTracking | null = null;
        
        if (projectData.problem_tracking) {
          try {
            trackingData = typeof projectData.problem_tracking === 'string'
              ? JSON.parse(projectData.problem_tracking)
              : projectData.problem_tracking as ProblemTracking;
              
            setProblemTracking(trackingData);
          } catch (err) {
            console.error('Error parsing problem tracking data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  // Update problem tracking state
  const updateProblemTracking = async (field: keyof ProblemTracking, value: boolean) => {
    if (!currentProject) return;
    
    // Primeiro, atualize o estado local para garantir que a UI seja responsiva
    const updatedTracking = { ...problemTracking, [field]: value };
    setProblemTracking(updatedTracking);
    
    // Função para salvar os dados no Supabase
    const saveToDatabase = async (retryCount = 0, maxRetries = 3) => {
      try {
        // Atualiza o banco de dados
        const { error } = await supabase
          .from('projects')
          .update({ 
            problem_tracking: JSON.stringify(updatedTracking) // Garante que os dados sejam salvos como JSON
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
        console.error('Erro ao atualizar o rastreamento do problema:', err);
        
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
      fetchHypotheses();
      fetchProblemTrackingData();
      
      // Temporarily disabled: project stage update
      /*
      try {
        updateProjectStage('problem');
      } catch (err) {
        console.error('Failed to update project stage:', err);
      }
      */
    }
  }, [currentProject]);
  
  const updateProjectStage = async (stage: string) => {
    if (!currentProject) return;
    
    try {
      // Update the stage property instead of current_stage
      await supabase
        .from('projects')
        .update({ stage: stage })
        .eq('id', currentProject.id);
    } catch (err) {
      console.error('Error updating project stage:', err);
    }
  };
  
  const handleCreateHypothesis = () => {
    setCreateHypothesisTrigger(prev => prev + 1);
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Users />,
      title: t.validation.problem.bestPractices.targetCustomers.title,
      description: t.validation.problem.bestPractices.targetCustomers.description
    },
    {
      icon: <MessageCircle />,
      title: t.validation.problem.bestPractices.conductInterviews.title,
      description: t.validation.problem.bestPractices.conductInterviews.description
    },
    {
      icon: <CheckSquare />,
      title: t.validation.problem.bestPractices.testHypotheses.title,
      description: t.validation.problem.bestPractices.testHypotheses.description
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'problem_hypotheses_created',
      label: t.validation.problem.checklist.hypothesesCreated.label,
      description: t.validation.problem.checklist.hypothesesCreated.description,
      icon: <Lightbulb />,
      checked: problemTracking.problem_hypotheses_created,
      disabled: true
    },
    {
      key: 'customer_interviews_conducted',
      label: t.validation.problem.checklist.interviewsConducted.label,
      description: t.validation.problem.checklist.interviewsConducted.description,
      icon: <MessageCircle />,
      checked: problemTracking.customer_interviews_conducted,
      onCheckedChange: (checked) => updateProblemTracking('customer_interviews_conducted', checked)
    },
    {
      key: 'pain_points_identified',
      label: t.validation.problem.checklist.painPointsIdentified.label,
      description: t.validation.problem.checklist.painPointsIdentified.description,
      icon: <CheckSquare />,
      checked: problemTracking.pain_points_identified,
      onCheckedChange: (checked) => updateProblemTracking('pain_points_identified', checked)
    },
    {
      key: 'market_need_validated',
      label: t.validation.problem.checklist.marketNeedValidated.label,
      description: t.validation.problem.checklist.marketNeedValidated.description,
      icon: <CheckSquare />,
      checked: problemTracking.market_need_validated,
      onCheckedChange: (checked) => updateProblemTracking('market_need_validated', checked)
    }
  ];
  
  // Show a message if no project is selected
  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-gray-500">Por favor, selecione um projeto para visualizar a validação de problema.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <PageIntroduction 
        title={t.validation.problem.title}
        description={t.validation.problem.description}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <HypothesesSection
            title={t.hypotheses.problemHypotheses}
            hypotheses={hypotheses}
            isLoading={isLoading}
            phase="problem"
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
            color="blue"
            items={checklistItems}
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemValidationPage;
