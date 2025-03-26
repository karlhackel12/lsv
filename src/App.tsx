
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

// Create a new QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/problem-validation" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProblemValidationPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/solution-validation" element={
                <ProtectedRoute>
                  <MainLayout>
                    <SolutionValidationPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/experiments" element={
                <ProtectedRoute>
                  <MainLayout>
                    <ExperimentsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/mvp" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MVPPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/metrics" element={
                <ProtectedRoute>
                  <MainLayout>
                    <MetricsPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/pivot" element={
                <ProtectedRoute>
                  <MainLayout>
                    <PivotPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/growth" element={
                <ProtectedRoute>
                  <MainLayout>
                    <GrowthPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/lean-startup-methodology" element={
                <ProtectedRoute>
                  <MainLayout>
                    <LeanStartupPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/business-plan" element={
                <ProtectedRoute>
                  <MainLayout>
                    <BusinessPlanPage />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div>Profile Page</div>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div>Settings Page</div>
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
