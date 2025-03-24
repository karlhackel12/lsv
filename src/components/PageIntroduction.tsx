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
  return <Card className={`mb-6 border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/50 ${className}`}>
      
    </Card>;
};
export default PageIntroduction;