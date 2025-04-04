
import { useCallback } from 'react';
import { translations } from '@/components/ui/translation-constants';

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
    const keys = path.split('.');
    let value: any = translations;
    
    for (const key of keys) {
      if (value === undefined || value[key] === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
      value = value[key];
    }
    
    return value;
  }, []);

  /**
   * Retrocompatibilidade com o acesso direto à propriedade t
   * Esta abordagem permite acessar traduções como t.validation.solution.title
   */
  const tProxy = new Proxy({} as any, {
    get: (target, prop) => {
      // Se a propriedade não existe no objeto translations, retorna um novo proxy
      if (typeof prop === 'string' && prop !== 'toString' && prop !== 'valueOf') {
        return new Proxy({} as any, {
          get: (subTarget, subProp) => {
            // Agora temos a 2ª parte do caminho
            if (typeof subProp === 'string' && subProp !== 'toString' && subProp !== 'valueOf') {
              return new Proxy({} as any, {
                get: (finalTarget, finalProp) => {
                  // Agora temos o caminho completo path.subPath.finalPath
                  if (typeof finalProp === 'string' && finalProp !== 'toString' && finalProp !== 'valueOf') {
                    const fullPath = `${prop}.${subProp}.${finalProp}`;
                    return t(fullPath);
                  }
                  return undefined;
                }
              });
            }
            return undefined;
          }
        });
      }
      return undefined;
    }
  });

  /**
   * Retorna a função de tradução e o objeto completo de traduções para acesso direto
   * @returns The translation function and complete translations object
   */
  return { 
    t, 
    translations,
    // Support for dot notation access via proxy
    tProxy
  };
}

export default useTranslation;
