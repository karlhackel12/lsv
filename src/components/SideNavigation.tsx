
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  FlaskConical,
  Layers,
  LineChart,
  GitFork,
  TrendingUp,
  Plus,
  BookOpen,
  FileText,
  HelpCircle,
  Beaker
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    description: 'Overview of your product validation journey',
  },
  {
    title: 'Problem Validation',
    href: '/dashboard/problem-validation',
    icon: <Lightbulb className="h-5 w-5 mr-3" />,
    description: 'Create and test problem hypotheses',
  },
  {
    title: 'Solution Validation',
    href: '/dashboard/solution-validation',
    icon: <FlaskConical className="h-5 w-5 mr-3" />,
    description: 'Test solutions with experiments',
  },
  {
    title: 'Experiments',
    href: '/dashboard/experiments',
    icon: <Beaker className="h-5 w-5 mr-3" />,
    description: 'Run validation experiments',
  },
  {
    title: 'MVP',
    href: '/dashboard/mvp',
    icon: <Layers className="h-5 w-5 mr-3" />,
    description: 'Build your minimum viable product',
  },
  {
    title: 'Growth',
    href: '/dashboard/growth',
    icon: <TrendingUp className="h-5 w-5 mr-3" />,
    description: 'Scale your validated business',
  },
  {
    title: 'Metrics',
    href: '/dashboard/metrics',
    icon: <LineChart className="h-5 w-5 mr-3" />,
    description: 'Track key metrics for your product',
  },
  {
    title: 'Pivot',
    href: '/dashboard/pivot',
    icon: <GitFork className="h-5 w-5 mr-3" />,
    description: 'Determine if a strategic change is needed',
  },
];

const resourceNavItems = [
  {
    title: 'Lean Startup Guide',
    href: '/dashboard/lean-startup-methodology',
    icon: <BookOpen className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Business Plan',
    href: '/dashboard/business-plan',
    icon: <FileText className="h-5 w-5 mr-3" />,
  },
];

const SideNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isItemActive = (item: any) => {
    if (item.href === '/dashboard' && location.pathname === '/dashboard') return true;
    
    if (item.href !== '/dashboard' && location.pathname.startsWith(item.href)) return true;
    
    return false;
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarRail />
      <SidebarHeader className="flex items-center p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-xl font-bold text-validation-blue-600">LSV</span>
            <span className="ml-2 text-validation-gray-800 font-medium hidden md:block">Lean Startup Validator</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <div className="mb-4 px-2">
          <Button 
            onClick={() => navigate('/dashboard/experiments?create=true')}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>New Experiment</span>
          </Button>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Validation Journey</SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const active = isItemActive(item);
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.description}
                    isActive={active}
                  >
                    <NavLink to={item.href} end={item.href === '/dashboard'}>
                      {item.icon}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarMenu>
            {resourceNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.href}
                >
                  <NavLink to={item.href}>
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={false}
              >
                <a href="https://docs.lovable.dev/lean-startup" target="_blank" rel="noopener noreferrer">
                  <HelpCircle className="h-5 w-5 mr-3" />
                  <span>Help Center</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideNavigation;
