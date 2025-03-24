import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, GitBranch, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { Metric, ScalingReadinessMetric } from '@/types/database';
const PivotDecisionSection = () => {
  const navigate = useNavigate();
  const {
    currentProject
  } = useProject();
  const [metricsAtRisk, setMetricsAtRisk] = useState<ScalingReadinessMetric[]>([]);
  const [regularMetricsAtRisk, setRegularMetricsAtRisk] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!currentProject?.id) return;
      setIsLoading(true);
      try {
        // Fetch scaling readiness metrics that are in warning or failure state
        const {
          data: scalingData,
          error: scalingError
        } = await supabase.from('scaling_readiness_metrics').select('*').eq('project_id', currentProject.id).in('status', ['warning', 'failed']);
        if (scalingError) throw scalingError;

        // Fetch regular metrics that are in warning or error state
        const {
          data: metricsData,
          error: metricsError
        } = await supabase.from('metrics').select('*').eq('project_id', currentProject.id).in('status', ['warning', 'error']);
        if (metricsError) throw metricsError;
        setMetricsAtRisk(scalingData || []);
        setRegularMetricsAtRisk(metricsData || []);
      } catch (error) {
        console.error('Error fetching metrics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetricsData();
  }, [currentProject?.id]);
  const totalMetricsAtRisk = metricsAtRisk.length + regularMetricsAtRisk.length;
  const getStatusColor = (status: string) => {
    if (status === 'failed' || status === 'error') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (status === 'warning') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  return;
};
export default PivotDecisionSection;