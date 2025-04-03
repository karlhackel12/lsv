import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

export type ChecklistItem = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

interface ChecklistCardProps {
  title: string;
  color: string;
  items: ChecklistItem[];
}

/**
 * A standardized checklist card component that can be used across all validation phases
 */
const ChecklistCard = ({ title, color, items }: ChecklistCardProps) => {
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className={`h-5 w-5 ${colorClasses.text} mr-2`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.checked ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { 
                    className: `h-3 w-3 ${item.checked ? 'text-green-600' : 'text-gray-400'}`
                  })}
                </div>
                <Label htmlFor={item.key} className="font-medium">
                  {item.label}
                  <p className="text-xs text-gray-500 font-normal">{item.description}</p>
                </Label>
              </div>
              <Switch 
                id={item.key} 
                checked={item.checked}
                disabled={item.disabled}
                onCheckedChange={item.onCheckedChange}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistCard; 