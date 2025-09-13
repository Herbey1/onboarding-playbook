import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  CheckCircle,
  Zap,
  TrendingUp
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
    <motion.div 
      className="p-8 bg-gradient-subtle min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-stepable-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Plan de Onboarding
            </h1>
            <p className="text-muted-foreground text-stepable-xl">
              Módulos y lecciones para la formación del equipo
            </p>
          </motion.div>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={handleGeneratePlan} className="hover-glow">
                <Sparkles className="mr-2 h-4 w-4" />
                Generar con IA
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="blue" onClick={handleCreateModule} className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo módulo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="apple-card border-2 border-primary/10 overflow-hidden">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-4">
                <motion.span 
                  className="text-stepable-base font-semibold flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div 
                    className="p-2 rounded-xl bg-primary/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Target className="h-5 w-5 text-primary" />
                  </motion.div>
                  Progreso general del plan
                </motion.span>
                <motion.span 
                  className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  {completedLessons}/{totalLessons} lecciones completadas
                </motion.span>
              </div>
              <div className="relative mb-4">
                <Progress value={overallProgress} className="h-4 bg-muted rounded-full overflow-hidden" />
                <motion.div
                  className="absolute top-0 left-0 h-4 bg-gradient-to-r from-primary via-accent to-secondary rounded-full shadow-inner"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
                />
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <motion.span 
                  className="font-bold text-primary text-stepable-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  {overallProgress}% completado
                </motion.span>
                <div className="flex items-center gap-6">
                  <motion.span 
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 }}
                  >
                    <BookOpen className="h-4 w-4" />
                    {modules.length} módulos
                  </motion.span>
                  <motion.span 
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <Users className="h-4 w-4" />
                    Equipo activo
                  </motion.span>
                </div>
              </div>
              
              <AnimatePresence>
                {overallProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-soft"
                  >
                    <div className="flex items-center gap-3 text-green-800">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                      >
                        <Award className="h-6 w-6" />
                      </motion.div>
                      <span className="font-semibold text-stepable-base">¡Plan completado al 100%! 🎉</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modules */}
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.9 + index * 0.15,
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="apple-card border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-medium"
                      >
                        {module.order}
                      </motion.div>
                      <div className="flex-1">
                        <CardTitle className="text-stepable-2xl text-foreground mb-2">
                          {module.title}
                        </CardTitle>
                        <Badge 
                          variant={module.status === "published" ? "default" : "secondary"}
                          className="hover-scale"
                        >
                          {module.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-stepable-base">
                      {module.description}
                    </CardDescription>
                    
                    {/* Module Progress */}
                    <motion.div 
                      className="mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">Progreso del módulo</span>
                        <span className="text-sm font-bold text-primary">{module.progress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={module.progress} className="h-2 bg-muted rounded-full" />
                        <motion.div
                          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${module.progress}%` }}
                          transition={{ delay: 1.5 + index * 0.1, duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="apple-card">
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
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <motion.div 
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 + lessonIndex * 0.05 }}
                      className="group flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-all duration-300 hover:shadow-medium cursor-pointer apple-card"
                      onClick={() => handlePlayLesson(lesson.id)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <motion.div 
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              lesson.completed 
                                ? 'text-green-600 bg-green-100 shadow-soft' 
                                : 'text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary'
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            {getTypeIcon(lesson.type)}
                          </motion.div>
                          <div>
                            <span className="text-stepable-base font-semibold group-hover:text-primary transition-colors">
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              <Badge variant="outline" className="text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
                                {getTypeLabel(lesson.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {lesson.completed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200 shadow-soft">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completada
                            </Badge>
                          </motion.div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Pendiente
                          </Badge>
                        )}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
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
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {modules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="apple-card text-center py-16">
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-6"
                >
                  <Sparkles className="h-10 w-10 text-primary animate-pulse-soft" />
                </motion.div>
                <CardTitle className="text-stepable-2xl mb-3 text-gradient-primary">
                  Genera tu primer plan
                </CardTitle>
                <CardDescription className="mb-8 max-w-md mx-auto text-stepable-base">
                  Usa IA para crear automáticamente un plan de onboarding basado
                  en los documentos de tu biblioteca.
                </CardDescription>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="blue" onClick={handleGeneratePlan} className="shadow-glow">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar plan con IA
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingPlan;