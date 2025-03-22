
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavigation from '@/components/SideNavigation';
import MainHeader from '@/components/MainHeader';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-validation-gray-50 overflow-hidden">
      <SideNavigation />
      <div className="flex-1 flex flex-col w-full">
        <MainHeader />
        <main className="flex-1 p-3 md:p-5 lg:p-6 overflow-y-auto">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
