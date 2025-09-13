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
  FileText
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
    title: "Ajustes",
    href: "settings",
    icon: Settings,
    description: "Roles, códigos y configuración"
  }
];

const ProjectSidebar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
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
      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "text-sidebar-foreground"
    );

  const getSubNavItemClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center space-x-3 px-6 py-2 rounded-lg text-sm transition-colors",
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-muted-foreground"
    );

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4 mr-2" />
            Proyectos
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
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
        </div>
        
        <div>
          <h2 className="font-semibold text-sidebar-foreground truncate">
            {mockProject.name}
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <Badge 
              variant={mockProject.status === "published" ? "default" : "secondary"}
              className="text-xs"
            >
              {mockProject.status === "published" ? "Publicado" : "Borrador"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {mockProject.progress}% completo
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.href}>
            <NavLink
              to={`/project/${projectId}/${item.href}`}
              end={!item.subItems}
              className={getNavItemClassName}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
            
            {/* Sub-navigation for Onboarding */}
            {item.subItems && (
              <div className="mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.href}
                    to={`/project/${projectId}/${subItem.href}`}
                    className={getSubNavItemClassName}
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span>{subItem.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex flex-wrap gap-1">
            {mockProject.stack.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSidebar;