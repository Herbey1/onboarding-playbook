import { motion } from "framer-motion";
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
import { EmptyState } from "@/components/EmptyStates";

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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass border-b border-border shadow-soft sticky top-0 z-10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h1 className="text-stepable-2xl font-bold gradient-primary bg-clip-text text-transparent">
                Stepable
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex hover-scale">
                Proyectos
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover-glow">
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
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div>
            <h2 className="text-stepable-3xl font-bold mb-2">Mis Proyectos</h2>
            <p className="text-muted-foreground">
              Gestiona el onboarding de tus equipos de desarrollo
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button onClick={handleCreateProject} className="stepable-button hover-glow">
              <Plus className="mr-2 h-4 w-4" />
              Crear proyecto
            </Button>
          </motion.div>
        </motion.div>

        {projects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.7 + index * 0.1,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="group"
              >
                <Card
                  className="stepable-card hover:shadow-strong cursor-pointer group h-full bg-card/80 backdrop-blur-sm border-0 transition-all duration-300"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-stepable-xl group-hover:text-primary transition-colors duration-200">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="ml-2"
                      >
                        <Badge 
                          variant={project.status === "published" ? "default" : "secondary"}
                          className="hover-scale transition-transform duration-200"
                        >
                          {project.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stack */}
                      <div>
                        <p className="text-sm font-medium mb-2">Stack tecnológico</p>
                        <motion.div 
                          className="flex flex-wrap gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 + index * 0.1 }}
                        >
                          {project.stack.map((tech, techIndex) => (
                            <motion.div
                              key={tech}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                delay: 1.1 + index * 0.1 + techIndex * 0.05,
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
                        </motion.div>
                      </div>

                      {/* Progress */}
                      {project.status === "published" && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Progreso del onboarding</p>
                            <span className="text-sm text-muted-foreground font-medium text-primary">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} className="stepable-progress h-3" />
                        </motion.div>
                      )}

                      {/* Metadata */}
                      <motion.div 
                        className="flex items-center justify-between text-sm text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                      >
                        <div className="flex items-center space-x-1 hover:text-foreground transition-colors">
                          <Users className="h-4 w-4" />
                          <span>{project.members} miembros</span>
                        </div>
                        <div className="flex items-center space-x-1 hover:text-foreground transition-colors">
                          <BookOpen className="h-4 w-4" />
                          <span>Últ. actividad: {new Date(project.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <EmptyState
              variant="projects"
              title="¡Crea tu primer proyecto!"
              description="Comienza subiendo las guías de tu equipo y genera un plan de onboarding personalizado para nuevos desarrolladores."
              actionLabel="Crear proyecto"
              onAction={handleCreateProject}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Home;