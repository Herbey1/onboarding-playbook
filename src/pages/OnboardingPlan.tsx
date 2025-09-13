import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  TrendingUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCourseModules } from "@/hooks/useCourseModules";
import { useProjects } from "@/hooks/useProjects";
import { geminiService } from "@/services/geminiService";
import { courseService } from "@/services/courseService";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}


const OnboardingPlan = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjects();
  const { modules, loading, error, fetchModules, deleteModule } = useCourseModules();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const currentProject = projects.find(p => p.id === projectId);
  
  // Fetch modules when component mounts or projectId changes
  useState(() => {
    if (projectId) {
      fetchModules(projectId);
    }
  }, [projectId, fetchModules]);
  
  const handleRegenerateContent = async () => {
    if (!currentProject || !projectId) {
      return;
    }
    
    setIsGenerating(true);
    try {
      // Get project documentation
      const projectDocs = await courseService.getProjectDocumentation(projectId);
      
      // Generate new content with Gemini
      const generatedModules = await geminiService.generateCourse(
        currentProject.name,
        currentProject.description || '',
        projectDocs
      );
      
      // Delete existing modules
      for (const module of modules) {
        await deleteModule(module.id);
      }
      
      // Create new modules
      await courseService.createCourseModules(projectId, generatedModules);
      
      // Refresh modules
      await fetchModules(projectId);
      
      toast({
        title: "Contenido regenerado",
        description: "El contenido del curso ha sido regenerado exitosamente"
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const calculateOverallProgress = () => {
    if (modules.length === 0) return 0;
    // For now, return 0 as we don't have progress tracking yet
    return 0;
  };
  
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'topic': return BookOpen;
      case 'summary': return Eye;
      case 'quiz': return HelpCircle;
      default: return BookOpen;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los módulos: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!currentProject) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Proyecto no encontrado
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentProject.name} - Plan de Onboarding
          </h1>
          <p className="text-muted-foreground">
            Módulos generados automáticamente con IA
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRegenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Regenerar Contenido'}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Progreso general</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {modules.length} módulos disponibles
            </span>
          </div>
          <Progress value={calculateOverallProgress()} className="h-3" />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span className="font-bold text-primary">
              {calculateOverallProgress()}% completado
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {modules.length} módulos
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {modules.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay módulos disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Los módulos se generan automáticamente cuando se crea el proyecto.
            </p>
            <Button onClick={handleRegenerateContent} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generando...' : 'Generar Módulos'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-6">
        {modules.map((module, index) => {
          const ModuleIcon = getModuleIcon(module.type);
          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">
                          {module.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ModuleIcon className="h-3 w-3" />
                            {module.type === 'topic' ? 'Tema' : 
                             module.type === 'summary' ? 'Resumen' : 'Quiz'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver contenido
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteModule(module.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Content Preview */}
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {module.content && module.content.length > 200 
                      ? `${module.content.substring(0, 200)}...` 
                      : module.content || 'Sin contenido disponible'
                    }
                  </div>
                  
                  {/* Quiz Questions Count */}
                  {module.type === 'quiz' && module.quiz_questions && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                      {JSON.parse(module.quiz_questions).length} preguntas
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      {module.type === 'quiz' ? 'Tomar Quiz' : 'Ver Contenido'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingPlan;