# Padrão de Formulários LSV

Este documento descreve o padrão a ser seguido para implementação de formulários no sistema LSV.

## Princípios

1. Todos os formulários devem abrir da direita para a esquerda
2. Todas as animações devem ser suaves e consistentes
3. Os botões e labels devem estar em português
4. O layout deve ser consistente em todos os formulários

## Como implementar

### 1. Utilize o componente FormController

Em vez de usar o `FormSheet` diretamente, utilize o componente `FormController`:

```tsx
import { FormController } from '@/components/ui/form-controller';

// Em seu componente
return (
  <FormController
    isOpen={isOpen}
    onClose={onClose}
    title="Título do Formulário"
    description="Descrição opcional do formulário"
  >
    {/* Conteúdo do formulário */}
  </FormController>
);
```

### 2. Traduza os botões e labels

Todos os textos de interface devem estar em português:

```tsx
<Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
<Button type="submit">{isEditing ? 'Atualizar' : 'Criar'}</Button>
```

### 3. Exemplo completo

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormController } from '@/components/ui/form-controller';

const MeuFormulario = ({ isOpen, onClose }) => {
  // Lógica do formulário
  
  return (
    <FormController
      isOpen={isOpen}
      onClose={onClose}
      title="Meu Formulário"
      description="Descrição do formulário"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Campos do formulário */}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Form>
    </FormController>
  );
};
```

## Checklist de migração

Para migrar os formulários existentes:

1. Importe o `FormController` em vez do `FormSheet`
2. Substitua o componente `FormSheet` por `FormController` no JSX
3. Traduza os textos dos botões e labels para português
4. Certifique-se de que todos os parâmetros estão sendo passados corretamente

## Benefícios

- Experiência consistente para o usuário
- Animações suaves e padronizadas
- Manutenção simplificada
- Interface em português, adequada para o público-alvo 