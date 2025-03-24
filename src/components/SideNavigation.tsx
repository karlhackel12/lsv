
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
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Hypotheses',
    href: '/hypotheses',
    icon: <Lightbulb className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Experiments',
    href: '/experiments',
    icon: <FlaskConical className="h-5 w-5 mr-3" />,
  },
  {
    title: 'MVP',
    href: '/mvp',
    icon: <Layers className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Metrics',
    href: '/metrics',
    icon: <LineChart className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Growth',
    href: '/growth',
    icon: <TrendingUp className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Pivot',
    href: '/pivot',
    icon: <GitFork className="h-5 w-5 mr-3" />,
  },
];

const SideNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="flex items-center p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-xl font-bold text-validation-blue-600">LSV</span>
            <span className="ml-2 text-validation-gray-800 font-medium hidden md:block">Lean Startup Validator</span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarMenu>
          {mainNavItems.map((item) => {
            // Check if this nav item matches the current path
            const isActive = currentPath === item.href || 
                           (item.href !== '/' && currentPath.startsWith(item.href));
                           
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive: linkActive }) => 
                      cn(
                        "flex items-center px-4 py-3 my-1 rounded-md text-sm font-medium w-full",
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
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideNavigation;
