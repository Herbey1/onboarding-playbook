import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
          <Route 
            path="/*" 
            element={
              <SidebarProvider>
                <div className="min-h-screen flex w-full bg-background">
                  <AppSidebar />
                  <main className="flex-1 flex flex-col">
                    <header className="h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                      <SidebarTrigger className="ml-4" />
                      <div className="ml-4">
                        <h2 className="text-lg font-semibold text-foreground">Stepable</h2>
                      </div>
                    </header>
                    <div className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/integrations" element={<Integrations />} />
                        <Route path="/project/:projectId" element={<ProjectLayout />}>
                          <Route path="library" element={<Library />} />
                          <Route path="onboarding" element={<OnboardingPlan />} />
                          <Route path="onboarding/plan" element={<OnboardingPlan />} />
                          <Route path="onboarding/player" element={<OnboardingPlayer />} />
                          <Route path="integrations" element={<Integrations />} />
                          <Route path="settings" element={<ProjectSettings />} />
                          <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
                          <Route index element={<Library />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </SidebarProvider>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
