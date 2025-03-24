
import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PageIntroductionProps {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const PageIntroduction = ({
  title,
  description,
  icon = <Info className="h-5 w-5 text-blue-500" />,
  className = ''
}: PageIntroductionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <Card className={`mb-6 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">{icon}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <div className={`mt-1 text-gray-600 transition-all ${isExpanded ? 'block' : 'hidden'}`}>
                {description}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PageIntroduction;
