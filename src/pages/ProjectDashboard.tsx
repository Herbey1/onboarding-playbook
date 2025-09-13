import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  BookOpen, 
  Settings, 
  Activity, 
  Calendar,
  FileText,
  Play,
  BarChart3,
  UserCheck,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, useProjectMembers } from "@/hooks/useProjects";
import { useCourseModules } from "@/hooks/useCourseModules";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useProjects();
  const { members, loading: membersLoading } = useProjectMembers(projectId!);
  const { modules, loading: modulesLoading } = useCourseModules(projectId!);
  
  const project = projects?.find(p => p.id === projectId);
  const isOwner = project?.owner_id === user?.id;
  const userMember = members?.find(m => m.user_id === user?.id);
  const isAdmin = isOwner || userMember?.role === 'admin';

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Proyecto no encontrado</h2>
          <p className="text-muted-foreground">El proyecto que buscas no existe o no tienes acceso.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-primary text-primary-foreground';
      case 'admin': return 'bg-secondary text-secondary-foreground';
      case 'member': return 'bg-accent text-accent-foreground';
      case 'viewer': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'admin': return 'Administrador';
      case 'member': return 'Miembro';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-stepable-3xl font-bold text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            {userMember && (
              <Badge className={getRoleColor(userMember.role)}>
                {getRoleLabel(userMember.role)}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Creado {format(new Date(project.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => navigate(`/project/${projectId}/manage`)}>
              <Settings className="h-4 w-4 mr-2" />
              Gestionar
            </Button>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="stepable-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/project/${projectId}/onboarding/plan`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Onboarding</h3>
                <p className="text-sm text-muted-foreground">
                  {modules.length} módulos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stepable-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/project/${projectId}/onboarding/player`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Play className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Comenzar Curso</h3>
                <p className="text-sm text-muted-foreground">
                  Aprender ahora
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stepable-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/project/${projectId}/analytics`)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Ver estadísticas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="stepable-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/project/${projectId}/manage`)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Configuración</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestionar proyecto
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="stepable-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros del Equipo
              </CardTitle>
              <CardDescription>
                {members?.length || 0} miembros activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-1" />
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {members?.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {(member.profiles?.full_name || member.profiles?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.profiles?.full_name || 'Usuario'}
                          {member.user_id === user?.id && ' (Tú)'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {member.profiles?.email}
                        </p>
                      </div>
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                  ))}
                  {(members?.length || 0) > 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate(`/project/${projectId}/manage`)}
                    >
                      Ver todos los miembros ({members?.length})
                    </Button>
                  )}
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => navigate(`/project/${projectId}/manage`)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Gestionar miembros
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="stepable-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Contenido del Curso
              </CardTitle>
              <CardDescription>
                Módulos de onboarding disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modulesLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  ))}
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-3">
                  {modules.slice(0, 3).map((module, index) => (
                    <div key={module.topic.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{module.topic.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          Módulo {index + 1}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {module.topic.description}
                      </p>
                    </div>
                  ))}
                  {modules.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      y {modules.length - 3} módulos más...
                    </p>
                  )}
                  <Button 
                    className="w-full mt-3"
                    onClick={() => navigate(`/project/${projectId}/onboarding/plan`)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ver todos los módulos
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay módulos de curso disponibles
                  </p>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => navigate(`/project/${projectId}/manage`)}
                    >
                      Configurar contenido
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="stepable-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimos cambios en el proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Proyecto creado</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(project.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
              
              {project.updated_at !== project.created_at && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Última actualización</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(project.updated_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProjectDashboard;