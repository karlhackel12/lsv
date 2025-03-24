import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Lightbulb, FlaskConical, Layers, LineChart, GitFork, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
const mainNavItems = [{
  title: 'Dashboard',
  href: '/',
  icon: <LayoutDashboard className="h-5 w-5 mr-2" />
}, {
  title: 'Hypotheses',
  href: '/hypotheses',
  icon: <Lightbulb className="h-5 w-5 mr-2" />
}, {
  title: 'Experiments',
  href: '/experiments',
  icon: <FlaskConical className="h-5 w-5 mr-2" />
}, {
  title: 'MVP',
  href: '/mvp',
  icon: <Layers className="h-5 w-5 mr-2" />
}, {
  title: 'Metrics',
  href: '/metrics',
  icon: <LineChart className="h-5 w-5 mr-2" />
}, {
  title: 'Growth',
  href: '/growth',
  icon: <TrendingUp className="h-5 w-5 mr-2" />
}, {
  title: 'Pivot',
  href: '/pivot',
  icon: <GitFork className="h-5 w-5 mr-2" />
}];
const TopNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  return;
};
export default TopNavigation;