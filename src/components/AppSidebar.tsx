import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  User,
  Library,
  Puzzle,
  Target,
  BarChart3,
  Lightbulb,
  ChevronRight,
  LogOut
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const mainMenuItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home
  },
  { 
    title: "Biblioteca", 
    url: "/library", 
    icon: Library
  },
  { 
    title: "Integraciones", 
    url: "/integrations", 
    icon: Puzzle
  }
];

// Build project menu based on current path's projectId to avoid hardcoding
const buildProjectMenu = (projectId?: string) => ([
  { title: "Plan de Formación", url: projectId ? `/project/${projectId}/onboarding` : "/", icon: Target },
  { title: "Análisis", url: projectId ? `/project/${projectId}/analytics` : "/", icon: BarChart3 },
  { title: "Gestionar", url: projectId ? `/project/${projectId}/manage` : "/", icon: Settings }
]);

const userMenuItems = [
  { 
    title: "Mi Perfil", 
    url: "/profile", 
    icon: User
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Try to infer current projectId from the path: /project/:id/...
  const projectIdMatch = currentPath.match(/^\/project\/([^/]+)/);
  const currentProjectId = projectIdMatch?.[1];
  const projectMenuItems = buildProjectMenu(currentProjectId);

  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  
  const isActive = (path: string) => {
    if (path === "/") return currentPath === path;
    return currentPath.startsWith(path);
  };
  
  const getNavCls = (isActiveState: boolean) =>
    `transition-all duration-300 rounded-xl min-w-0 ${
      isActiveState 
        ? "bg-primary text-primary-foreground shadow-soft" 
        : "hover:bg-muted/80 hover:shadow-soft text-muted-foreground hover:text-foreground"
    }`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Sesión cerrada",
      description: "Hasta la próxima",
    });
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300 border-r border-border/50 bg-sidebar/95 backdrop-blur-sm overflow-hidden`}
      collapsible="icon"
    >
      <SidebarContent className="p-4 h-full overflow-y-auto overflow-x-hidden">
        {/* Logo Header */}
        <motion.div 
          className="flex items-center gap-3 mb-8 px-2 min-h-[3rem] overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-soft shrink-0">
            <Lightbulb className="h-5 w-5 text-primary-foreground" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-stepable-xl font-bold text-primary">
                  Stepable
                </h1>
                <p className="text-xs text-muted-foreground">Plataforma de onboarding</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Navigation */}
        <SidebarGroup className="overflow-hidden">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-3 px-2">
                  NAVEGACIÓN PRINCIPAL
                </SidebarGroupLabel>
              </motion.div>
            )}
          </AnimatePresence>
          
          <SidebarGroupContent className="overflow-hidden">
            <SidebarMenu className="space-y-2">
              {mainMenuItems.map((item, index) => {
                const isActiveState = isActive(item.url);
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                      >
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/"}
                          className={getNavCls(isActiveState)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 p-3 w-full min-w-0"
                          >
                            <Icon className={`h-5 w-5 ${isActiveState ? 'text-white' : ''}`} />
                            <AnimatePresence mode="wait">
                              {!collapsed && (
                                <motion.div
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="flex-1 min-w-0 pr-2"
                                >
                                  <div className="font-medium">{item.title}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {isActiveState && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <ChevronRight className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Project Navigation (only inside project routes to avoid duplication) */}
        {currentPath.startsWith("/project/") && (
        <SidebarGroup className="mt-6">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-3 px-2">
                  PROYECTO ACTUAL
                </SidebarGroupLabel>
              </motion.div>
            )}
          </AnimatePresence>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {projectMenuItems.map((item, index) => {
                const isActiveState = isActive(item.url);
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + 0.1 * index, duration: 0.3 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                      >
                        <NavLink 
                          to={item.url} 
                          className={getNavCls(isActiveState)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.08, x: 8 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 p-4"
                          >
                            <Icon className={`h-5 w-5 ${isActiveState ? 'text-white' : ''}`} />
                            <AnimatePresence>
                              {!collapsed && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  className="flex-1"
                                >
                                  <div className="font-medium">{item.title}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {isActiveState && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <ChevronRight className="h-4 w-4 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* User Section */}
        <div className="mt-auto pt-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {userMenuItems.map((item, index) => {
                  const isActiveState = isActive(item.url);
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.url}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + 0.1 * index, duration: 0.3 }}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.url} 
                            className={getNavCls(isActiveState)}
                          >
                              <motion.div
                                whileHover={{ scale: 1.08, x: 8 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 p-4"
                              >
                              <Icon className={`h-5 w-5 ${isActiveState ? 'text-white' : ''}`} />
                              <AnimatePresence>
                                {!collapsed && (
                                  <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-medium"
                                  >
                                    {item.title}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  );
                })}
                
                {/* Logout Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-xl"
                    >
                      <motion.div
                        whileHover={{ scale: 1.08, x: 8 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3"
                      >
                        <LogOut className="h-5 w-5" />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="font-medium"
                            >
                              Cerrar sesión
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Button>
                  </SidebarMenuItem>
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
