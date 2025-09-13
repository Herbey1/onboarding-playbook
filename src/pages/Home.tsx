import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Code, TrendingUp, Target, Clock, Zap, ArrowRight, Star, CheckCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { EmptyState } from "@/components/EmptyStates";

// Mock data for projects - enhanced with more engaging data
const mockProjects = [
  {
    id: "1",
    name: "Sistema de Pagos",
    description: "API REST para procesamiento de pagos con Stripe y webhooks",
    stack: ["React", "Node.js", "PostgreSQL", "Docker", "Stripe"],
    progress: 75,
    status: "published",
    members: 8,
    lastActivity: "2024-01-15",
    completedModules: 6,
    totalModules: 8,
    averageRating: 4.8,
    daysActive: 15,
    recentActivity: "2 horas"
  },
  {
    id: "2", 
    name: "Dashboard Analytics",
    description: "Panel de control con métricas en tiempo real y visualizaciones",
    stack: ["Vue.js", "Python", "Redis", "Kubernetes", "D3.js"],
    progress: 45,
    status: "draft",
    members: 5,
    lastActivity: "2024-01-12",
    completedModules: 3,
    totalModules: 7,
    averageRating: 4.2,
    daysActive: 8,
    recentActivity: "1 día"
  },
  {
    id: "3",
    name: "Mobile App",
    description: "Aplicación móvil para gestión de inventario en tiempo real",
    stack: ["React Native", "Firebase", "TypeScript", "Redux"],
    progress: 90,
    status: "published", 
    members: 12,
    lastActivity: "2024-01-14",
    completedModules: 9,
    totalModules: 10,
    averageRating: 4.9,
    daysActive: 25,
    recentActivity: "30 min"
  }
];

// Enhanced stack colors with more variety
const stackColors: Record<string, string> = {
  "React": "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  "Node.js": "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  "PostgreSQL": "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
  "Docker": "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  "Vue.js": "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
  "Python": "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  "Redis": "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  "Kubernetes": "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  "React Native": "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200",
  "Firebase": "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  "TypeScript": "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  "Stripe": "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200",
  "D3.js": "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  "Redux": "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
};

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

  const handleCreateProject = () => {
    toast({
      title: "Próximamente",
      description: "La creación de proyectos estará disponible pronto",
    });
  };

  // Enhanced stats for dashboard
  const dashboardStats = [
    { 
      label: "Proyectos Activos", 
      value: projects.filter(p => p.status === "published").length.toString(),
      icon: Target, 
      color: "text-primary",
      trend: "+2 este mes"
    },
    { 
      label: "Módulos Completados", 
      value: projects.reduce((sum, p) => sum + p.completedModules, 0).toString(),
      icon: CheckCircle, 
      color: "text-success",
      trend: "+8 esta semana"
    },
    { 
      label: "Miembros Activos", 
      value: projects.reduce((sum, p) => sum + p.members, 0).toString(),
      icon: Users, 
      color: "text-accent",
      trend: "+5 nuevos"
    },
    { 
      label: "Promedio Calificación", 
      value: (projects.reduce((sum, p) => sum + p.averageRating, 0) / projects.length).toFixed(1),
      icon: Star, 
      color: "text-warning",
      trend: "Excelente"
    }
  ];

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section with Stats */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.h2 
            className="text-stepable-3xl font-bold mb-2 text-gradient-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            ¡Bienvenido de vuelta!
          </motion.h2>
          <motion.p 
            className="text-muted-foreground text-stepable-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Continúa gestionando el onboarding de tus equipos de desarrollo
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-primary/5 border-2 hover:border-primary/20">
                  <CardContent className="p-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3"
                    >
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </motion.div>
                    <div className="text-stepable-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-xs text-accent font-medium">{stat.trend}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Projects Header with Quick Actions */}
      <motion.div 
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex-1">
          <h3 className="text-stepable-2xl font-bold mb-2">Mis Proyectos</h3>
          <p className="text-muted-foreground">
            Gestiona y monitorea el progreso de tus proyectos de onboarding
          </p>
        </div>
        
        <div className="flex gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="hover-glow">
              <Code className="mr-2 h-4 w-4" />
              Unirse por código
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="blue" onClick={handleCreateProject} className="shadow-glow animate-glow-pulse">
              <Plus className="mr-2 h-4 w-4" />
              Crear proyecto
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Projects Grid or Empty State */}
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
                        <Clock className="h-4 w-4" />
                        <span>{project.recentActivity}</span>
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
          transition={{ delay: 0.9, duration: 0.5 }}
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
    </div>
  );
};

export default Home;