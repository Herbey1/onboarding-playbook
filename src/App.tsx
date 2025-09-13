import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
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

// Layout component for pages that should have sidebar
const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-6">
          <SidebarTrigger className="mr-4" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Stepable</h2>
            <p className="text-sm text-muted-foreground">Plataforma de onboarding inteligente</p>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-gradient-subtle">
          <div className="container mx-auto max-w-7xl p-6 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<LayoutWithSidebar><Home /></LayoutWithSidebar>} />
          <Route path="/profile" element={<LayoutWithSidebar><Profile /></LayoutWithSidebar>} />
          <Route path="/library" element={<LayoutWithSidebar><Library /></LayoutWithSidebar>} />
          <Route path="/integrations" element={<LayoutWithSidebar><Integrations /></LayoutWithSidebar>} />
          <Route path="/project/:projectId" element={<LayoutWithSidebar><ProjectLayout /></LayoutWithSidebar>}>
            <Route path="library" element={<Library />} />
            <Route path="onboarding" element={<OnboardingPlan />} />
            <Route path="onboarding/plan" element={<OnboardingPlan />} />
            <Route path="onboarding/player" element={<OnboardingPlayer />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<ProjectSettings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route index element={<Library />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
