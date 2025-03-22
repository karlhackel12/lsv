
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MvpFeature } from '@/types/database';

export interface CurrentlyWorkingOnProps {
  features: MvpFeature[];
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
      <CardContent className="space-y-2">
        {inProgressFeatures.map((feature, index) => (
          <React.Fragment key={feature.id}>
            {index > 0 && <Separator className="my-2" />}
            <div>
              <p className="font-medium">{feature.feature}</p>
              {feature.notes && (
                <p className="text-sm text-muted-foreground">{feature.notes}</p>
              )}
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default CurrentlyWorkingOn;
