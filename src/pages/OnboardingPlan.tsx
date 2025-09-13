import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Sparkles, 
  MoreHorizontal, 
  Edit3, 
  Move, 
  Trash2,
  Play,
  BookOpen,
  Code,
  HelpCircle,
  Plus,
  Eye,
  Target,
  Users,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

// Mock data para el plan de onboarding
const mockModules = [
  {
    id: "1",
    title: "Introducción al Proyecto",
    description: "Conoce la arquitectura y objetivos del sistema",
    order: 1,
    status: "published",
    progress: 100,
    lessons: [
      {
        id: "1-1",
        title: "Arquitectura del Sistema",
        type: "read",
        duration: "15 min",
        completed: true
      },
      {
        id: "1-2", 
        title: "Stack Tecnológico",
        type: "read",
        duration: "10 min",
        completed: true
      },
      {
        id: "1-3",
        title: "Quiz: Conceptos Básicos",
        type: "quiz",
        duration: "5 min",
        completed: true
      }
    ]
  },
  {
    id: "2",
    title: "Flujo de Desarrollo",
    description: "Aprende las convenciones y procesos del equipo",
    order: 2,
    status: "published",
    progress: 67,
    lessons: [
      {
        id: "2-1",
        title: "Guía de Pull Requests",
        type: "read",
        duration: "20 min",
        completed: true
      },
      {
        id: "2-2",
        title: "Práctica: Crear un PR",
        type: "practice",
        duration: "30 min",
        completed: true
      },
      {
        id: "2-3",
        title: "Convenciones de Naming",
        type: "read",
        duration: "15 min",
        completed: false
      },
      {
        id: "2-4",
        title: "Práctica: Naming y Branches",
        type: "practice",
        duration: "20 min",
        completed: false
      }
    ]
  },
  {
    id: "3",
    title: "Testing y Calidad",
    description: "Estrategias de testing y validación de código",
    order: 3,
    status: "draft",
    progress: 0,
    lessons: [
      {
        id: "3-1",
        title: "Estrategia de Testing",
        type: "read",
        duration: "25 min",
        completed: false
      },
      {
        id: "3-2",
        title: "Práctica: Escribir Tests",
        type: "practice", 
        duration: "45 min",
        completed: false
      },
      {
        id: "3-3",
        title: "Quiz: Testing Avanzado",
        type: "quiz",
        duration: "10 min",
        completed: false
      }
    ]
  }
];

const OnboardingPlan = () => {
  const [modules] = useState(mockModules);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "read":
        return <BookOpen className="h-4 w-4" />;
      case "practice":
        return <Code className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "read":
        return "Lectura";
      case "practice":
        return "Práctica";
      case "quiz":
        return "Quiz";
      default:
        return "Lectura";
    }
  };

  const handleGeneratePlan = () => {
    toast({
      title: "Próximamente",
      description: "La generación automática con IA estará disponible pronto",
    });
  };

  const handlePublishModule = (moduleId: string) => {
    toast({
      title: "Próximamente",
      description: "La publicación de módulos estará disponible pronto",
    });
  };

  const handleEditModule = (moduleId: string) => {
    toast({
      title: "Próximamente",
      description: "La edición de módulos estará disponible pronto",
    });
  };

  const handlePlayLesson = (lessonId: string) => {
    navigate(`/project/${projectId}/onboarding/player?lesson=${lessonId}`);
    toast({
      title: "Iniciando lección",
      description: "Cargando contenido de la lección...",
    });
  };

  const handleCreateModule = () => {
    toast({
      title: "Nuevo módulo",
      description: "Funcionalidad de creación de módulos disponible próximamente",
    });
  };

  const handleJoinCourse = () => {
    toast({
      title: "¡Genial!",
      description: "Te has unido al curso de onboarding",
    });
  };

  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, module) => acc + module.lessons.filter(lesson => lesson.completed).length, 
    0
  );
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-stepable-3xl font-bold">Plan de Onboarding</h1>
            <p className="text-muted-foreground mt-1">
              Módulos y lecciones para la formación del equipo
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleGeneratePlan}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generar con IA
            </Button>
            <Button className="stepable-button" onClick={handleCreateModule}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo módulo
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="stepable-card bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Progreso general del plan
              </span>
              <span className="text-sm text-muted-foreground">
                {completedLessons}/{totalLessons} lecciones completadas
              </span>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="stepable-progress h-3 mb-2" />
              <motion.div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
              <span className="font-medium text-primary">{overallProgress}% completado</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {modules.length} módulos
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Equipo activo
                </span>
              </div>
            </div>
            
            {overallProgress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">¡Plan completado al 100%! 🎉</span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {modules.map((module) => (
          <Card key={module.id} className="stepable-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-stepable-xl">
                      {module.order}. {module.title}
                    </CardTitle>
                    <Badge 
                      variant={module.status === "published" ? "default" : "secondary"}
                    >
                      {module.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                  
                  {/* Module Progress */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Progreso del módulo</span>
                      <span className="text-xs text-muted-foreground">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="stepable-progress h-1.5" />
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditModule(module.id)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Move className="mr-2 h-4 w-4" />
                      Reordenar
                    </DropdownMenuItem>
                    {module.status === "draft" && (
                      <DropdownMenuItem onClick={() => handlePublishModule(module.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Publicar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                {module.lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-md group cursor-pointer"
                    onClick={() => handlePlayLesson(lesson.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${lesson.completed ? 'text-green-600 bg-green-100' : 'text-muted-foreground bg-muted'}`}>
                          {getTypeIcon(lesson.type)}
                        </div>
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {index + 1}. {lesson.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
                        {getTypeLabel(lesson.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {lesson.completed ? (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pendiente
                        </Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayLesson(lesson.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover-scale"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card className="stepable-card text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-stepable-xl mb-2">
              Genera tu primer plan
            </CardTitle>
            <CardDescription className="mb-6 max-w-md mx-auto">
              Usa IA para crear automáticamente un plan de onboarding basado
              en los documentos de tu biblioteca.
            </CardDescription>
            <Button onClick={handleGeneratePlan} className="stepable-button">
              <Sparkles className="mr-2 h-4 w-4" />
              Generar plan con IA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnboardingPlan;