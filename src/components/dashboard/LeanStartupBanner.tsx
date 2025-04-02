
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const LeanStartupBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-800 mb-2">
        Lean Startup Validation Progress
      </h2>
      <div className="w-full">
        <Progress value={65} className="h-4 bg-gray-200" indicatorClassName="bg-validation-green-600" />
      </div>
    </div>
  );
};

export default LeanStartupBanner;
