# Guia de Tradução da Aplicação LSV

Este guia explica como implementar o sistema de tradução para todos os componentes da aplicação Lean Startup Validator (LSV).

## Estrutura de Tradução

1. **Arquivos principais**:
   - `src/components/ui/translation-constants.ts`: Contém todas as strings da aplicação organizadas por seções
   - `src/hooks/use-translation.ts`: Hook para utilizar as traduções em componentes

## Como Usar o Sistema de Tradução

### 1. Importar o hook `useTranslation`

```tsx
import { useTranslation } from '@/hooks/use-translation';

const MeuComponente = () => {
  const { t } = useTranslation();
  
  return (
    <Button>{t('common.save')}</Button>
  );
};
```

### 2. Organização das chaves de tradução

As chaves são organizadas em formato de caminho, separadas por ponto, como `section.key`:

```
navigation.dashboard    // "Dashboard"
auth.login             // "Entrar"
common.save            // "Salvar"
```

### 3. Modificando Componentes Existentes

Para traduzir um componente existente:

1. Importe o hook `useTranslation`
2. Substitua textos estáticos por chamadas à função `t()`
3. Não esqueça de textos em placeholders, títulos e descrições

Exemplo:

```tsx
// Antes
<Button>Save</Button>

// Depois
<Button>{t('common.save')}</Button>
```

## Traduzindo Novos Componentes

Para novos componentes:

1. Adicione as chaves necessárias em `translation-constants.ts` na seção apropriada
2. Use o hook `useTranslation` no componente
3. Use as chaves de tradução para todos os textos visíveis

## Adicionando Novas Traduções

Para adicionar novas strings que não existem no arquivo de traduções:

1. Abra `src/components/ui/translation-constants.ts`
2. Adicione a nova chave na seção apropriada ou crie uma nova seção se necessário
3. Mantenha a organização e os nomes das chaves consistentes (camelCase)

## Componentes Já Traduzidos

Os seguintes componentes já utilizam o sistema de tradução:

- `MainNavigation.tsx`
- `Auth.tsx`
- `GrowthPage.tsx`
- `HypothesisForm.tsx`
- `MVPFeatureForm.tsx`
- `StructuredHypothesisForm.tsx`

## Passos para Tradução Completa

Para completar a tradução da aplicação:

1. **Páginas Principais**
   - Implemente a tradução em todas as páginas principais
   - Priorize telas frequentemente utilizadas pelos usuários

2. **Componentes de UI**
   - Traduza componentes reutilizáveis como botões, formulários, modais
   - Atualize tooltips e mensagens de erro

3. **Mensagens do Sistema**
   - Atualize todas as mensagens do sistema, notificações e toasts

4. **Validações**
   - Traduza mensagens de validação de formulários

## Princípios de Tradução

1. **Consistência**: Use os mesmos termos para conceitos similares
2. **Clareza**: Priorize clareza sobre traduções literais
3. **Contexto**: Considere o contexto de uso de cada string
4. **Verificação**: Teste as traduções na interface para garantir que se encaixam bem nos elementos

---

Ao seguir este guia, garantimos que toda a aplicação terá uma experiência consistente em português para nossos usuários. 