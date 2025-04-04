
import { useCallback } from 'react';
import { translations } from '@/components/ui/translation-constants';

type ValidationProps = {
  problem: {
    hypotheses_created: boolean;
    customer_interviews_conducted: boolean;
    pain_points_identified: boolean;
    market_need_validated: boolean;
  };
  solution: {
    solution_hypotheses_defined: boolean;
    solution_sketches_created: boolean;
    tested_with_customers: boolean;
    positive_feedback_received: boolean;
  };
};

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
      if (value[key] === undefined) {
        console.warn(`Translation missing for key: ${path}`);
        return path;
      }
      value = value[key];
    }
    
    return value;
  }, []);

  // Add validation section helper for problem and solution validation
  const validation = {
    progress: {
      updated: translations.validation.progress.updated,
      completed: translations.validation.progress.completed,
      incomplete: translations.validation.progress.incomplete,
      warning: {
        title: translations.validation.progress.warning.title,
        saveFailed: translations.validation.progress.warning.saveFailed
      }
    },
    problem: {
      title: translations.validation.problem.title,
      description: translations.validation.problem.description,
      bestPractices: translations.validation.problem.bestPractices,
      checklist: translations.validation.problem.checklist
    },
    solution: {
      title: translations.validation.solution.title,
      description: translations.validation.solution.description,
      bestPractices: translations.validation.solution.bestPractices,
      checklist: translations.validation.solution.checklist
    }
  };

  // Return the updated translation hook with validation helpers
  return { 
    t, 
    translations,
    validation,
    hypotheses: translations.hypotheses,
    common: translations.common
  };
}

export default useTranslation;
