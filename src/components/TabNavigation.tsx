
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

const TabNavigation = ({ tabs, activeTab, onChange, className }: TabNavigationProps) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-subtle p-1 flex overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300 ease-out mx-0.5',
              'focus:outline-none focus:ring-2 focus:ring-validation-blue-200',
              isActive
                ? 'bg-validation-blue-50 text-validation-blue-600'
                : 'text-validation-gray-600 hover:text-validation-gray-900 hover:bg-validation-gray-100'
            )}
          >
            <Icon className={cn("h-4 w-4 mr-2", isActive ? "text-validation-blue-600" : "text-validation-gray-400")} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
