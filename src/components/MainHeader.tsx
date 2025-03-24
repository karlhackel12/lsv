import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ChevronsUpDown, Check, PlusCircle, LayoutDashboard, Beaker, FlaskConical, Lightbulb, Layers, TrendingUp, GitBranch } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProject } from '@/hooks/use-project';
import ProjectForm from '@/components/forms/ProjectForm';

const MainHeader = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    projects,
    currentProject,
    selectProject,
    createProject
  } = useProject();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProjectSelect = (project: Project) => {
    selectProject(project);
    setOpen(false);
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    stage: string;
  }) => {
    await createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const validationPhases = [{
    name: "Problem Validation",
    icon: <Lightbulb className="h-4 w-4 mr-2" />,
    path: "/hypotheses?phase=problem"
  }, {
    name: "Solution Validation",
    icon: <Beaker className="h-4 w-4 mr-2" />,
    path: "/hypotheses?phase=solution"
  }, {
    name: "MVP Testing",
    icon: <Layers className="h-4 w-4 mr-2" />,
    path: "/mvp"
  }, {
    name: "Growth Model",
    icon: <TrendingUp className="h-4 w-4 mr-2" />,
    path: "/growth"
  }, {
    name: "Pivot Decision",
    icon: <GitBranch className="h-4 w-4 mr-2" />,
    path: "/pivot"
  }];

  const initials = user?.email ? user.email.split('@')[0].substring(0, 2).toUpperCase() : 'U';

  return <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-validation-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-validation-blue-600 to-validation-blue-800">LSV</h1>
          </Link>
          
          <div className="flex ml-8 space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 flex items-center text-sm">
                    Validation Journey
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 bg-white">
                      {validationPhases.map((phase, index) => <li key={index}>
                          <NavigationMenuLink asChild>
                            <Link to={phase.path} className={cn("flex items-center p-2 rounded-md hover:bg-validation-gray-100", "focus:bg-validation-gray-100 focus:outline-none")}>
                              <div className={cn("flex items-center justify-center rounded-full p-1", index === 0 ? "bg-blue-100" : index === 1 ? "bg-green-100" : index === 2 ? "bg-yellow-100" : "bg-purple-100")}>
                                {phase.icon}
                              </div>
                              <div className="ml-2">
                                <p className="font-medium text-sm">{phase.name}</p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>)}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Button variant="ghost" size="sm" asChild>
              <Link to="/experiments" className="flex items-center">
                <Beaker className="h-4 w-4 mr-1" />
                Experiments
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-[180px] md:w-[220px] justify-between truncate">
                {currentProject ? <span className="truncate max-w-[120px] md:max-w-[160px]">
                    {currentProject.name}
                  </span> : "Select project..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0 md:w-[280px]">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                  <CommandEmpty>No projects found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map(project => <CommandItem key={project.id} value={project.name} onSelect={() => handleProjectSelect(project)}>
                        <Check className={cn("mr-2 h-4 w-4", currentProject?.id === project.id ? "opacity-100" : "opacity-0")} />
                        <span className="truncate">{project.name}</span>
                      </CommandItem>)}
                  </CommandGroup>
                </CommandList>
                <div className="p-2 border-t">
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                  setOpen(false);
                  setIsProjectFormOpen(true);
                }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ProjectForm isOpen={isProjectFormOpen} onClose={() => setIsProjectFormOpen(false)} onSave={handleCreateProject} />
    </header>;
};

export default MainHeader;
