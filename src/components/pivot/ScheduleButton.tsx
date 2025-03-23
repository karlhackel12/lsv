
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScheduleButton = () => {
  return (
    <div className="flex justify-center mt-8">
      <Button 
        variant="outline" 
        className="bg-white border border-validation-gray-200 hover:bg-validation-gray-50 text-validation-gray-700 font-medium py-2.5 px-5 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Schedule Pivot/Persevere Meeting
      </Button>
    </div>
  );
};

export default ScheduleButton;
