
import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '@/components/MainHeader';
import SideNavigation from '@/components/SideNavigation';
import { SidebarProvider } from '@/components/ui/sidebar';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-validation-gray-50 overflow-hidden w-full">
        <MainHeader />
        <div className="flex flex-1 overflow-hidden">
          <SideNavigation />
          <main className="flex-1 p-3 md:p-5 lg:p-6 overflow-y-auto">
            <div className="w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
