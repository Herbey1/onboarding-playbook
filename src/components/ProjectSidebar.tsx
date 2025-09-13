import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  GraduationCap, 
  Puzzle, 
  Settings, 
  Home,
  ChevronDown,
  User,
  LogOut,
  Play,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Mock project data
const mockProject = {
  id: "1",
  name: "Sistema de Pagos",
  description: "API REST para procesamiento de pagos",
  stack: ["React", "Node.js", "PostgreSQL"],
  progress: 75,
  status: "published"
};

const navItems = [
  {
    title: "Biblioteca",
    href: "library",
    icon: BookOpen,
    description: "Guías y plantillas del proyecto"
  },
  {
    title: "Onboarding",
    href: "onboarding",
    icon: GraduationCap,
    description: "Plan de formación",
    subItems: [
      { title: "Plan", href: "onboarding/plan", icon: FileText },
      { title: "Player", href: "onboarding/player", icon: Play }
    ]
  },
  {
    title: "Integraciones",
    href: "integrations", 
    icon: Puzzle,
    description: "Conexiones con GitHub, Jira..."
  },
  {
    title: "Gestionar",
    href: "manage",
    icon: Settings,
    description: "Roles, invitaciones y configuración"
  }
];

const ProjectSidebar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Sesión cerrada",
      description: "Hasta la próxima",
    });
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getNavItemClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover-lift",
      "focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medium"
        : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
    );

  const getSubNavItemClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center space-x-3 px-6 py-2 rounded-lg text-sm transition-all duration-200",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover-scale",
      "focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-muted-foreground"
    );

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "bg-sidebar/90 backdrop-blur-sm border-r border-sidebar-border flex flex-col h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <motion.div 
        className="p-4 border-b border-sidebar-border"
        layout
      >
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground hover-glow transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                Proyectos
              </Button>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </motion.button>
          
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 hover-glow">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user ? getUserInitials(user.email || "") : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </div>
        
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="font-semibold text-sidebar-foreground truncate">
              {mockProject.name}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={mockProject.status === "published" ? "default" : "secondary"}
                className="text-xs hover-scale transition-transform duration-200"
              >
                {mockProject.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {mockProject.progress}% completo
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => (
          <motion.div 
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <NavLink
              to={`/project/${projectId}/${item.href}`}
              end={!item.subItems}
              className={getNavItemClassName}
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive ? "text-sidebar-primary-foreground" : "group-hover:text-sidebar-primary"
                      )} 
                    />
                  </motion.div>
                  
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1"
                    >
                      <div className="font-medium">{item.title}</div>
                      <div className={cn(
                        "text-xs transition-colors duration-200",
                        isActive 
                          ? "text-sidebar-primary-foreground/80" 
                          : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70"
                      )}>
                        {item.description}
                      </div>
                    </motion.div>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 w-1 h-full bg-sidebar-primary-foreground rounded-l-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
            
            {/* Sub-navigation for Onboarding */}
            {item.subItems && !isCollapsed && (
              <motion.div 
                className="mt-2 space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {item.subItems.map((subItem, subIndex) => (
                  <motion.div
                    key={subItem.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + subIndex * 0.05 }}
                  >
                    <NavLink
                      to={`/project/${projectId}/${subItem.href}`}
                      className={getSubNavItemClassName}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <subItem.icon className="h-4 w-4" />
                      </motion.div>
                      <span>{subItem.title}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div 
          className="p-4 border-t border-sidebar-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex flex-wrap gap-1">
              {mockProject.stack.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.5 + index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <Badge 
                    variant="outline" 
                    className="text-xs hover-scale transition-transform duration-200"
                  >
                    {tech}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <div className="text-center pt-2">
              Stepable v1.0.0
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProjectSidebar;
