import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Target, CheckCircle, Users, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { EmptyState } from "@/components/EmptyStates";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectDialog, { type ProjectDocumentation } from "@/components/CreateProjectDialog";
import JoinProjectDialog from "@/components/JoinProjectDialog";

import { supabase } from "@/integrations/supabase/client";
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

// Project members cache for performance
const projectMembersCache = new Map();

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, deleteProject, leaveProject, joinProjectByCode } = useProjects();
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [leaveProjectId, setLeaveProjectId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleCreateProject = async (name: string, description: string, documentation: ProjectDocumentation) => {
    if (!user) return;
    await createProject(name, description, documentation);
  };

  const onDeleteProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      await deleteProject(projectId);
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente"
      });
      setDeleteProjectId(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const onLeaveProject = async (projectId: string) => {
    setActionLoading(true);
    try {
      const success = await leaveProject(projectId);
      if (success) {
        toast({
          title: "Has salido del proyecto",
          description: "Ya no formas parte de este proyecto"
        });
        setLeaveProjectId(null);
      }
    } catch (error) {
      console.error('Error leaving project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const onJoinProject = async (inviteCode: string) => {
    setActionLoading(true);
    try {
      await joinProjectByCode(inviteCode);
    } catch (error) {
      console.error('Error joining project:', error);
    } finally {
      setActionLoading(false);
    }
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
            <JoinProjectDialog onJoinProject={onJoinProject} loading={actionLoading} />
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
              onClick={() => deleteProjectId && onDeleteProject(deleteProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {actionLoading ? 'Eliminando...' : 'Eliminar'}
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
              onClick={() => leaveProjectId && onLeaveProject(leaveProjectId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saliendo...' : 'Abandonar'}
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
  // Create a minimal hook instance just for this project's members
  const [members, setMembers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await supabase
          .from('project_members')
          .select(`
            id,
            project_id,
            user_id,
            role,
            joined_at,
            profiles(email, full_name, avatar_url)
          `)
          .eq('project_id', project.id);
        
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
        setMembers([]);
      }
    };

    fetchMembers();
  }, [project.id]);
  
  return (
    <ProjectCard
      project={project}
      members={members}
      index={index}
      currentUserId={currentUserId}
      onDelete={onDelete}
      onLeave={onLeave}
    />
  );
};

export default Home;