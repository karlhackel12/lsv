
import React from 'react';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell, User } from 'lucide-react';
import ProjectSelector from './ProjectSelector';
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet';

import MobileNavigation from './MobileNavigation';

interface MainHeaderProps {
  toggleSidebar?: () => void;
}

const MainHeader = ({ toggleSidebar }: MainHeaderProps) => {
  const { currentProject, selectProject } = useProject();

  const handleProjectChange = async (projectId: string) => {
    try {
      if (currentProject?.id !== projectId) {
        await selectProject(projectId);
      }
    } catch (error) {
      console.error('Error changing project:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileNavigation />
            </SheetContent>
          </Sheet>
          
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <ProjectSelector 
            currentProjectId={currentProject?.id || ''} 
            onProjectChange={handleProjectChange} 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">User Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
