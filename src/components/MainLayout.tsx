import React from 'react';
import { Outlet } from 'react-router-dom';
import MainHeader from '@/components/MainHeader';
import TopNavigation from '@/components/TopNavigation';
const MainLayout = () => {
  return <div className="flex flex-col min-h-screen bg-validation-gray-50 overflow-hidden w-full">
      <MainHeader />
      <TopNavigation />
      <main className="flex-1 p-3 md:p-5 lg:p-6 overflow-y-auto mt-16 py-0 px-0 my-[15px]">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>;
};
export default MainLayout;