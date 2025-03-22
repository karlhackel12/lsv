
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavigation from '@/components/SideNavigation';
import MainHeader from '@/components/MainHeader';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <MainHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-validation-gray-50 overflow-x-hidden">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
