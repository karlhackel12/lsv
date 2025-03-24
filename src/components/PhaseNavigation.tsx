
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  Beaker, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2,
  GitFork
} from 'lucide-react';

interface Phase {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const phases: Phase[] = [
  {
    id: 'problem',
    name: 'Problem Validation',
    icon: <Lightbulb className="h-5 w-5" />,
    path: '/hypotheses?phase=problem'
  },
  {
    id: 'solution',
    name: 'Solution Validation',
    icon: <Beaker className="h-5 w-5" />,
    path: '/hypotheses?phase=solution'
  },
  {
    id: 'mvp',
    name: 'MVP Testing',
    icon: <Layers className="h-5 w-5" />,
    path: '/mvp'
  },
  {
    id: 'growth',
    name: 'Growth Model',
    icon: <TrendingUp className="h-5 w-5" />,
    path: '/growth'
  },
  {
    id: 'pivot',
    name: 'Pivot Decision',
    icon: <GitFork className="h-5 w-5" />,
    path: '/pivot'
  }
];

const PhaseNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine current active phase based on URL
  const getCurrentPhase = (): string => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const phaseParam = searchParams.get('phase');
    
    if (path.includes('/hypotheses')) {
      return phaseParam || 'problem';
    } else if (path.includes('/mvp')) {
      return 'mvp';
    } else if (path.includes('/growth')) {
      return 'growth';
    } else if (path.includes('/pivot')) {
      return 'pivot';
    }
    
    return 'problem'; // Default to problem
  };
  
  const currentPhase = getCurrentPhase();
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-sm font-medium text-validation-gray-500 mb-4">Validation Journey</h3>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        {phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isPast = phases.findIndex(p => p.id === currentPhase) > index;
          
          return (
            <div key={phase.id} className="flex items-center w-full">
              <div 
                className={cn(
                  "flex flex-col md:flex-row items-center cursor-pointer py-2 px-1 rounded transition-colors",
                  isActive ? "text-validation-blue-600" : isPast ? "text-validation-green-600" : "text-validation-gray-400",
                  isActive && "bg-validation-blue-50 px-3"
                )}
                onClick={() => navigate(phase.path)}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-full p-2",
                  isActive ? "bg-validation-blue-100" : isPast ? "bg-validation-green-100" : "bg-validation-gray-100",
                  "mr-2"
                )}>
                  {isPast ? <CheckCircle2 className="h-5 w-5" /> : phase.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  isActive ? "text-validation-blue-600" : isPast ? "text-validation-green-600" : "text-validation-gray-500"
                )}>
                  {phase.name}
                </span>
              </div>
              
              {index < phases.length - 1 && (
                <div className="hidden md:block mx-2">
                  <ArrowRight className="h-4 w-4 text-validation-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseNavigation;
