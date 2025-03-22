
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
        <main className="flex-1 p-4 md:p-6 bg-validation-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
