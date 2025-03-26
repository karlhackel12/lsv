
import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '@/components/MainHeader';
import SideNavigation from '@/components/SideNavigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useProject } from '@/hooks/use-project';

const MainLayout = () => {
  const { currentProject } = useProject();
  
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-validation-gray-50 w-full">
        <MainHeader />
        <div className="flex flex-1 overflow-hidden">
          <SideNavigation />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
