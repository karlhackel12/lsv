
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
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              {isExpanded && (
                <div className="mt-1 text-gray-600 text-sm">{description}</div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PageIntroduction;
