
import React from 'react';
import { Rocket, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyPlanStateProps {
  onCreatePlan: () => void;
}

const EmptyPlanState: React.FC<EmptyPlanStateProps> = ({ onCreatePlan }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Rocket className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Scaling Plan Yet</h3>
        <p className="text-center text-gray-500 mb-6 max-w-md">
          Create a structured scaling plan to prepare your startup for growth
        </p>
        <Button onClick={onCreatePlan}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Scaling Plan
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPlanState;
