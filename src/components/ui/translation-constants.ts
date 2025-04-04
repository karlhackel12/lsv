// Constantes de tradução para toda a aplicação
// Organizado por seções para facilitar a manutenção

export const translations = {
  // Navegação e Layout
  navigation: {
    dashboard: "Dashboard",
    projects: "Projetos",
    hypotheses: "Hipóteses",
    experiments: "Experimentos",
    metrics: "Métricas",
    mvp: "MVP",
    growth: "Crescimento",
    pivot: "Pivô",
    insights: "Insights",
    settings: "Configurações",
    help: "Ajuda",
    logout: "Sair"
  },
  
  // Autenticação
  auth: {
    login: "Entrar",
    signup: "Cadastrar",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    forgotPassword: "Esqueceu sua senha?",
    resetPassword: "Redefinir Senha",
    fullName: "Nome Completo",
    createAccount: "Criar Conta",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    resetInstructions: "Enviaremos instruções de redefinição para seu e-mail",
    signInWith: "Entrar com"
  },
  
  // Projetos
  projects: {
    create: "Criar Projeto",
    edit: "Editar Projeto",
    delete: "Excluir Projeto",
    name: "Nome do Projeto",
    description: "Descrição",
    createNew: "Criar Novo Projeto",
    details: "Detalhes do Projeto",
    status: "Status",
    team: "Equipe",
    active: "Ativo",
    archived: "Arquivado",
    completed: "Concluído"
  },
  
  // Hipóteses
  hypotheses: {
    create: "Criar Hipótese",
    edit: "Editar Hipótese",
    delete: "Excluir Hipótese",
    statement: "Declaração",
    criteria: "Critérios de Sucesso",
    evidence: "Evidência",
    result: "Resultado",
    status: "Status",
    category: "Categoria",
    experiment: "Experimento",
    problemHypothesis: "Hipótese de Problema",
    solutionHypothesis: "Hipótese de Solução",
    problemHypotheses: "Hipóteses de Problema",
    solutionHypotheses: "Hipóteses de Solução",
    unvalidated: "Não Validada",
    validated: "Validada",
    invalidated: "Invalidada",
    problemPhase: "Fase de Problema",
    solutionPhase: "Fase de Solução",
    useTemplate: "Usar Template"
  },
  
  // Experimentos
  experiments: {
    create: "Criar Experimento",
    edit: "Editar Experimento",
    delete: "Excluir Experimento",
    title: "Título",
    hypothesis: "Hipótese",
    method: "Método",
    metrics: "Métricas",
    status: "Status",
    category: "Categoria",
    results: "Resultados",
    insights: "Insights",
    decisions: "Decisões",
    planned: "Planejado",
    inProgress: "Em Andamento",
    completed: "Concluído",
    failed: "Falhou",
    problem: "Problema",
    solution: "Solução",
    businessModel: "Modelo de Negócio"
  },
  
  // Métricas
  metrics: {
    create: "Criar Métrica",
    edit: "Editar Métrica",
    delete: "Excluir Métrica",
    name: "Nome",
    description: "Descrição",
    category: "Categoria",
    target: "Meta",
    current: "Atual",
    unit: "Unidade",
    status: "Status",
    onTrack: "No Caminho",
    atRisk: "Em Risco",
    offTrack: "Fora do Caminho",
    source: "Fonte",
    frequency: "Frequência",
    owner: "Responsável",
    importance: "Importância",
    growth: "Crescimento",
    retention: "Retenção",
    acquisition: "Aquisição",
    engagement: "Engajamento",
    revenue: "Receita"
  },
  
  // MVP
  mvp: {
    features: "Funcionalidades",
    createFeature: "Criar Funcionalidade",
    editFeature: "Editar Funcionalidade",
    deleteFeature: "Excluir Funcionalidade",
    priority: "Prioridade",
    effort: "Esforço",
    impact: "Impacto",
    status: "Status",
    notes: "Observações",
    high: "Alto",
    medium: "Médio",
    low: "Baixo",
    planned: "Planejado",
    inProgress: "Em Progresso",
    completed: "Concluído",
    postMvp: "Pós-MVP"
  },
  
  // Crescimento
  growth: {
    framework: "Framework AARRR",
    acquisition: "Aquisição",
    activation: "Ativação",
    retention: "Retenção",
    referral: "Referência",
    revenue: "Receita",
    channels: "Canais",
    experiments: "Experimentos",
    metrics: "Métricas",
    scalingReadiness: "Preparação para Escala",
    economicUnit: "Unidade Econômica",
    paybackPeriod: "Período de Retorno",
    acquisitionChannels: "Canais de Aquisição",
    growthEconomics: "Economia de Crescimento",
    growthChannels: "Canais de Crescimento",
    addChannel: "Adicionar Canal",
    editChannel: "Editar Canal",
    channelName: "Nome do Canal",
    channelCategory: "Categoria do Canal",
    channelStatus: "Status do Canal",
    conversionRate: "Taxa de Conversão",
    channelCAC: "CAC do Canal",
    channelVolume: "Volume do Canal",
    channelActive: "Ativo",
    channelTesting: "Em Teste",
    channelInactive: "Inativo",
    channelOrganic: "Orgânico",
    channelPaid: "Pago",
    channelPartnership: "Parceria",
    channelContent: "Conteúdo",
    channelOther: "Outro",
    channelUpdated: "Canal Atualizado",
    channelUpdatedDesc: "Seu canal foi atualizado com sucesso",
    channelCreated: "Canal Criado",
    channelCreatedDesc: "Seu novo canal foi criado com sucesso",
    failedToSaveChannel: "Falha ao salvar o canal. Tente novamente.",
    channelExamples: "Exemplos de Canais",
    selectChannel: "Selecione um canal"
  },
  
  // Pivô
  pivot: {
    evaluateOptions: "Avaliar Opções de Pivô",
    triggerWarning: "Alerta de Gatilho de Pivô",
    pivotType: "Tipo de Pivô",
    reason: "Motivo",
    impact: "Impacto",
    decisionDate: "Data da Decisão",
    implementationPlan: "Plano de Implementação",
    customerSegment: "Segmento de Cliente",
    valueProposition: "Proposta de Valor",
    channel: "Canal",
    revenueModel: "Modelo de Receita",
    engineOfGrowth: "Motor de Crescimento",
    businessArchitecture: "Arquitetura de Negócio",
    technology: "Tecnologia"
  },
  
  // Componentes comuns
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    submit: "Enviar",
    delete: "Excluir",
    create: "Criar",
    edit: "Editar",
    update: "Atualizar",
    view: "Visualizar",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Carregando...",
    noResults: "Nenhum resultado encontrado",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    details: "Detalhes",
    actions: "Ações",
    confirm: "Confirmar",
    success: "Sucesso",
    error: "Erro",
    warning: "Aviso",
    info: "Informação",
    close: "Fechar",
    all: "Todos",
    active: "Ativo",
    inactive: "Inativo",
    status: "Status",
    notes: "Notas",
    download: "Baixar",
    upload: "Enviar",
    required: "Obrigatório",
    optional: "Opcional",
    deleted: "Excluído",
    created: "Criado",
    updated: "Atualizado",
    showing: "Mostrando",
    of: "de",
    total: "total",
    bestPractices: "Melhores Práticas",
    progressChecklist: "Lista de Verificação de Progresso",
    keyboardShortcuts: "Atalhos de Teclado",
    troubleshooting: "Solução de Problemas"
  },
  
  // Mensagens
  messages: {
    confirmDelete: "Tem certeza que deseja excluir?",
    saveSuccess: "Salvo com sucesso",
    updateSuccess: "Atualizado com sucesso",
    deleteSuccess: "Excluído com sucesso",
    createSuccess: "Criado com sucesso",
    genericError: "Ocorreu um erro. Tente novamente.",
    connectionError: "Erro de conexão. Verifique sua internet.",
    requiredField: "Este campo é obrigatório",
    invalidEmail: "E-mail inválido",
    passwordMismatch: "As senhas não coincidem",
    passwordRequirements: "A senha deve ter pelo menos 8 caracteres"
  },
  
  // Tooltips
  tooltips: {
    addHypothesis: "Adicionar uma nova hipótese",
    createExperiment: "Criar um novo experimento",
    trackMetric: "Rastrear uma nova métrica",
    addFeature: "Adicionar uma nova funcionalidade ao MVP",
    viewDetails: "Ver detalhes completos",
    editItem: "Editar este item",
    deleteItem: "Excluir este item",
    exportData: "Exportar dados"
  },
  
  // Fases da metodologia Lean Startup
  leanStartup: {
    title: "Metodologia Lean Startup",
    description: "A metodologia Lean Startup é uma abordagem científica para criar e gerenciar startups, projetada para entregar o produto desejado para as mãos dos clientes mais rapidamente. Ela ensina como conduzir uma startup - quando mudar de direção, quando perseverar e como fazer um negócio crescer com máxima aceleração.",
    corePrinciples: "Princípios Fundamentais",
    corePrinciplesDesc: "Os conceitos fundamentais por trás da metodologia Lean Startup",
    buildMeasureLearn: "Ciclo Construir-Medir-Aprender",
    buildMeasureLearnDesc: "A atividade fundamental de uma startup é transformar ideias em produtos, medir como os clientes respondem e então aprender se deve pivotar ou perseverar. Este ciclo de feedback é o núcleo do modelo Lean Startup e deve ser percorrido o mais rapidamente possível.",
    implementationSteps: "Passos de Implementação:",
    validatedLearning: "Aprendizado Validado",
    validatedLearningDesc: "O aprendizado validado é o processo de demonstrar empiricamente que uma equipe descobriu verdades valiosas sobre as perspectivas atuais e futuras de negócios de uma startup. É mais concreto, mais preciso e mais rápido que a previsão de mercado ou o planejamento de negócios clássico.",
    keyConcepts: "Conceitos-Chave:",
    minimumViableProduct: "Produto Mínimo Viável (MVP)",
    minimumViableProductDesc: "Um MVP é a versão de um novo produto que permite a uma equipe coletar a quantidade máxima de aprendizado validado sobre os clientes com o mínimo de esforço. O objetivo de um MVP não é construir um produto mínimo, mas testar hipóteses de negócios no início do ciclo de desenvolvimento do produto.",
    mvpStrategies: "Estratégias de MVP:",
    problemValidation: "Fase de Validação do Problema",
    problemValidationDesc: "Verifique se você está resolvendo um problema real que vale a pena resolver",
    customerInterviews: "Entrevistas com Clientes",
    customerInterviewsDesc: "Realize entrevistas com clientes potenciais para entender seus desafios, necessidades e como eles atualmente resolvem o problema. Concentre-se em perguntas abertas e evite apresentar sua solução durante esta fase.",
    bestPractices: "Melhores Práticas:",
    problemHypotheses: "Hipóteses de Problema",
    problemHypothesesDesc: "Crie hipóteses claras e testáveis sobre os problemas que você acredita que seus clientes-alvo enfrentam. Elas devem ser específicas o suficiente para serem validadas ou invalidadas através de pesquisa.",
    hypothesisStructure: "Estrutura da Hipótese:",
    solutionValidation: "Fase de Validação da Solução",
    solutionValidationDesc: "Teste se sua solução proposta resolve o problema validado",
    solutionPrototyping: "Prototipagem da Solução",
    solutionPrototypingDesc: "Crie protótipos de baixa fidelidade para visualizar sua solução e obter feedback inicial. Estes podem ser wireframes, mockups ou modelos interativos simples que demonstram a funcionalidade principal.",
    prototypingMethods: "Métodos de Prototipagem:",
    solutionExperiments: "Experimentos de Solução",
    solutionExperimentsDesc: "Projete experimentos para testar aspectos específicos da sua solução. Cada experimento deve ter critérios claros de sucesso e validar ou invalidar suposições específicas sobre sua solução.",
    experimentTypes: "Tipos de Experimento:",
    mvpTesting: "Fase de Teste do MVP",
    mvpTestingDesc: "Construa e teste a menor versão do seu produto que entrega valor",
    buildingMvp: "Construindo um MVP",
    buildingMvpDesc: "Concentre-se em recursos essenciais que abordam o problema principal e entregam a principal proposta de valor. Resista à vontade de adicionar recursos 'legais de ter' antes de validar o núcleo."
  },
  
  // Dashboard
  dashboard: {
    title: "Painel",
    selectProject: "Selecione um projeto para visualizar o painel",
    hypothesisTesting: "Teste de Hipóteses",
    validateAssumptions: "Valide suas suposições de negócio",
    activeHypotheses: "Hipóteses ativas",
    noHypotheses: "Nenhuma hipótese criada ainda",
    viewAllHypotheses: "Ver Todas as Hipóteses",
    experiments: "Experimentos",
    systematicTesting: "Teste e aprenda sistematicamente",
    totalExperiments: "Total de experimentos",
    noExperiments: "Nenhum experimento criado ainda",
    viewAllExperiments: "Ver Todos os Experimentos",
    mvpFeatures: "Funcionalidades MVP",
    trackCoreDevelopment: "Acompanhe o desenvolvimento de recursos principais",
    definedFeatures: "Funcionalidades definidas",
    noMvpFeatures: "Nenhuma funcionalidade MVP definida ainda",
    viewMvpFeatures: "Ver Funcionalidades MVP",
    growthExperiments: "Experimentos de Crescimento",
    accelerateGrowth: "Acelere suas métricas de crescimento",
    expectedLift: "Aumento esperado",
    viewGrowthExperiments: "Ver Experimentos de Crescimento",
    createGrowthExperiment: "Criar Experimento de Crescimento",
    keyMetrics: "Métricas-Chave",
    trackProgress: "Acompanhe o progresso em seus objetivos principais",
    noMetrics: "Nenhuma métrica definida ainda",
    viewAllMetrics: "Ver Todas as Métricas",
    createNewMetric: "Criar Nova Métrica",
    scalingReadiness: "Preparação para Escala",
    readinessScore: "Pontuação de Preparação",
    viewScalingDetails: "Ver Detalhes de Escala",
    validationProgress: "Progresso de Validação",
    problemDefinition: "Definição do Problema",
    solutionExploration: "Exploração da Solução",
    productMarketFit: "Encaixe Produto-Mercado",
    scalingMotion: "Movimento de Escala"
  },
  
  // Analytics and Metrics
  analytics: {
    cac: "Custo de Aquisição de Cliente",
    ltv: "Valor do Cliente ao Longo da Vida",
    ltvCacRatio: "Relação LTV:CAC",
    conversionRate: "Taxa de Conversão",
    churnRate: "Taxa de Abandono",
    monthlyRecurringRevenue: "Receita Recorrente Mensal",
    acquisitionChannels: "Canais de Aquisição",
    userRetention: "Retenção de Usuários",
    activationRate: "Taxa de Ativação",
    dailyActiveUsers: "Usuários Ativos Diários",
    weeklyActiveUsers: "Usuários Ativos Semanais",
    monthlyActiveUsers: "Usuários Ativos Mensais"
  },
  
  // Fase de Pivô
  pivoting: {
    pivotTrigger: "Gatilho de Pivô",
    evaluateOptions: "Avaliar Opções de Pivô",
    pivotType: "Tipo de Pivô",
    reasonForPivot: "Razão para Pivotar",
    impactAssessment: "Avaliação de Impacto",
    implementationPlan: "Plano de Implementação",
    zoominPivot: "Pivô de Ampliação",
    zoomoutPivot: "Pivô de Redução",
    customerSegmentPivot: "Pivô de Segmento de Cliente",
    customerNeedPivot: "Pivô de Necessidade do Cliente",
    platformPivot: "Pivô de Plataforma",
    businessArchitecturePivot: "Pivô de Arquitetura de Negócio",
    valueCaptureModel: "Modelo de Captura de Valor",
    engineOfGrowth: "Motor de Crescimento",
    channelPivot: "Pivô de Canal"
  },
  
  // Help and Documentation
  help: {
    gettingStarted: "Começando",
    tutorials: "Tutoriais",
    faq: "Perguntas Frequentes",
    contactSupport: "Contatar Suporte",
    documentation: "Documentação",
    bestPractices: "Melhores Práticas",
    videoTutorials: "Tutoriais em Vídeo",
    communityForum: "Fórum da Comunidade",
    keyboardShortcuts: "Atalhos de Teclado",
    troubleshooting: "Solução de Problemas"
  },
  
  validation: {
    problem: {
      title: "Validação do Problema",
      description: "Confirme que o problema realmente existe para seus clientes e que vale a pena resolver.",
      bestPractices: {
        targetCustomers: {
          title: "Defina Segmentos Específicos de Clientes",
          description: "Concentre-se em grupos de usuários bem definidos com características específicas."
        },
        conductInterviews: {
          title: "Realize Entrevistas com Clientes",
          description: "Converse com 5-10 clientes potenciais sobre seus problemas e necessidades."
        },
        testHypotheses: {
          title: "Teste Múltiplas Hipóteses",
          description: "Crie várias declarações de problema para validar simultaneamente."
        }
      },
      checklist: {
        hypothesesCreated: {
          label: "Hipóteses de Problema Criadas",
          description: "Rastreado automaticamente quando você cria hipóteses"
        },
        interviewsConducted: {
          label: "Entrevistas com Clientes Realizadas",
          description: "Ative quando você entrevistou clientes potenciais"
        },
        painPointsIdentified: {
          label: "Pontos de Dor Identificados",
          description: "Ative quando você identificou pontos de dor específicos dos clientes"
        },
        marketNeedValidated: {
          label: "Necessidade de Mercado Validada",
          description: "Ative quando você confirmou a existência de demanda de mercado"
        }
      }
    },
    solution: {
      title: "Validação da Solução",
      description: "Confirme que sua solução proposta resolve efetivamente o problema do cliente.",
      bestPractices: {
        sketchSolutions: {
          title: "Esboce Múltiplas Soluções",
          description: "Crie protótipos de baixa fidelidade para diversas abordagens de solução."
        },
        testWithCustomers: {
          title: "Teste com Clientes Reais",
          description: "Apresente seus esboços e protótipos para obter feedback dos clientes."
        },
        iterateBasedOnFeedback: {
          title: "Itere com Base no Feedback",
          description: "Refine sua solução baseado nas respostas e necessidades dos clientes."
        }
      },
      checklist: {
        solutionHypothesesCreated: {
          label: "Hipóteses de Solução Criadas",
          description: "Rastreado automaticamente quando você cria hipóteses de solução"
        },
        solutionSketchesCreated: {
          label: "Esboços de Solução Criados",
          description: "Ative quando você criou esboços ou protótipos"
        },
        customerTestingConducted: {
          label: "Testes com Clientes Realizados",
          description: "Ative quando você testou sua solução com clientes reais"
        },
        customerFeedbackImplemented: {
          label: "Feedback do Cliente Implementado",
          description: "Ative quando você incorporou feedback dos clientes"
        }
      }
    },
    progress: {
      updated: "Progresso Atualizado",
      completed: "concluído",
      incomplete: "marcado como incompleto",
      warning: {
        title: "Aviso",
        saveFailed: "Houve um problema ao salvar sua alteração. Ela será aplicada localmente, mas pode não persistir após atualizar a página."
      }
    }
  }
};

// Exportar funções auxiliares para acessar traduções
export function t(path: string): string {
  const keys = path.split('.');
  let value: any = translations;
  
  for (const key of keys) {
    if (value[key] === undefined) {
      console.warn(`Translation missing for key: ${path}`);
      return path;
    }
    value = value[key];
  }
  
  return value;
}

export default translations;
