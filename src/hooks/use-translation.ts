
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
   * Create a complete translation object with nested structure
   */
  const translationObject = {
    validation: {
      problem: {
        title: 'Problem Validation',
        description: 'Create and test hypotheses to validate if your target customers have the problem you think they have.',
        bestPractices: {
          targetCustomers: {
            title: 'Identify Target Customers',
            description: 'Define who your potential customers are and what problems they face'
          },
          conductInterviews: {
            title: 'Conduct Customer Interviews',
            description: 'Talk to potential customers to understand their pain points'
          },
          testHypotheses: {
            title: 'Test Your Hypotheses',
            description: 'Validate whether your assumptions about customer problems are correct'
          }
        },
        checklist: {
          hypothesesCreated: {
            label: 'Problem Hypotheses Created',
            description: 'Create hypotheses about customer problems'
          },
          interviewsConducted: {
            label: 'Customer Interviews Conducted',
            description: 'Interview potential customers to understand their problems'
          },
          painPointsIdentified: {
            label: 'Pain Points Identified',
            description: 'Identify key pain points from customer interviews'
          },
          marketNeedValidated: {
            label: 'Market Need Validated',
            description: 'Validate that there is a significant market need'
          }
        }
      },
      solution: {
        title: 'Solution Validation',
        description: 'Test whether your proposed solution effectively addresses the validated problem.',
        bestPractices: {
          sketchSolutions: {
            title: 'Sketch Solution Ideas',
            description: 'Create sketches or prototypes to visualize your solutions'
          },
          testWithCustomers: {
            title: 'Test with Real Customers',
            description: 'Validate your solution with potential customers through interviews or prototypes'
          },
          iterateBasedOnFeedback: {
            title: 'Iterate Based on Feedback',
            description: 'Refine your solution based on customer feedback'
          }
        },
        checklist: {
          solutionHypothesesCreated: {
            label: 'Solution Hypotheses Created',
            description: 'Create hypotheses about your solution'
          },
          solutionSketchesCreated: {
            label: 'Solution Sketches Created',
            description: 'Create sketches or prototypes of your solution'
          },
          customerTestingConducted: {
            label: 'Customer Testing Conducted',
            description: 'Test your solution with potential customers'
          },
          customerFeedbackImplemented: {
            label: 'Customer Feedback Implemented',
            description: 'Implement feedback received from customers'
          }
        }
      },
      progress: {
        updated: 'Progress Updated',
        completed: 'marked as completed',
        incomplete: 'marked as incomplete',
        warning: {
          title: 'Warning',
          saveFailed: 'Failed to save progress update'
        }
      }
    },
    hypotheses: {
      problemHypotheses: 'Problem Hypotheses',
      solutionHypotheses: 'Solution Hypotheses'
    },
    common: {
      bestPractices: 'Best Practices',
      progressChecklist: 'Progress Checklist'
    }
  };

  return { 
    t, 
    translations,
    // Support for object-style access to translations
    ...translationObject
  };
}

export default useTranslation;
