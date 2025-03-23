
/**
 * Utility functions for metric-related calculations
 */

/**
 * Calculate the status of a metric based on its current value and thresholds
 * 
 * @param current The current value of the metric
 * @param target The target value of the metric
 * @param warningThreshold The warning threshold
 * @param errorThreshold The error threshold
 * @returns The calculated status: 'success', 'warning', 'error', or 'not-started'
 */
export const calculateMetricStatus = (
  current: string | null,
  target: string,
  warningThreshold?: string,
  errorThreshold?: string
): 'success' | 'warning' | 'error' | 'not-started' => {
  if (!current) return 'not-started';
  
  // Handle percentage values and other formats
  const normalizeValue = (val: string): number => {
    if (val.includes('%')) {
      return parseFloat(val.replace('%', ''));
    }
    return parseFloat(val);
  };

  try {
    const currentNum = normalizeValue(current);
    const targetNum = normalizeValue(target);
    
    // If no thresholds are provided, we'll just compare directly with target
    if (!warningThreshold || !errorThreshold) {
      // If current value is within 10% of target, consider it a warning
      const warningValue = targetNum * 0.9; // 90% of target
      
      if (currentNum >= targetNum) return 'success';
      if (currentNum >= warningValue) return 'warning';
      return 'error';
    }
    
    // With explicit thresholds
    const warningNum = normalizeValue(warningThreshold);
    const errorNum = normalizeValue(errorThreshold);
    
    // Different logic based on if higher or lower numbers are better
    const isHigherBetter = targetNum > 0 && targetNum > errorNum;
    
    if (isHigherBetter) {
      // For metrics where higher is better (e.g., conversion rate)
      if (currentNum >= targetNum) return 'success';
      if (currentNum >= warningNum) return 'warning';
      return 'error';
    } else {
      // For metrics where lower is better (e.g., cost per acquisition)
      if (currentNum <= targetNum) return 'success';
      if (currentNum <= warningNum) return 'warning';
      return 'error';
    }
  } catch (e) {
    console.log('Error calculating status:', e);
    return 'not-started';
  }
};

/**
 * Format a metric value for display
 * 
 * @param value The raw value
 * @param includeSymbol Whether to include % or $ symbol
 * @returns Formatted value string
 */
export const formatMetricValue = (value: string | null, includeSymbol = true): string => {
  if (!value) return 'N/A';
  
  // Already has a symbol like % or $
  if (includeSymbol && (value.includes('%') || value.includes('$'))) {
    return value;
  }
  
  // Try to parse and format number
  try {
    const num = parseFloat(value);
    return num.toLocaleString();
  } catch (e) {
    return value;
  }
};

/**
 * Map category string to specific experiment categories
 * 
 * @param category Raw category string from database
 * @returns Typed category or original string if not matching
 */
export const normalizeExperimentCategory = (
  category: string | null
): 'problem' | 'solution' | 'business-model' | string | null => {
  if (!category) return null;
  
  switch (category.toLowerCase()) {
    case 'problem':
      return 'problem';
    case 'solution':
      return 'solution';
    case 'business-model':
    case 'business model':
    case 'businessmodel':
      return 'business-model';
    default:
      return category;
  }
};
