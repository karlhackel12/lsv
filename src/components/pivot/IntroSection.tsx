
import React from 'react';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PivotDecisionSection from '@/components/PivotDecisionSection';

interface IntroSectionProps {
  onCreateNew: () => void;
}

const IntroSection = ({ onCreateNew }: IntroSectionProps) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Pivot Framework</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pivot Option
        </Button>
      </div>
      
      <Card className="mb-8 p-6">
        <p className="text-validation-gray-600 text-lg">
          A pivot is a structured course correction designed to test a new fundamental hypothesis about the product, business model, or engine of growth.
        </p>
      </Card>
      
      <PivotDecisionSection />
    </>
  );
};

export default IntroSection;
