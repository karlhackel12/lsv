
import React from 'react';
import { MvpFeature } from '@/types/database';
import { Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CurrentlyWorkingOnProps {
  features: MvpFeature[];
}

const CurrentlyWorkingOn: React.FC<CurrentlyWorkingOnProps> = ({ features }) => {
  const inProgressFeatures = features.filter(f => f.status === 'in-progress');

  if (inProgressFeatures.length === 0) {
    return (
      <Card className="p-6 text-center bg-gray-50">
        <p className="text-gray-600">No features currently in progress.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inProgressFeatures.map(feature => (
        <Card key={feature.id} className="p-4 border-l-4 border-l-blue-500 animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{feature.feature}</h3>
              <p className="text-sm text-gray-600 mt-1">{feature.notes}</p>
            </div>
            <div className="flex items-center text-blue-600 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>In Progress</span>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <User className="h-4 w-4 mr-1" />
              <span>Development Team</span>
            </div>
            <div>
              <span>Priority: </span>
              <span className={`font-medium ${
                feature.priority === 'high' ? 'text-red-600' : 
                feature.priority === 'medium' ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CurrentlyWorkingOn;
