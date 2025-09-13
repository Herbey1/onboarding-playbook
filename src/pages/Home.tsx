import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Target, CheckCircle, Users, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, useProjectMembers } from "@/hooks/useProjects";
import { EmptyState } from "@/components/EmptyStates";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import JoinProjectDialog from "@/components/JoinProjectDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, deleteProject, joinProjectByCode } = useProjects();
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [leaveProjectId, setLeaveProjectId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleCreateProject = async (name: string, description?: string) => {
    if (!user) return;
    await createProject(name, description);
  };

  const handleJoinProject = async (inviteCode: string) => {
    if (!user) return;
    await joinProjectByCode(inviteCode);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setDeleteProjectId(null);
  };

  const handleLeaveProject = async (projectId: string) => {
    const projectMembers = useProjectMembers(projectId);
    const success = await projectMembers.leaveProject();
    if (success) {
      // Project will be removed from list automatically when we refetch
    }
    setLeaveProjectId(null);
  };

  // Calculate real dashboard stats
  const dashboardStats = [
    { 
      label: "Proyectos Totales", 
      value: projects?.length.toString() || "0",
      icon: Target, 
      color: "text-primary",
      trend: "Proyectos creados"
    },
    { 
      label: "Proyectos como Propietario", 
      value: projects?.filter(p => p.owner_id === user?.id).length.toString() || "0",
      icon: CheckCircle, 
      color: "text-success",
      trend: "Proyectos propios"
    },
    { 
      label: "Colaboraciones", 
      value: projects?.filter(p => p.owner_id !== user?.id).length.toString() || "0",
      icon: Users, 
      color: "text-accent",
      trend: "Proyectos colaborando"
    },
    { 
      label: "Actividad", 
      value: projects?.length > 0 ? "Activo" : "Inicial",
      icon: Star, 
      color: "text-warning",
      trend: "Estado general"
    }
  ];

  if (authLoading || !user) return null;

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
            <JoinProjectDialog onJoinProject={handleJoinProject} loading={projectsLoading} />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <CreateProjectDialog onCreateProject={handleCreateProject} loading={projectsLoading} />
          </motion.div>
        </div>
      </motion.div>

      {/* Projects Grid or Empty State */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-full bg-muted rounded mb-4"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {projects.map((project, index) => (
            <ProjectWithMembers 
              key={project.id} 
              project={project} 
              index={index}
              currentUserId={user?.id}
              onDelete={() => setDeleteProjectId(project.id)}
              onLeave={() => setLeaveProjectId(project.id)}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <EmptyState
            variant="projects"
            title="¡Crea tu primer proyecto!"
            description="Comienza creando un proyecto y genera un plan de onboarding personalizado para nuevos desarrolladores."
            actionLabel="Crear proyecto"
            onAction={() => {}}
          />
        </motion.div>
      )}

      {/* Delete Project Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto 
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && handleDeleteProject(deleteProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Project Dialog */}
      <AlertDialog open={!!leaveProjectId} onOpenChange={() => setLeaveProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Abandonar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejarás de tener acceso a este proyecto. Un administrador podrá invitarte nuevamente si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaveProjectId && handleLeaveProject(leaveProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Abandonar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Component to fetch and display project with members
const ProjectWithMembers = ({ 
  project, 
  index, 
  currentUserId, 
  onDelete, 
  onLeave 
}: { 
  project: any; 
  index: number; 
  currentUserId?: string;
  onDelete: () => void;
  onLeave: () => void;
}) => {
  const { members } = useProjectMembers(project.id);
  
  return (
    <ProjectCard
      project={project}
      members={members || []}
      index={index}
      currentUserId={currentUserId}
      onDelete={onDelete}
      onLeave={onLeave}
    />
  );
};

export default Home;