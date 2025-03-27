
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProblemValidationPage from "./pages/ProblemValidationPage";
import SolutionValidationPage from "./pages/SolutionValidationPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import MVPPage from "./pages/MVPPage";
import MetricsPage from "./pages/MetricsPage";
import PivotPage from "./pages/PivotPage";
import GrowthPage from "./pages/GrowthPage";
import LeanStartupPage from "./pages/LeanStartupPage";
import BusinessPlanPage from "./pages/BusinessPlanPage";
import LandingPage from "./pages/LandingPage";
import HypothesisRedirectPage from "./pages/HypothesisRedirectPage";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  console.log("App rendering - initializing routes");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Redirect root to landing page */}
              <Route path="/" element={<Navigate to="/landing" replace />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legacy route redirects - with logging */}
              <Route path="/experiment" element={
                <Navigate to="/dashboard/experiments" replace />
              } />
              <Route path="/experiments" element={
                <Navigate to="/dashboard/experiments" replace />
              } />
              <Route path="/hypothesis" element={
                <Navigate to="/dashboard/problem-validation" replace />
              } />
              <Route path="/hypotheses" element={<HypothesisRedirectPage />} />
              <Route path="/mvp" element={
                <Navigate to="/dashboard/mvp" replace />
              } />
              <Route path="/metrics" element={
                <Navigate to="/dashboard/metrics" replace />
              } />
              <Route path="/pivot" element={
                <Navigate to="/dashboard/pivot" replace />
              } />
              <Route path="/growth" element={
                <Navigate to="/dashboard/growth" replace />
              } />
              
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="problem-validation" element={<ProblemValidationPage />} />
                  <Route path="solution-validation" element={<SolutionValidationPage />} />
                  <Route path="experiments" element={<ExperimentsPage />} />
                  <Route path="mvp" element={<MVPPage />} />
                  <Route path="metrics" element={<MetricsPage />} />
                  <Route path="pivot" element={<PivotPage />} />
                  <Route path="growth" element={<GrowthPage />} />
                  <Route path="lean-startup-methodology" element={<LeanStartupPage />} />
                  <Route path="business-plan" element={<BusinessPlanPage />} />
                  <Route path="profile" element={<div>Profile Page</div>} />
                  <Route path="settings" element={<div>Settings Page</div>} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
