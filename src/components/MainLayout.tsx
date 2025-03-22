
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavigation from '@/components/SideNavigation';
import MainHeader from '@/components/MainHeader';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-validation-gray-50">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <MainHeader />
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-x-hidden">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
