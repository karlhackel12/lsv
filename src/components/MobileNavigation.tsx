
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  LayoutDashboard,
  Lightbulb,
  Beaker,
  Sparkles,
  FileText,
  Settings,
  TrendingUp,
  BarChart
} from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold">Validation App</h2>
      </div>
      
      <div className="px-2 space-y-1">
        <Link to="/">
          <Button 
            variant={isActive('/') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button 
            variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        
        <Link to="/problem-validation">
          <Button 
            variant={isActive('/problem-validation') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Problem Validation
          </Button>
        </Link>
        
        <Link to="/solution-validation">
          <Button 
            variant={isActive('/solution-validation') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Solution Validation
          </Button>
        </Link>
        
        <Link to="/experiments">
          <Button 
            variant={isActive('/experiments') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <Beaker className="h-4 w-4 mr-2" />
            Experiments
          </Button>
        </Link>
        
        <Link to="/mvp">
          <Button 
            variant={isActive('/mvp') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <FileText className="h-4 w-4 mr-2" />
            MVP Definition
          </Button>
        </Link>
        
        <Link to="/metrics">
          <Button 
            variant={isActive('/metrics') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <BarChart className="h-4 w-4 mr-2" />
            Metrics
          </Button>
        </Link>
        
        <Link to="/growth">
          <Button 
            variant={isActive('/growth') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Growth
          </Button>
        </Link>
        
        <Link to="/settings">
          <Button 
            variant={isActive('/settings') ? 'secondary' : 'ghost'} 
            className={cn("w-full justify-start")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
