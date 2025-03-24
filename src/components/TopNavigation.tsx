
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  FlaskConical,
  Layers,
  LineChart,
  GitFork,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
  },
  {
    title: 'Hypotheses',
    href: '/hypotheses',
    icon: <Lightbulb className="h-5 w-5 mr-2" />,
  },
  {
    title: 'Experiments',
    href: '/experiments',
    icon: <FlaskConical className="h-5 w-5 mr-2" />,
  },
  {
    title: 'MVP',
    href: '/mvp',
    icon: <Layers className="h-5 w-5 mr-2" />,
  },
  {
    title: 'Metrics',
    href: '/metrics',
    icon: <LineChart className="h-5 w-5 mr-2" />,
  },
  {
    title: 'Growth',
    href: '/growth',
    icon: <TrendingUp className="h-5 w-5 mr-2" />,
  },
  {
    title: 'Pivot',
    href: '/pivot',
    icon: <GitFork className="h-5 w-5 mr-2" />,
  },
];

const TopNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-white border-b border-validation-gray-200 sticky top-14 md:top-16 z-30">
      <div className="container mx-auto px-4">
        <ul className="flex overflow-x-auto py-2 scrollbar-none">
          {mainNavItems.map((item) => {
            // Check if this nav item matches the current path
            const isActive = currentPath === item.href || 
                            (item.href !== '/' && currentPath.startsWith(item.href));
            
            return (
              <li key={item.href} className="flex-shrink-0 mr-1">
                <NavLink
                  to={item.href}
                  className={({ isActive: linkActive }) => 
                    cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap",
                      "hover:bg-validation-gray-100 hover:text-validation-gray-900 transition-all duration-200",
                      {
                        "bg-validation-blue-50 text-validation-blue-600 shadow-sm": linkActive || isActive,
                        "text-validation-gray-600": !linkActive && !isActive,
                      }
                    )
                  }
                  end={item.href === '/'}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default TopNavigation;
