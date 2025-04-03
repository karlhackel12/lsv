import React from 'react';
import { Hypothesis } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';
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
    (isEditing ? 'Editar Hipótese de Problema' : 'Criar Hipótese de Problema') :
    (isEditing ? 'Editar Hipótese de Solução' : 'Criar Hipótese de Solução');

  // Update the applyTemplate function to match the expected type
  const handleApplyTemplate = (templateData: {
    statement: string;
    criteria: string;
    experiment: string;
  }) => {
    applyHypothesisTemplate(templateData);
    setShowTemplates(false);
  };

  const formDescription = phaseType === 'problem' ?
    'Defina e teste hipóteses sobre os problemas dos seus clientes' :
    'Defina e teste hipóteses sobre as soluções para os problemas validados';

  return (
    <>
      <FormController
        isOpen={isOpen}
        onClose={onClose}
        title={formTitle}
        description={formDescription}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <HypothesisStatementField control={form.control} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CategoryField control={form.control} />
              <StatusField control={form.control} />
            </div>
            
            <TextField 
              name="criteria"
              label="Critérios de Sucesso"
              description="Como você saberá se essa hipótese é verdadeira?"
              placeholder="Saberemos que isso é verdade se..."
              control={form.control}
            />
            
            <TextField 
              name="experiment"
              label="Design do Experimento"
              description="Como você testará essa hipótese?"
              placeholder="Testaremos isso através de..."
              control={form.control}
            />
            
            {isEditing && (
              <>
                <TextField 
                  name="evidence"
                  label="Evidências (Opcional)"
                  description="Quais evidências você coletou?"
                  placeholder="Nossas evidências mostram..."
                  control={form.control}
                />
                
                <TextField 
                  name="result"
                  label="Resultado (Opcional)"
                  description="Qual foi o resultado do teste dessa hipótese?"
                  placeholder="Com base em nossas evidências, concluímos que..."
                  control={form.control}
                />
              </>
            )}
            
            <div className="flex justify-between items-center gap-2 pt-4">
              <div>
                {!isEditing && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowTemplates(true)}
                  >
                    Usar Template
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Salvar Alterações' : 'Criar Hipótese'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </FormController>
      
      {showTemplates && (
        <HypothesisTemplates
          showTemplates={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApply={handleApplyTemplate}
          phaseType={phaseType}
        />
      )}
    </>
  );
};

export default HypothesisForm;
