
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, FlaskConical, List, BarChart, TrendingUp, GitBranch } from 'lucide-react';

const HelloPeople: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Estratégia Lean Startup para HelloPeople</CardTitle>
          <CardDescription>
            Plataforma para professores independentes de inglês que desejam melhorar a retenção de conhecimento dos alunos
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="problem" className="space-y-4">
        <TabsList className="grid grid-cols-6 md:w-fit w-full">
          <TabsTrigger value="problem" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Problema</span>
          </TabsTrigger>
          <TabsTrigger value="solution" className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Solução</span>
          </TabsTrigger>
          <TabsTrigger value="mvp" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">MVP</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Canais</span>
          </TabsTrigger>
          <TabsTrigger value="pivots" className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Pivots</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="problem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hipóteses de Problema</CardTitle>
              <CardDescription>Suposições sobre o problema que precisam ser validadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold">Hipótese 1: Insuficiência do Tempo em Sala de Aula</h3>
                <p className="text-sm text-gray-700"><strong>Afirmação:</strong> Professores independentes de inglês no Brasil enfrentam uma limitação crítica onde 1-2 horas semanais são insuficientes para o domínio efetivo do idioma.</p>
                <p className="text-sm text-gray-700"><strong>Experimento:</strong> Pesquisa online com 100+ professores independentes usando formulários estruturados.</p>
                <p className="text-sm text-gray-700"><strong>Critério de Sucesso:</strong> Mais de 50% dos professores identificam a limitação de tempo em sala como um dos 3 principais problemas.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Hipótese 2: Dificuldade de Manutenção da Prática Consistente</h3>
                <p className="text-sm text-gray-700"><strong>Afirmação:</strong> Alunos de inglês no Brasil têm dificuldade em manter práticas consistentes entre as aulas.</p>
                <p className="text-sm text-gray-700"><strong>Experimento:</strong> Pesquisa online com alunos + análise de dados secundários sobre padrões de estudo.</p>
                <p className="text-sm text-gray-700"><strong>Critério de Sucesso:</strong> Mais de 60% dos alunos reportam prática inconsistente (menos de 3 vezes/semana).</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hipóteses de Solução</CardTitle>
              <CardDescription>Suposições sobre a solução que precisam ser validadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold">Hipótese 1: Eficácia da Repetição Espaçada</h3>
                <p className="text-sm text-gray-700"><strong>Afirmação:</strong> A implementação de um sistema de repetição espaçada aumentará a retenção de vocabulário dos alunos em pelo menos 25% comparado com métodos tradicionais.</p>
                <p className="text-sm text-gray-700"><strong>Experimento:</strong> MVP com funcionalidade de repetição espaçada testada com um grupo inicial de alunos (comparando desempenho antes/depois).</p>
                <p className="text-sm text-gray-700"><strong>Critério de Sucesso:</strong> Melhoria mensurável de 25% na retenção de vocabulário após 3 semanas de uso.</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Hipótese 2: Engajamento com Atividades Curtas Diárias</h3>
                <p className="text-sm text-gray-700"><strong>Afirmação:</strong> Alunos completarão consistentemente atividades curtas (5-15 minutos) quando estas forem personalizadas e gamificadas.</p>
                <p className="text-sm text-gray-700"><strong>Experimento:</strong> MVP com sistema de atividades diárias e elementos de gamificação.</p>
                <p className="text-sm text-gray-700"><strong>Critério de Sucesso:</strong> Taxa de conclusão diária de atividades acima de 60% durante período de teste.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mvp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Features para MVP</CardTitle>
              <CardDescription>Funcionalidades essenciais para testar as hipóteses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="space-y-1">
                  <h3 className="font-semibold">1. Sistema de Repetição Espaçada</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Implementação simplificada do algoritmo SM-2</li>
                    <li>Rastreamento do progresso de vocabulário</li>
                    <li>Reintrodução automática de conteúdo revisado</li>
                  </ul>
                </li>
                
                <li className="space-y-1">
                  <h3 className="font-semibold">2. Caminho de Prática Diária</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Atividades de 5-15 minutos</li>
                    <li>Visualização de progresso com jornada visual</li>
                    <li>Sistema de streaks e recompensas básicas</li>
                  </ul>
                </li>
                
                <li className="space-y-1">
                  <h3 className="font-semibold">3. Painel do Professor</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Criação/atribuição de atividades</li>
                    <li>Análise básica de engajamento dos alunos</li>
                    <li>Identificação de padrões de erro para reforço</li>
                  </ul>
                </li>
                
                <li className="space-y-1">
                  <h3 className="font-semibold">4. Sistema de Quiz Interativo</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Múltiplos formatos de perguntas</li>
                    <li>Correção automática</li>
                    <li>Adaptação de dificuldade baseada no desempenho</li>
                  </ul>
                </li>
                
                <li className="space-y-1">
                  <h3 className="font-semibold">5. Integração com WhatsApp</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Lembretes de atividades programadas</li>
                    <li>Alertas de streak</li>
                    <li>Notificações de progresso</li>
                  </ul>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics para Acompanhar</CardTitle>
              <CardDescription>Métricas-chave para rastrear o crescimento do negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold mb-2">1. Aquisição</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Taxa de cadastro de professores (meta: >20% dos leads)</li>
                    <li>Alunos adicionados por professor (meta: >5)</li>
                    <li>CAC por professor (meta: &lt;R$250)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">2. Ativação</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Taxa de conclusão de onboarding de professores (meta: >85%)</li>
                    <li>Percentual de professores que criam primeira atividade (meta: >90%)</li>
                    <li>Tempo até primeira atribuição de conteúdo (meta: &lt;48 horas)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Retenção</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Taxa de alunos ativos diariamente (meta: >60%)</li>
                    <li>Duração média de streak de alunos (meta: >5 dias)</li>
                    <li>Taxa de retenção de professores (meta: >80%)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Receita</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Taxa de conversão de alunos para plano pago (meta: >60%)</li>
                    <li>LTV:CAC ratio (meta: >3:1)</li>
                    <li>Receita média por professor (meta: >R$120/mês)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">5. Referral</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    <li>Taxa de referência de professor para professor (meta: >0.5)</li>
                    <li>Taxa de compartilhamento de conquistas pelos alunos (meta: >15%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Canais de Aquisição</CardTitle>
              <CardDescription>Estratégias para adquirir novos usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Canal 1: TikTok e Instagram com Micro-Influenciadores</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Estratégia:</strong> Parcerias com professores de inglês influenciadores (1K-10K seguidores) para criar conteúdo autêntico demonstrando melhorias tangíveis na fluência dos alunos.</p>
                  
                  <div>
                    <p><strong>Táticas:</strong></p>
                    <ul className="list-disc pl-5">
                      <li>Formato de "antes e depois" mostrando progresso de alunos</li>
                      <li>Demonstrações da economia de tempo para professores</li>
                      <li>Showcase de funcionalidades de gamificação e streaks</li>
                      <li>Exemplos de ganhos de comissão para professores</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p><strong>KPIs:</strong></p>
                    <ul className="list-disc pl-5">
                      <li>CPL (Custo por Lead) de professor: &lt;R$50</li>
                      <li>Taxa de conversão de visualização para cadastro: >2%</li>
                      <li>CAC via influenciadores: &lt;R$200</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Canal 2: Comunidades de WhatsApp</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Estratégia:</strong> Participação ativa em grupos de WhatsApp existentes de professores de inglês independentes no Brasil.</p>
                  
                  <div>
                    <p><strong>Táticas:</strong></p>
                    <ul className="list-disc pl-5">
                      <li>Criação de grupos específicos para professores interessados em tecnologia educacional</li>
                      <li>Programa de embaixadores onde professores pioneiros recebem benefícios</li>
                      <li>Webinars e demonstrações exclusivas</li>
                      <li>Programa de indicação com incentivo financeiro</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p><strong>KPIs:</strong></p>
                    <ul className="list-disc pl-5">
                      <li>Número de grupos ativos: >20</li>
                      <li>Membros ativos por grupo: >50</li>
                      <li>Taxa de conversão de membro para usuário: >5%</li>
                      <li>CAC via WhatsApp: &lt;R$150</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pivots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Possibilidades de Pivot e Triggers</CardTitle>
              <CardDescription>Potenciais mudanças estratégicas baseadas em resultados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-semibold">Pivot 1: Segmento de Cliente (de Professores Independentes para Escolas)</h3>
                <p className="text-sm text-gray-700"><strong>Descrição:</strong> Mover o foco para vender diretamente para escolas de idiomas estabelecidas.</p>
                
                <div className="text-sm text-gray-700">
                  <p><strong>Triggers:</strong></p>
                  <ul className="list-disc pl-5">
                    <li>CAC para professores independentes consistentemente >R$300</li>
                    <li>Média de alunos por professor &lt;3</li>
                    <li>Recebimento de interesse não solicitado de mais de 5 escolas de idiomas</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Pivot 2: Modelo de Captura de Valor (de Assinatura de Aluno para Assinatura de Professor)</h3>
                <p className="text-sm text-gray-700"><strong>Descrição:</strong> Mudar de um modelo onde alunos pagam para um modelo onde professores pagam uma assinatura mensal.</p>
                
                <div className="text-sm text-gray-700">
                  <p><strong>Triggers:</strong></p>
                  <ul className="list-disc pl-5">
                    <li>Taxa de conversão de alunos para plano pago &lt;50%</li>
                    <li>Feedback consistente de professores dispostos a pagar diretamente</li>
                    <li>Custo de processamento de múltiplos pagamentos pequenos impactando margens</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Pivot 3: Zoom-in Pivot (Foco Exclusivo em Repetição Espaçada)</h3>
                <p className="text-sm text-gray-700"><strong>Descrição:</strong> Especializar a plataforma exclusivamente no sistema de repetição espaçada.</p>
                
                <div className="text-sm text-gray-700">
                  <p><strong>Triggers:</strong></p>
                  <ul className="list-disc pl-5">
                    <li>>80% do engajamento concentrado no módulo de repetição espaçada</li>
                    <li>Melhoria na retenção de vocabulário >50% comparado com grupo controle</li>
                    <li>Feedback de professores valorizando principalmente esta funcionalidade</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelloPeople;
