
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MVPFeature, TEMPLATE_FEATURE_PRIORITY } from '@/types/database';

export interface CurrentlyWorkingOnProps {
  features: MVPFeature[];
}

const CurrentlyWorkingOn = ({ features }: CurrentlyWorkingOnProps) => {
  // Filter to get just the features that are in progress
  const inProgressFeatures = features.filter(
    (feature) => feature.status === 'in-progress'
  );

  if (inProgressFeatures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currently Working On</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No features are currently in progress.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currently Working On</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {inProgressFeatures.map((feature, index) => (
          <React.Fragment key={feature.id}>
            {index > 0 && <Separator className="my-4" />}
            <div>
              <p className="font-medium">{feature.feature}</p>
              <div className="mt-1">
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  feature.priority === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : feature.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                }`}>
                  {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                </span>
              </div>
              {feature.notes && (
                <p className="text-sm text-muted-foreground mt-2">{feature.notes}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {TEMPLATE_FEATURE_PRIORITY[feature.priority]}
              </p>
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default CurrentlyWorkingOn;
