
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import InfoTooltip from '@/components/InfoTooltip';

export type BestPractice = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

interface BestPracticesCardProps {
  title: string;
  color?: string;
  tooltip?: string;
  practices: BestPractice[];
}

/**
 * A standardized best practices card component that can be used across all validation phases
 */
const BestPracticesCard = ({ title, color = "blue", tooltip, practices }: BestPracticesCardProps) => {
  // Determine color classes based on provided color name
  const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, { border: string, bg: string, text: string }> = {
      blue: { border: 'border-blue-100', bg: 'bg-blue-50/30', text: 'text-blue-500' },
      green: { border: 'border-green-100', bg: 'bg-green-50/30', text: 'text-green-500' },
      yellow: { border: 'border-yellow-100', bg: 'bg-yellow-50/30', text: 'text-yellow-500' },
      cyan: { border: 'border-cyan-100', bg: 'bg-cyan-50/30', text: 'text-cyan-500' },
      indigo: { border: 'border-indigo-100', bg: 'bg-indigo-50/30', text: 'text-indigo-500' },
      pink: { border: 'border-pink-100', bg: 'bg-pink-50/30', text: 'text-pink-500' },
    };

    return colorMap[colorName] || colorMap.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card className={`${colorClasses.border} ${colorClasses.bg}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          {title}
          {tooltip && (
            <InfoTooltip 
              content={tooltip} 
              className="ml-2"
            />
          )}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practices.map((practice, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-3 mt-1">
                {React.cloneElement(practice.icon as React.ReactElement, { 
                  className: `h-5 w-5 ${colorClasses.text}`
                })}
              </div>
              <div>
                <p className="font-medium text-sm">{practice.title}</p>
                <p className="text-sm text-gray-600">{practice.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BestPracticesCard;
