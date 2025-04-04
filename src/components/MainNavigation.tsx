
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folders, 
  Lightbulb, 
  FlaskConical, 
  BarChart, 
  Building, 
  TrendingUp, 
  Crosshair,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, exact = false }) => {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

const MainNavigation: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-1">
      <NavItem 
        to="/"
        icon={<LayoutDashboard className="h-4 w-4" />}
        label={t('navigation.dashboard')}
        exact
      />
      
      <NavItem 
        to="/projects"
        icon={<Folders className="h-4 w-4" />}
        label={t('navigation.projects')}
      />
      
      <NavItem 
        to="/hypotheses"
        icon={<Lightbulb className="h-4 w-4" />}
        label={t('navigation.hypotheses')}
      />
      
      <NavItem 
        to="/experiments"
        icon={<FlaskConical className="h-4 w-4" />}
        label={t('navigation.experiments')}
      />
      
      <NavItem 
        to="/metrics"
        icon={<BarChart className="h-4 w-4" />}
        label={t('navigation.metrics')}
      />
      
      <NavItem 
        to="/mvp"
        icon={<Building className="h-4 w-4" />}
        label={t('navigation.mvp')}
      />
      
      <NavItem 
        to="/growth"
        icon={<TrendingUp className="h-4 w-4" />}
        label={t('navigation.growth')}
      />
      
      <NavItem 
        to="/pivot"
        icon={<Crosshair className="h-4 w-4" />}
        label={t('navigation.pivot')}
      />
      
      <NavItem 
        to="/settings"
        icon={<Settings className="h-4 w-4" />}
        label={t('navigation.settings')}
      />
    </div>
  );
};

export default MainNavigation;
