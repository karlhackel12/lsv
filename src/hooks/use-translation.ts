
import { useCallback } from 'react';
import { translations, t as tFunction } from '@/components/ui/translation-constants';

/**
 * Hook para gerenciar traduções na aplicação
 * Permite acessar as traduções de forma consistente em todos os componentes
 * 
 * @example
 * // No componente:
 * const { t } = useTranslation();
 * return <Button>{t('common.save')}</Button>;
 */
export function useTranslation() {
  /**
   * Function to access translations by path
   * @param path Path to the translation in dot notation
   * @returns Translated string or the path itself if translation is not found
   */
  const t = useCallback((path: string): string => {
    return tFunction(path);
  }, []);

  /**
   * Retorna a função de tradução e o objeto completo de traduções para acesso direto
   * @returns The translation function and complete translations object
   */
  return { t, translations };
}

export default useTranslation;
