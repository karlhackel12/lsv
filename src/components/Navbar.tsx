
import React from 'react';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-validation-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-validation-blue-600 to-validation-blue-800">
            Lean Startup Validation Tool
          </h1>
        </div>
        <div className="text-sm font-medium text-validation-gray-500">
          Last Updated: March 22, 2025
        </div>
      </div>
    </header>
  );
};

export default Navbar;
