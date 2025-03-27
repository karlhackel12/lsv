
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("ProtectedRoute: Auth status - user:", !!user, "loading:", loading);
    console.log("ProtectedRoute: Current location:", location.pathname);
  }, [user, loading, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-validation-blue-600 mr-3"></div>
        <span className="text-lg">Loading authentication...</span>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute: User authenticated, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute;
