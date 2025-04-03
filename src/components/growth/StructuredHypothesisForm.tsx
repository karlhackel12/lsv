import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GrowthModel, GrowthMetric, GrowthHypothesis } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormController } from '@/components/ui/form-controller';

const formSchema = z.object({
  action: z.string().min(10, 'A ação deve ter pelo menos 10 caracteres'),
  outcome: z.string().min(10, 'O resultado deve ter pelo menos 10 caracteres'),
  success_criteria: z.string().optional(),
  stage: z.string().min(1, 'Estágio é obrigatório'),
  metric_id: z.string().optional(),
});

export interface StructuredHypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  hypothesis: GrowthHypothesis | null;
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
}

const StructuredHypothesisForm: React.FC<StructuredHypothesisFormProps> = ({
  isOpen,
  onClose,
  onSave,
  hypothesis,
  growthModel,
  projectId,
  metrics,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      action: hypothesis?.action || '',
      outcome: hypothesis?.outcome || '',
      success_criteria: hypothesis?.success_criteria || '',
      stage: hypothesis?.stage || 'channel',
      metric_id: hypothesis?.metric_id || '',
    },
  });

  useEffect(() => {
    if (isOpen && hypothesis) {
      console.log("Loading hypothesis data into form:", hypothesis);
      
      setTimeout(() => {
        form.reset({
          action: hypothesis.action || '',
          outcome: hypothesis.outcome || '',
          success_criteria: hypothesis.success_criteria || '',
          stage: hypothesis.stage || 'channel',
          metric_id: hypothesis.metric_id || '',
        });
      }, 0);
    }
  }, [isOpen, hypothesis, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        action: values.action,
        outcome: values.outcome,
        success_criteria: values.success_criteria || '',
        stage: values.stage,
        metric_id: values.metric_id || null,
        growth_model_id: growthModel.id,
        project_id: projectId,
      };

      if (hypothesis) {
        const { error } = await supabase
          .from('growth_hypotheses')
          .update(formData)
          .eq('id', hypothesis.id);

        if (error) throw error;

        toast({
          title: 'Hipótese atualizada',
          description: 'Sua hipótese de crescimento foi atualizada',
        });
      } else {
        const { error } = await supabase
          .from('growth_hypotheses')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Hipótese criada',
          description: 'Sua hipótese de crescimento foi criada',
        });
      }

      form.reset();
      await onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving hypothesis:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao salvar hipótese',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stageOptions = [
    { id: 'channel', name: 'Validação de Canal' },
    { id: 'activation', name: 'Otimização de Ativação' },
    { id: 'monetization', name: 'Teste de Monetização' },
    { id: 'retention', name: 'Engenharia de Retenção' },
    { id: 'referral', name: 'Motor de Indicações' },
    { id: 'scaling', name: 'Preparação para Escala' },
  ];

  return (
    <FormController
      isOpen={isOpen}
      onClose={onClose}
      title={hypothesis ? 'Editar Hipótese de Crescimento' : 'Criar Hipótese de Crescimento'}
      description="Estruture sua hipótese de crescimento para torná-la testável"
      isSubmitting={isSubmitting}
      submitLabel={hypothesis ? 'Atualizar' : 'Criar'}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estágio de Crescimento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estágio de crescimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stageOptions.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nós acreditamos que</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ex.: implementar um programa de indicação com incentivos financeiros"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultará em</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ex.: um aumento de 30% na aquisição de usuários por canais de recomendação"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="success_criteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saberemos que estamos certos quando</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ex.: vermos o custo de aquisição de clientes cair pelo menos 15% dentro de 30 dias"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metric_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Métrica de Crescimento Relacionada</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma métrica de crescimento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {metrics.map((metric) => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </FormController>
  );
};

export default StructuredHypothesisForm;
