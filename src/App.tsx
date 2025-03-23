
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import React from "react"; // Ensure React is imported
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HypothesesPage from "./pages/HypothesesPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import MVPPage from "./pages/MVPPage";
import MetricsPage from "./pages/MetricsPage";
import PivotPage from "./pages/PivotPage";
import GrowthPage from "./pages/GrowthPage";

// Create a client
const queryClient = new QueryClient();

// Define App as a proper React functional component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/hypotheses" element={<HypothesesPage />} />
                  <Route path="/experiments" element={<ExperimentsPage />} />
                  <Route path="/mvp" element={<MVPPage />} />
                  <Route path="/metrics" element={<MetricsPage />} />
                  <Route path="/pivot" element={<PivotPage />} />
                  <Route path="/growth" element={<GrowthPage />} />
                  {/* These routes will be implemented later */}
                  <Route path="/profile" element={<div>Profile Page</div>} />
                  <Route path="/settings" element={<div>Settings Page</div>} />
                </Route>
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
