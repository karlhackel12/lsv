
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronsUpDown, 
  Check,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProject } from '@/hooks/use-project';
import ProjectForm from '@/components/forms/ProjectForm';

const MainHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const { projects, currentProject, selectProject, createProject } = useProject();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProjectSelect = (project: Project) => {
    selectProject(project);
    setOpen(false);
  };

  const handleCreateProject = async (projectData: { name: string; description: string; stage: string }) => {
    await createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const initials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-validation-gray-200">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 md:px-6">
        <div className="flex items-center space-x-2 w-full max-w-xs">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between truncate"
              >
                {currentProject ? (
                  <span className="truncate max-w-[120px] md:max-w-[200px]">
                    {currentProject.name}
                  </span>
                ) : (
                  "Select project..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0 md:w-[280px]">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                  <CommandEmpty>No projects found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => handleProjectSelect(project)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentProject?.id === project.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{project.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="p-2 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => {
                      setOpen(false);
                      setIsProjectFormOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setIsProjectFormOpen(true)}
            className="hidden md:flex"
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
          
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
      
      {/* Project Creation Dialog */}
      <ProjectForm 
        isOpen={isProjectFormOpen} 
        onClose={() => setIsProjectFormOpen(false)} 
        onSave={handleCreateProject}
      />
    </header>
  );
};

export default MainHeader;
