
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Info, DollarSign, TrendingUp, LineChart } from 'lucide-react';

interface CoreMetricsRecommendationProps {
  metrics: any[];
  createCoreMetric: (metricType: 'cac' | 'ltv' | 'conversion') => Promise<void>;
}

const CoreMetricsRecommendation = ({ metrics, createCoreMetric }: CoreMetricsRecommendationProps) => {
  const areCoreMetricsPresent = () => {
    const hasCac = metrics.some(m => 
      m.name.toLowerCase().includes('cac') || 
      (m.category === 'acquisition' && m.name.includes('Acquisition Cost'))
    );
    
    const hasLtv = metrics.some(m => 
      m.name.toLowerCase().includes('ltv') || 
      (m.category === 'revenue' && m.name.includes('Lifetime Value'))
    );
    
    const hasConversion = metrics.some(m => 
      m.name.toLowerCase().includes('conversion rate') || 
      m.category === 'conversion'
    );
    
    return hasCac && hasLtv && hasConversion;
  };

  if (areCoreMetricsPresent()) {
    return null;
  }

  return (
    <Card className="bg-amber-50 border-amber-100 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Core Metrics Missing</h3>
            <p className="text-sm text-amber-700 mt-1">
              To properly assess your growth and scaling readiness, you should track the following core metrics:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {!metrics.some(m => m.name.toLowerCase().includes('cac') || m.category === 'acquisition') && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => createCoreMetric('cac')}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  Add CAC Metric
                </Button>
              )}
              {!metrics.some(m => m.name.toLowerCase().includes('ltv') || (m.category === 'revenue' && m.name.includes('Lifetime'))) && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => createCoreMetric('ltv')}
                >
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  Add LTV Metric
                </Button>
              )}
              {!metrics.some(m => m.name.toLowerCase().includes('conversion') || m.category === 'conversion') && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                  onClick={() => createCoreMetric('conversion')}
                >
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  Add Conversion Rate
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoreMetricsRecommendation;
