
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type MilestoneStatus = 'in-progress' | 'pending' | 'not-started' | 'completed';

interface MilestoneProps {
  title: string;
  description: string;
  step: string;
  status: MilestoneStatus;
  progress: number;
}

const getStatusColor = (status: MilestoneStatus) => {
  switch (status) {
    case 'in-progress':
      return {
        badge: 'bg-green-100 text-green-800',
        progress: 'bg-validation-green-600',
      };
    case 'pending':
      return {
        badge: 'bg-yellow-100 text-yellow-800',
        progress: 'bg-validation-yellow-500',
      };
    case 'completed':
      return {
        badge: 'bg-blue-100 text-blue-800',
        progress: 'bg-validation-blue-600',
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-800',
        progress: 'bg-validation-gray-400',
      };
  }
};

const Milestone: React.FC<MilestoneProps> = ({ title, description, step, status, progress }) => {
  const colors = getStatusColor(status);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge className={colors.badge}>
            {status === 'in-progress' ? 'In Progress' : 
             status === 'pending' ? 'Pending' : 
             status === 'completed' ? 'Completed' : 'Not Started'}
          </Badge>
          <span className="text-sm text-gray-500">{step}</span>
        </div>
        
        <h4 className="text-xl font-bold leading-tight tracking-tight text-gray-700 mb-2">
          {title}
        </h4>
        
        <p className="text-base text-gray-600 mb-4">
          {description}
        </p>
        
        <div className="mt-2">
          <Progress 
            value={progress} 
            className="h-2 bg-gray-200" 
            indicatorClassName={colors.progress} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

const MilestoneCards = () => {
  const milestones = [
    {
      title: 'Problem Validation',
      description: 'Identify and validate customer pain points through interviews and surveys.',
      step: 'Step 1/3',
      status: 'in-progress' as MilestoneStatus,
      progress: 80,
    },
    {
      title: 'Solution Testing',
      description: 'Test proposed solutions with minimum viable product (MVP).',
      step: 'Step 2/3',
      status: 'pending' as MilestoneStatus,
      progress: 40,
    },
    {
      title: 'Market Fit Analysis',
      description: 'Analyze product-market fit metrics and customer feedback.',
      step: 'Step 3/3',
      status: 'not-started' as MilestoneStatus,
      progress: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {milestones.map((milestone, index) => (
        <Milestone key={index} {...milestone} />
      ))}
    </div>
  );
};

export default MilestoneCards;
