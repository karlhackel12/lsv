
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4 text-gray-600">Welcome, {user?.user_metadata?.full_name || user?.email}</p>
      <Dashboard />
    </div>
  );
};

export default Index;
