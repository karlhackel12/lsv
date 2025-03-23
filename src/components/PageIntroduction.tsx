
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
  className = '',
}: PageIntroductionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className={`mb-6 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 ${className}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-full shadow-sm">
              {icon}
            </div>
            <h2 className="text-lg font-semibold text-blue-800">{title}</h2>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
            aria-label={isExpanded ? "Collapse description" : "Expand description"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 text-blue-700 space-y-2 text-sm animate-fadeIn">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageIntroduction;
