
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, FlaskConical, Layers, LineChart, GitFork, TrendingUp, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5 mr-2" />
  }, 
  {
    title: 'Problem Validation',
    href: '/dashboard/problem-validation',
    icon: <Lightbulb className="h-5 w-5 mr-2" />
  },
  {
    title: 'Solution Validation',
    href: '/dashboard/solution-validation',
    icon: <Lightbulb className="h-5 w-5 mr-2" />
  },
  {
    title: 'Experiments',
    href: '/dashboard/experiments',
    icon: <FlaskConical className="h-5 w-5 mr-2" />
  }, 
  {
    title: 'MVP',
    href: '/dashboard/mvp',
    icon: <Layers className="h-5 w-5 mr-2" />
  }, 
  {
    title: 'Metrics',
    href: '/dashboard/metrics',
    icon: <LineChart className="h-5 w-5 mr-2" />
  }, 
  {
    title: 'Growth',
    href: '/dashboard/growth',
    icon: <TrendingUp className="h-5 w-5 mr-2" />
  }, 
  {
    title: 'Pivot',
    href: '/dashboard/pivot',
    icon: <GitFork className="h-5 w-5 mr-2" />
  },
  {
    title: 'Lean Startup Guide',
    href: '/dashboard/lean-startup-methodology',
    icon: <BookOpen className="h-5 w-5 mr-2" />
  },
  {
    title: 'Business Plan',
    href: '/dashboard/business-plan',
    icon: <FileText className="h-5 w-5 mr-2" />
  }
];

const TopNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <nav className="border-b border-validation-gray-200 bg-validation-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-4 overflow-x-auto pb-1 hide-scrollbar">
          {mainNavItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                  isActive
                    ? "text-validation-blue-600 bg-validation-blue-50"
                    : "text-validation-gray-600 hover:text-validation-blue-600 hover:bg-validation-gray-100"
                )
              }
            >
              {item.icon}
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
