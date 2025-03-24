
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Beaker, LayoutDashboard, FlaskConical, Lightbulb, Layers, TrendingUp } from 'lucide-react';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const validationPhases = [
    { 
      name: "Problem Validation", 
      icon: <Lightbulb className="h-4 w-4 mr-2" />, 
      path: "/hypotheses?phase=problem" 
    },
    { 
      name: "Solution Validation", 
      icon: <Beaker className="h-4 w-4 mr-2" />, 
      path: "/hypotheses?phase=solution" 
    },
    { 
      name: "MVP Testing", 
      icon: <Layers className="h-4 w-4 mr-2" />, 
      path: "/mvp" 
    },
    { 
      name: "Growth Model", 
      icon: <TrendingUp className="h-4 w-4 mr-2" />, 
      path: "/growth" 
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-validation-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-validation-blue-600 to-validation-blue-800">
              Lean Startup Validation Tool
            </h1>
          </Link>
          
          <div className="flex ml-8 space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-3 flex items-center text-sm">
                    Validation Journey
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 bg-white">
                      {validationPhases.map((phase, index) => (
                        <li key={index}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={phase.path}
                              className={cn(
                                "flex items-center p-2 rounded-md hover:bg-validation-gray-100",
                                "focus:bg-validation-gray-100 focus:outline-none"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center rounded-full p-1",
                                index === 0 ? "bg-blue-100" : 
                                index === 1 ? "bg-green-100" : 
                                index === 2 ? "bg-yellow-100" : "bg-purple-100"
                              )}>
                                {phase.icon}
                              </div>
                              <div className="ml-2">
                                <p className="font-medium text-sm">{phase.name}</p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Button variant="ghost" size="sm" asChild>
              <Link to="/experiments" className="flex items-center">
                <Beaker className="h-4 w-4 mr-1" />
                Experiments
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/experiments/new')}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FlaskConical className="h-4 w-4 mr-1" />
            New Experiment
          </Button>
          
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
