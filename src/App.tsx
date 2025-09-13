import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProjectLayout from "./pages/ProjectLayout";
import Library from "./pages/Library";
import OnboardingPlan from "./pages/OnboardingPlan";
import OnboardingPlayer from "./pages/OnboardingPlayer";
import Integrations from "./pages/Integrations";
import ProjectSettings from "./pages/ProjectSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/project/:projectId" element={<ProjectLayout />}>
            <Route path="library" element={<Library />} />
            <Route path="onboarding/plan" element={<OnboardingPlan />} />
            <Route path="onboarding/player" element={<OnboardingPlayer />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<ProjectSettings />} />
            <Route index element={<Library />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
