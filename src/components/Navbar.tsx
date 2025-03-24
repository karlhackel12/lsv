
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Beaker, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-validation-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-validation-blue-600 to-validation-blue-800">
              Lean Startup Validation Tool
            </h1>
          </Link>
          
          <div className="hidden md:flex ml-8 space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/experiments" className="flex items-center">
                <Beaker className="h-4 w-4 mr-1" />
                Experiments
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-validation-gray-500">
            Last Updated: March 22, 2025
          </div>
          {!user && (
            <Button variant="outline" asChild>
              <Link to="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
