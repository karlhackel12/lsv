import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, ArrowRight, FlaskConical, Megaphone, LineChart, Plus } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import { useNavigate } from 'react-router-dom';
import { GrowthChannel } from '@/types/database';
import { useTranslation } from '@/hooks/use-translation';
import { FormController } from '@/components/ui/form-controller';
import GrowthChannelForm from '@/components/forms/GrowthChannelForm';

interface GrowthTracking {
  channels_identified: boolean;
  growth_experiments_setup: boolean;
  funnel_optimized: boolean;
  repeatable_growth: boolean;
}

const GrowthPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [growthTracking, setGrowthTracking] = useState<GrowthTracking>({
    channels_identified: false,
    growth_experiments_setup: false,
    funnel_optimized: false,
    repeatable_growth: false
  });
  
  // Estado para o formulário de canais
  const [isChannelFormOpen, setIsChannelFormOpen] = useState(false);
  const [channels, setChannels] = useState<GrowthChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<GrowthChannel | null>(null);
  
  useEffect(() => {
    if (currentProject?.id) {
      fetchGrowthTrackingData();
      fetchGrowthChannels();
    }
  }, [currentProject?.id]);

  const fetchGrowthTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project growth tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('growth_tracking')
        .eq('id', currentProject.id)
        .single();
      
      if (projectError) {
        console.error('Erro ao buscar dados do projeto:', projectError);
        return;
      }
      
      if (projectData) {
        // Use type assertion to safely access growth_tracking
        let trackingData: GrowthTracking | null = null;
        
        if (projectData.growth_tracking) {
          try {
            trackingData = typeof projectData.growth_tracking === 'string'
              ? JSON.parse(projectData.growth_tracking)
              : projectData.growth_tracking as GrowthTracking;
              
            setGrowthTracking(trackingData);
          } catch (err) {
            console.error('Erro ao analisar dados de growth tracking:', err);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados de growth tracking:', err);
    }
  };
  
  const fetchGrowthChannels = async () => {
    if (!currentProject?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('growth_channels')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setChannels(data);
      }
    } catch (err) {
      console.error('Erro ao buscar canais de crescimento:', err);
      toast({
        title: t('messages.error'),
        description: 'Não foi possível carregar os canais de crescimento',
        variant: 'destructive',
      });
    }
  };
  
  const handleChannelFormOpen = (channel: GrowthChannel | null = null) => {
    setSelectedChannel(channel);
    setIsChannelFormOpen(true);
  };
  
  const handleChannelFormClose = () => {
    setIsChannelFormOpen(false);
    setSelectedChannel(null);
  };
  
  const handleChannelSave = async () => {
    await fetchGrowthChannels();
    // Se não existiam canais antes, marque o checklist
    if (channels.length === 0) {
      updateGrowthTracking('channels_identified', true);
    }
  };

  // Update growth tracking state
  const updateGrowthTracking = async (field: keyof GrowthTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...growthTracking, [field]: value };
      
      // Optimistically update the UI
      setGrowthTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          growth_tracking: JSON.stringify(updatedTracking)
        })
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Progresso Atualizado',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'concluído' : 'marcado como incompleto'}.`
      });
    } catch (err) {
      console.error('Erro ao atualizar growth tracking:', err);
      
      // Revert the local state change on error
      setGrowthTracking(growthTracking);
    }
  };

  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Megaphone />,
      title: 'Teste Múltiplos Canais',
      description: 'Experimente diferentes canais de aquisição para encontrar o que funciona melhor para seus clientes.'
    },
    {
      icon: <FlaskConical />,
      title: 'Execute Experimentos de Crescimento',
      description: 'Crie experimentos estruturados para otimizar seu funil de crescimento.'
    },
    {
      icon: <LineChart />,
      title: 'Meça a Economia do Negócio',
      description: 'Acompanhe o Custo de Aquisição de Clientes (CAC) e o Valor do Cliente ao Longo da Vida (LTV).'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'channels_identified',
      label: 'Canais de Crescimento Identificados',
      description: 'Identifique os principais canais para aquisição de clientes',
      icon: <Megaphone />,
      checked: growthTracking.channels_identified,
      onCheckedChange: (checked) => updateGrowthTracking('channels_identified', checked)
    },
    {
      key: 'growth_experiments_setup',
      label: 'Experimentos de Crescimento Configurados',
      description: 'Configure experimentos para testar canais de aquisição',
      icon: <FlaskConical />,
      checked: growthTracking.growth_experiments_setup,
      onCheckedChange: (checked) => updateGrowthTracking('growth_experiments_setup', checked)
    },
    {
      key: 'funnel_optimized',
      label: 'Funil de Conversão Otimizado',
      description: 'Melhore seu funil de conversão para aumentar as taxas',
      icon: <LineChart />,
      checked: growthTracking.funnel_optimized,
      onCheckedChange: (checked) => updateGrowthTracking('funnel_optimized', checked)
    },
    {
      key: 'repeatable_growth',
      label: 'Crescimento Repetível e Sustentável',
      description: 'Estabeleça mecanismos consistentes de crescimento',
      icon: <TrendingUp />,
      checked: growthTracking.repeatable_growth,
      onCheckedChange: (checked) => updateGrowthTracking('repeatable_growth', checked)
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando projeto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Erro: {error instanceof Error ? error.message : 'Falha ao carregar o projeto'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageIntroduction 
        title="Crescimento e Escala" 
        icon={<TrendingUp className="h-5 w-5 text-indigo-500" />} 
        description="Acompanhe canais de aquisição e métricas para avaliar a preparação da sua startup para escalar."
      />
      
      <BestPracticesCard 
        title="Melhores Práticas para Estratégia de Crescimento"
        color="indigo"
        tooltip="Estas práticas ajudam você a desenvolver e otimizar sua estratégia de crescimento de forma eficaz."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Checklist de Validação de Crescimento"
        color="indigo"
        items={checklistItems}
      />
      
      {/* Seção de canais de crescimento */}
      {currentProject && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-indigo-500" />
                {t('growth.growthChannels')}
              </CardTitle>
              <CardDescription>
                {t('growth.acquisitionChannels')}
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleChannelFormOpen()}
              className="ml-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('growth.addChannel')}
            </Button>
          </CardHeader>
          <CardContent>
            {channels.length === 0 ? (
              <div className="text-center p-6 border border-dashed rounded-lg">
                <Megaphone className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Adicione canais de crescimento para acompanhar suas estratégias de aquisição
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handleChannelFormOpen()}
                >
                  {t('growth.addChannel')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map(channel => (
                  <Card key={channel.id} className="bg-white border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium">{channel.name}</h4>
                          <p className="text-xs text-gray-500 capitalize mt-1">
                            {channel.category}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleChannelFormOpen(channel)}
                        >
                          {t('common.edit')}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                        <div>
                          <p className="text-gray-500">{t('growth.channelCAC')}</p>
                          <p className="font-medium">
                            {channel.cac ? `R$ ${channel.cac.toFixed(2)}` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('growth.conversionRate')}</p>
                          <p className="font-medium">
                            {channel.conversion_rate ? `${channel.conversion_rate.toFixed(1)}%` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('growth.channelStatus')}</p>
                          <div className={`px-2 py-0.5 rounded-full inline-block text-xs ${
                            channel.status === 'active' ? 'bg-green-100 text-green-800' :
                            channel.status === 'testing' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {channel.status === 'active' ? t('growth.channelActive') :
                             channel.status === 'testing' ? t('growth.channelTesting') :
                             t('growth.channelInactive')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Add ValidationPhaseIntro for consistency */}
      <ValidationPhaseIntro 
        phase="growth" 
        onCreateNew={() => navigate('/metrics?create=true')}
        createButtonText="Adicionar Métrica de Crescimento"
      />
      
      {currentProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Framework Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Framework AARRR
              </CardTitle>
              <CardDescription>
                Métricas chave para cada estágio do funil de crescimento
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <h3 className="font-semibold text-blue-700">Aquisição</h3>
                  <p className="text-sm text-blue-600">Como os usuários encontram você? (CAC, eficácia do canal)</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-md">
                  <h3 className="font-semibold text-green-700">Ativação</h3>
                  <p className="text-sm text-green-600">Os usuários têm uma boa primeira experiência? (conclusão do onboarding)</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-md">
                  <h3 className="font-semibold text-yellow-700">Retenção</h3>
                  <p className="text-sm text-yellow-600">Os usuários voltam? (usuários ativos diários/semanais, churn)</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-md">
                  <h3 className="font-semibold text-purple-700">Referência</h3>
                  <p className="text-sm text-purple-600">Os usuários contam para outros? (coeficiente viral, NPS)</p>
                </div>
                
                <div className="p-3 bg-pink-50 rounded-md">
                  <h3 className="font-semibold text-pink-700">Receita</h3>
                  <p className="text-sm text-pink-600">Você pode monetizar? (LTV, taxas de conversão, ARPU)</p>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => navigate('/metrics')}
                    className="w-full"
                  >
                    Ver Todas as Métricas
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Scaling Readiness Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-purple-500" />
                Preparação para Escala
              </CardTitle>
              <CardDescription>
                Requisitos para estar pronto para escalar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700">Unidade Econômica</h3>
                  <p className="text-sm text-gray-600">LTV &gt; 3x CAC (valor do cliente ao longo da vida excede o custo de aquisição)</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700">Período de Retorno</h3>
                  <p className="text-sm text-gray-600">Período de recuperação &lt; 12 meses</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700">Canais de Aquisição</h3>
                  <p className="text-sm text-gray-600">Pelo menos dois canais de aquisição confiáveis identificados</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700">Retenção</h3>
                  <p className="text-sm text-gray-600">Métricas de retenção atendem ou excedem os benchmarks do setor</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700">Economia de Crescimento</h3>
                  <p className="text-sm text-gray-600">Receitas crescendo mais rápido que os custos</p>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => navigate('/experiments?create=true')}
                    className="w-full"
                  >
                    Criar Experimento de Crescimento
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Formulário de canal de crescimento */}
      <FormController
        isOpen={isChannelFormOpen}
        onClose={handleChannelFormClose}
        title={selectedChannel ? t('growth.editChannel') : t('growth.addChannel')}
        description={selectedChannel 
          ? `Editando: ${selectedChannel.name}` 
          : "Adicione informações sobre o canal de crescimento"
        }
      >
        {currentProject && (
          <GrowthChannelForm 
            projectId={currentProject.id}
            channel={selectedChannel}
            onSave={handleChannelSave}
            onClose={handleChannelFormClose}
          />
        )}
      </FormController>
    </div>
  );
};

export default GrowthPage;
