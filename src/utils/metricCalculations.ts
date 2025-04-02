
/**
 * Utilities for metric calculations and formatting
 */

// Calculate the status of a metric based on current and target values
export const calculateMetricStatus = (current: string | null, target: string): 'success' | 'warning' | 'error' | 'not-started' => {
  if (!current || current === '0') return 'not-started';
  
  const currentValue = parseFloat(current);
  const targetValue = parseFloat(target);
  
  // If it's a percentage that already includes the % sign, remove it
  const cleanCurrent = current.endsWith('%') ? current.slice(0, -1) : current;
  const cleanTarget = target.endsWith('%') ? target.slice(0, -1) : target;
  
  const cleanCurrentValue = parseFloat(cleanCurrent);
  const cleanTargetValue = parseFloat(cleanTarget);
  
  if (isNaN(cleanCurrentValue) || isNaN(cleanTargetValue)) return 'not-started';
  
  // Simple comparison: assume higher is better initially, but this can be customized
  const ratio = cleanCurrentValue / cleanTargetValue;
  
  if (ratio >= 1) return 'success';
  if (ratio >= 0.7) return 'warning';
  return 'error';
};

// Format metric values based on type and unit
export const formatMetricValue = (value: string | number, unit?: string): string => {
  if (value === null || value === undefined) return '-';
  
  // Convert to string if it's a number
  const stringValue = typeof value === 'number' ? value.toString() : value;
  
  // Format based on unit if provided
  if (unit === 'currency') {
    return `$${stringValue}`;
  } else if (unit === 'percentage') {
    return `${stringValue}%`;
  }
  
  // Default format - check if it already has a % sign
  return stringValue.endsWith('%') ? stringValue : stringValue;
};

// Check if a metric is in warning or error status
export const isMetricAtRisk = (status: string): boolean => {
  return status === 'warning' || status === 'error' || status === 'at-risk' || status === 'off-track';
};

// Convert between regular and growth metric types
export const convertValidationToGrowthMetric = (
  validationMetric: any,
  projectId: string,
): any => {
  return {
    name: validationMetric.name,
    description: validationMetric.description || '',
    category: validationMetric.category,
    current_value: parseFloat(validationMetric.current || '0'),
    target_value: parseFloat(validationMetric.target),
    unit: 'number', // Default unit
    status: validationMetric.status === 'success' ? 'on-track' : 
            validationMetric.status === 'warning' ? 'at-risk' : 'off-track',
    project_id: projectId
  };
};

export const convertGrowthToValidationMetric = (
  growthMetric: any,
  projectId: string,
): any => {
  return {
    name: growthMetric.name,
    description: growthMetric.description || '',
    category: growthMetric.category,
    current: growthMetric.current_value.toString(),
    target: growthMetric.target_value.toString(),
    status: growthMetric.status === 'on-track' ? 'success' : 
            growthMetric.status === 'at-risk' ? 'warning' : 'error',
    project_id: projectId
  };
};
