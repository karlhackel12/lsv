import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PageIntroduction from '@/components/PageIntroduction';
import { BookOpen, Lightbulb, FlaskConical, Layers, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const LeanStartupPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6 p-6">
      <PageIntroduction
        title={t('leanStartup.title')}
        icon={<BookOpen className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              {t('leanStartup.description')}
            </p>
          </>
        }
        showDescription={false}
      />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
              {t('leanStartup.corePrinciples')}
            </CardTitle>
            <CardDescription>
              {t('leanStartup.corePrinciplesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="build-measure-learn">
                  <AccordionTrigger className="font-medium">{t('leanStartup.buildMeasureLearn')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.buildMeasureLearnDesc')}
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.implementationSteps')}</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Construir um Produto Mínimo Viável (MVP) com recursos mínimos</li>
                        <li>Medir métricas chave e comportamento do usuário</li>
                        <li>Aprender com os dados para tomar decisões informadas</li>
                        <li>Repetir o ciclo com melhorias baseadas no aprendizado</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="validated-learning">
                  <AccordionTrigger className="font-medium">{t('leanStartup.validatedLearning')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.validatedLearningDesc')}
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.keyConcepts')}</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Testar suposições com clientes reais</li>
                        <li>Usar abordagem científica para validação de negócios</li>
                        <li>Documentar aprendizados sistematicamente</li>
                        <li>Focar em métricas acionáveis em vez de métricas de vaidade</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="minimum-viable-product">
                  <AccordionTrigger className="font-medium">{t('leanStartup.minimumViableProduct')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.minimumViableProductDesc')}
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.mvpStrategies')}</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Landing pages para testar propostas de valor</li>
                        <li>MVP de concierge (serviço manual antes de automatizar)</li>
                        <li>Teste de Mágico de Oz (humano por trás de fachada automatizada)</li>
                        <li>Lançamento de software com recursos mínimos</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
              {t('leanStartup.problemValidation')}
            </CardTitle>
            <CardDescription>
              {t('leanStartup.problemValidationDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Antes de construir qualquer solução, valide que o problema que você está tentando resolver 
                realmente existe e é significativo o suficiente para que os clientes paguem por uma solução.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="customer-interviews">
                  <AccordionTrigger className="font-medium">{t('leanStartup.customerInterviews')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.customerInterviewsDesc')}
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.bestPractices')}</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Realizar entre 10-20 entrevistas por segmento de cliente</li>
                        <li>Perguntar sobre os problemas deles, não sobre sua solução</li>
                        <li>Procurar padrões e problemas recorrentes</li>
                        <li>Quantificar a severidade e frequência do problema</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="problem-hypotheses">
                  <AccordionTrigger className="font-medium">{t('leanStartup.problemHypotheses')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.problemHypothesesDesc')}
                    </p>
                    <div className="mt-4 bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.hypothesisStructure')}</h4>
                      <p className="italic mb-2">
                        &quot;Acreditamos que [segmento de cliente] experimenta [problema] quando tenta [objetivo/atividade],
                        o que causa [impacto negativo].&quot;
                      </p>
                      <p>
                        Suas hipóteses devem ser falsificáveis, específicas e focadas em problemas ao invés de
                        soluções nesta fase.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5 text-green-500" />
              {t('leanStartup.solutionValidation')}
            </CardTitle>
            <CardDescription>
              {t('leanStartup.solutionValidationDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Uma vez que você validou o problema, comece a testar soluções potenciais com
                clientes para determinar se eles usariam e pagariam pelo que você está propondo.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="solution-prototyping">
                  <AccordionTrigger className="font-medium">{t('leanStartup.solutionPrototyping')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.solutionPrototypingDesc')}
                    </p>
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.prototypingMethods')}</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Protótipos de papel para testes iniciais</li>
                        <li>Wireframes clicáveis usando ferramentas de design</li>
                        <li>Landing pages que descrevem a solução</li>
                        <li>Vídeos de demonstração mostrando o conceito</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="solution-experiments">
                  <AccordionTrigger className="font-medium">{t('leanStartup.solutionExperiments')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.solutionExperimentsDesc')}
                    </p>
                    <div className="mt-4 bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">{t('leanStartup.experimentTypes')}</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Testes de fumaça (pré-venda antes de construir)</li>
                        <li>Serviços de concierge (entregando valor manualmente)</li>
                        <li>Testes de porta falsa (oferecendo recursos que ainda não existem)</li>
                        <li>Testes A/B comparando diferentes soluções</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="mr-2 h-5 w-5 text-yellow-500" />
              {t('leanStartup.mvpTesting')}
            </CardTitle>
            <CardDescription>
              {t('leanStartup.mvpTestingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                A fase de MVP envolve construir uma versão mínima mas funcional do seu produto
                para coletar dados reais de usuários e validar seu modelo de negócios no mercado.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="building-mvp">
                  <AccordionTrigger className="font-medium">{t('leanStartup.buildingMvp')}</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      {t('leanStartup.buildingMvpDesc')}
                    </p>
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Dicas para MVP eficaz:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Defina seu conjunto mínimo de recursos (MFS)</li>
                        <li>Prefira disponibilização rápida à perfeição</li>
                        <li>Comece com um público-alvo específico</li>
                        <li>Use ferramentas e templates para economizar tempo</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="measuring-mvp">
                  <AccordionTrigger className="font-medium">Medindo o Sucesso do MVP</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Estabeleça métricas claras para avaliar o desempenho do seu MVP. Concentre-se em métricas
                      acionáveis que informam decisões e indicam progresso real no mercado.
                    </p>
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Métricas-chave para avaliar:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Taxa de aquisição de usuários</li>
                        <li>Engajamento dos usuários e ativação</li>
                        <li>Taxa de retenção após 7 e 30 dias</li>
                        <li>Métricas de referência e orgânicas</li>
                        <li>Conversão para pagamento (se aplicável)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
              Fase de Crescimento
            </CardTitle>
            <CardDescription>
              Ampliar o alcance após validar o encaixe produto-mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Após validar que seu produto resolve um problema real e demonstrar tração, você
                pode focar na otimização, escalabilidade e crescimento sustentável do negócio.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="growth-engines">
                  <AccordionTrigger className="font-medium">Motores de Crescimento</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Os motores de crescimento são mecanismos que impulsionam o crescimento sustentável.
                      A maioria das startups bem-sucedidas se concentra em um tipo principal de motor de crescimento.
                    </p>
                    <div className="mt-4 bg-purple-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Três principais motores:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Motor Viral</span>: Crescimento através de referência de clientes
                          (coeficiente viral &gt; 1)
                        </li>
                        <li>
                          <span className="font-medium">Motor Pago</span>: Crescimento através de publicidade paga
                          (margem de lucro &gt; custo de aquisição)
                        </li>
                        <li>
                          <span className="font-medium">Motor Aderente</span>: Crescimento através de alta retenção
                          (taxa de aquisição &gt; taxa de abandono)
                        </li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="growth-metrics">
                  <AccordionTrigger className="font-medium">Framework AARRR</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      O framework de métricas AARRR (também conhecido como "métricas piratas") divide o processo
                      de crescimento em estágios mensuráveis para que você possa otimizar cada um.
                    </p>
                    <div className="mt-4 bg-purple-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Estágios do AARRR:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><span className="font-medium">Aquisição</span>: Como os usuários encontram você</li>
                        <li><span className="font-medium">Ativação</span>: Quão boa é a primeira experiência</li>
                        <li><span className="font-medium">Retenção</span>: Usuários voltam e continuam usando</li>
                        <li><span className="font-medium">Referência</span>: Usuários recomendam a outros</li>
                        <li><span className="font-medium">Receita</span>: Usuários pagam ou geram valor</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeanStartupPage;
