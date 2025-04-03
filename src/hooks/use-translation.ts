import { useCallback } from 'react';
import { translations } from '@/components/ui/translation-constants';

/**
 * Hook para gerenciar traduções na aplicação
 * Permite acessar as traduções de forma consistente em todos os componentes
 * 
 * @example
 * // No componente:
 * const { t } = useTranslation();
 * return <Button>{t.common.save}</Button>;
 */
export function useTranslation() {
  /**
   * Retorna o objeto completo de traduções para acesso direto
   * @returns O objeto de traduções
   */
  return { t: translations };
}

export default useTranslation; 