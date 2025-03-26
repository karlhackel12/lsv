
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
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5 mr-3" />,
    description: 'Overview of your product validation journey',
  },
  {
    title: 'Problem Validation',
    href: '/hypotheses?phase=problem',
    icon: <Lightbulb className="h-5 w-5 mr-3" />,
    description: 'Create and test problem hypotheses',
  },
  {
    title: 'Solution Validation',
    href: '/hypotheses?phase=solution',
    icon: <FlaskConical className="h-5 w-5 mr-3" />,
    description: 'Test solutions with experiments',
    subItems: [
      {
        title: 'Solution Hypotheses',
        href: '/hypotheses?phase=solution',
      },
      {
        title: 'Experiments',
        href: '/experiments',
      }
    ]
  },
  {
    title: 'MVP',
    href: '/mvp',
    icon: <Layers className="h-5 w-5 mr-3" />,
    description: 'Build your minimum viable product',
  },
  {
    title: 'Growth',
    href: '/growth',
    icon: <TrendingUp className="h-5 w-5 mr-3" />,
    description: 'Scale your validated business',
    subItems: [
      {
        title: 'Growth Model',
        href: '/growth'
      },
      {
        title: 'Metrics',
        href: '/metrics'
      }
    ]
  },
  {
    title: 'Pivot',
    href: '/pivot',
    icon: <GitFork className="h-5 w-5 mr-3" />,
    description: 'Determine if a strategic change is needed',
  },
];

const resourceNavItems = [
  {
    title: 'Lean Startup Guide',
    href: '/lean-startup-methodology',
    icon: <BookOpen className="h-5 w-5 mr-3" />,
  },
  {
    title: 'Business Plan',
    href: '/business-plan',
    icon: <FileText className="h-5 w-5 mr-3" />,
  },
];

const SideNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if a nav item or its subitems matches the current path
  const isItemActive = (item: any) => {
    // Exact match for dashboard
    if (item.href === '/' && location.pathname === '/') return true;
    
    // For other items, check if pathname starts with href (avoiding '/' which would match everything)
    if (item.href !== '/' && location.pathname.startsWith(item.href.split('?')[0])) return true;
    
    // Check subitems if they exist
    if (item.subItems) {
      return item.subItems.some((subItem: any) => {
        return location.pathname.startsWith(subItem.href.split('?')[0]);
      });
    }
    
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
            onClick={() => navigate('/experiments/new')}
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
                    <NavLink to={item.href} end={item.href === '/'}>
                      {item.icon}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                  
                  {item.subItems && (
                    <SidebarMenuSub>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname.startsWith(subItem.href.split('?')[0])}
                          >
                            <NavLink to={subItem.href}>
                              {subItem.title}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
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
