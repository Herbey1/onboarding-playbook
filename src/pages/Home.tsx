import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Users, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Mock data for projects - en una implementación real vendría de Supabase
const mockProjects = [
  {
    id: "1",
    name: "Sistema de Pagos",
    description: "API REST para procesamiento de pagos con Stripe",
    stack: ["React", "Node.js", "PostgreSQL", "Docker"],
    progress: 75,
    status: "published",
    members: 8,
    lastActivity: "2024-01-15"
  },
  {
    id: "2", 
    name: "Dashboard Analytics",
    description: "Panel de control con métricas en tiempo real",
    stack: ["Vue.js", "Python", "Redis", "Kubernetes"],
    progress: 45,
    status: "draft",
    members: 5,
    lastActivity: "2024-01-12"
  },
  {
    id: "3",
    name: "Mobile App",
    description: "Aplicación móvil para gestión de inventario",
    stack: ["React Native", "Firebase", "TypeScript"],
    progress: 90,
    status: "published", 
    members: 12,
    lastActivity: "2024-01-14"
  }
];

const Home = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [projects] = useState(mockProjects);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Hasta la próxima",
    });
  };

  const handleCreateProject = () => {
    toast({
      title: "Próximamente",
      description: "La creación de proyectos estará disponible pronto",
    });
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-stepable-2xl font-bold text-primary">Stepable</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Proyectos
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-stepable-3xl font-bold mb-2">Mis Proyectos</h2>
            <p className="text-muted-foreground">
              Gestiona el onboarding de tus equipos de desarrollo
            </p>
          </div>
          <Button onClick={handleCreateProject} className="stepable-button">
            <Plus className="mr-2 h-4 w-4" />
            Crear proyecto
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="stepable-card hover:shadow-medium cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-stepable-xl group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={project.status === "published" ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {project.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stack */}
                    <div>
                      <p className="text-sm font-medium mb-2">Stack tecnológico</p>
                      <div className="flex flex-wrap gap-1">
                        {project.stack.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    {project.status === "published" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">Progreso del onboarding</p>
                          <span className="text-sm text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="stepable-progress h-2" />
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{project.members} miembros</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>Últ. actividad: {new Date(project.lastActivity).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Empty state
          <Card className="stepable-card text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-stepable-xl mb-2">
                ¡Crea tu primer proyecto!
              </CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                Comienza subiendo las guías de tu equipo y genera un plan de onboarding
                personalizado para nuevos desarrolladores.
              </CardDescription>
              <Button onClick={handleCreateProject} className="stepable-button">
                <Plus className="mr-2 h-4 w-4" />
                Crear proyecto
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Home;