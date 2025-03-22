
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PivotDecisionSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Pivot Decision Framework</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">When to Persist</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Core value hypothesis is validated</li>
              <li>Engagement metrics trending positively</li>
              <li>Customer acquisition cost decreasing</li>
              <li>Validated path to sustainable unit economics</li>
              <li>Customer feedback validates product direction</li>
              <li>Retention metrics meet or exceed targets</li>
              <li>Growth rate is steady or accelerating</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When to Pivot</h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Core value hypothesis invalidated</li>
              <li>Engagement persistently below targets</li>
              <li>High acquisition costs with no downward trend</li>
              <li>Conversion rates below viability thresholds</li>
              <li>Customer feedback indicates fundamental mismatch</li>
              <li>Retention metrics consistently below targets</li>
              <li>Multiple experiments fail to improve key metrics</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PivotDecisionSection;
