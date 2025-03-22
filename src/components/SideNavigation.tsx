
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  FlaskConical,
  Layers,
  LineChart,
  GitFork,
  Settings,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

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
    title: 'Pivot',
    href: '/pivot',
    icon: <GitFork className="h-5 w-5 mr-2" />,
  },
];

const SideNavigation = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className="text-xl font-bold text-validation-blue-600">LSV</span>
            </div>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) => 
                      cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                        "hover:bg-validation-gray-100 hover:text-validation-gray-900 transition-colors",
                        {
                          "bg-validation-blue-50 text-validation-blue-600": isActive,
                          "text-validation-gray-600": !isActive,
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
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};

export default SideNavigation;
