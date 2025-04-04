
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  Folders, 
  Lightbulb, 
  FlaskConical, 
  BarChart, 
  Building, 
  TrendingUp, 
  Crosshair,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("md:hidden", className)} 
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex justify-between items-center">
              <span>Menu</span>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4 px-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>{t('navigation.dashboard')}</span>
            </NavLink>
            
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <Folders className="h-4 w-4" />
              <span>{t('navigation.projects')}</span>
            </NavLink>
            
            <NavLink
              to="/hypotheses"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <Lightbulb className="h-4 w-4" />
              <span>{t('navigation.hypotheses')}</span>
            </NavLink>
            
            <NavLink
              to="/experiments"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <FlaskConical className="h-4 w-4" />
              <span>{t('navigation.experiments')}</span>
            </NavLink>
            
            <NavLink
              to="/metrics"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <BarChart className="h-4 w-4" />
              <span>{t('navigation.metrics')}</span>
            </NavLink>
            
            <NavLink
              to="/mvp"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <Building className="h-4 w-4" />
              <span>{t('navigation.mvp')}</span>
            </NavLink>
            
            <NavLink
              to="/growth"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{t('navigation.growth')}</span>
            </NavLink>
            
            <NavLink
              to="/pivot"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <Crosshair className="h-4 w-4" />
              <span>{t('navigation.pivot')}</span>
            </NavLink>
            
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all mb-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>{t('navigation.settings')}</span>
            </NavLink>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNavigation;
