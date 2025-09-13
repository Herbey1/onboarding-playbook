import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Calendar, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  settings: any;
  // Propiedades para proyectos temporales
  isTemporary?: boolean;
  courseModules?: any[];
  documentation?: any;
}

interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface ProjectCardProps {
  project: Project;
  members: ProjectMember[];
  index: number;
  onDelete?: (projectId: string) => void;
  onLeave?: (projectId: string) => void;
  currentUserId?: string;
}

const ProjectCard = ({ project, members, index, onDelete, onLeave, currentUserId }: ProjectCardProps) => {
  const navigate = useNavigate();
  
  const isOwner = project.owner_id === currentUserId;
  const userMember = members.find(m => m.user_id === currentUserId);
  
  // Calculate project stats
  const memberCount = members.length;
  const lastActivity = format(new Date(project.updated_at), "PPP", { locale: es });
  
  // Mock completion percentage - in real app this would come from actual progress data
  const completionPercentage = Math.floor(Math.random() * 100);

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        if (onDelete) onDelete(project.id);
        break;
      case 'leave':
        if (onLeave) onLeave(project.id);
        break;
      case 'settings':
        navigate(`/project/${project.id}/settings`);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: 0.1 + index * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group"
    >
      <Card className="stepable-card hover:shadow-strong cursor-pointer group h-full bg-card/80 backdrop-blur-sm border-0 transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1" onClick={() => navigate(`/project/${project.id}`)}>
              <div className="flex items-center gap-2">
                <CardTitle className="text-stepable-xl group-hover:text-primary transition-colors duration-200">
                  {project.name}
                </CardTitle>
                {project.isTemporary && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
                    Temporal
                  </span>
                )}
              </div>
              <CardDescription className="mt-2">
                {project.description || "Sin descripción"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "Propietario" : userMember?.role || "Miembro"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleMenuAction('settings')}>
                    Configuración
                  </DropdownMenuItem>
                  {!isOwner && (
                    <DropdownMenuItem 
                      onClick={() => handleMenuAction('leave')}
                      className="text-destructive"
                    >
                      Abandonar proyecto
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <DropdownMenuItem 
                      onClick={() => handleMenuAction('delete')}
                      className="text-destructive"
                    >
                      Eliminar proyecto
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Progreso del onboarding</p>
                <span className="text-sm text-muted-foreground font-medium text-primary">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="stepable-progress h-3" />
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-4 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
                </span>
              </div>
              <div className="flex items-center space-x-2 hover:text-foreground transition-colors">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(project.created_at), "dd/MM/yyyy")}
                </span>
              </div>
            </motion.div>

            {/* Last activity */}
            <motion.div 
              className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Clock className="h-3 w-3" />
              <span>Última actividad: {lastActivity}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;