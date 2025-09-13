import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Play, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  Circle,
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useCourseModules } from "@/hooks/useCourseModules";
import { geminiService } from "@/services/geminiService";
import { courseService } from "@/services/courseService";

const OnboardingPlan = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { modules, loading } = useCourseModules(projectId!);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const currentProject = projects.find(p => p.id === projectId);
  
  const handleRegenerateContent = async () => {
    if (!currentProject || !projectId) {
      return;
    }
    
    setIsGenerating(true);
    try {
      // Delete existing modules first
      await courseService.deleteCourseModules(projectId);
      
      // Generate new content with Gemini
      const generatedCourse = await geminiService.generateCourse(
        currentProject.name,
        currentProject.description || '',
        {
          pr_template: '',
          code_nomenclature: '',
          gitflow_docs: '',
          additional_docs: ''
        }
      );
      
      // Create new modules
      await courseService.createCourseModules(projectId, generatedCourse.modules);
      
      toast({
        title: "Contenido regenerado",
        description: "El contenido del curso ha sido regenerado exitosamente"
      });
      
      // Refresh page to show new content
      window.location.reload();
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast({
        title: "Error al regenerar",
        description: "Hubo un problema al regenerar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCourse = () => {
    navigate(`/project/${projectId}/onboarding/player`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-64 animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-96 animate-pulse" />
          </div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse" />
        </div>
        
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-72" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentProject) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-stepable-3xl font-bold text-foreground">
            Plan de Onboarding
          </h1>
          <p className="text-muted-foreground mt-2">
            Curso personalizado para {currentProject.name}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary">
              {modules.length} módulos
            </Badge>
            <span className="text-sm text-muted-foreground">
              • Estimado 2-3 horas
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerateContent}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? 'Regenerando...' : 'Regenerar IA'}
          </Button>
          {modules.length > 0 && (
            <Button onClick={handleStartCourse} className="gap-2">
              <Play className="h-4 w-4" />
              Comenzar Curso
            </Button>
          )}
        </div>
      </motion.div>

      <Separator />

      {/* Course Overview */}
      {modules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay módulos disponibles</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Este proyecto aún no tiene módulos de onboarding. Genera contenido personalizado con IA.
          </p>
          <Button onClick={handleRegenerateContent} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? 'Generando...' : 'Generar Contenido'}
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="stepable-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Progreso del Curso
                </CardTitle>
                <CardDescription>
                  Tu avance en el programa de onboarding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso general</span>
                    <span className="text-sm text-muted-foreground">0/{modules.length} completados</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Estimado: 2-3 horas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>0 módulos completados</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Modules */}
          <div className="space-y-4">
            <h2 className="text-stepable-xl font-semibold">Módulos del Curso</h2>
            
            <div className="grid gap-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 2) }}
                >
                  <Card className="stepable-card hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/project/${projectId}/onboarding/player`)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {module.topic.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {module.topic.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Circle className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Content Preview */}
                        {module.summary && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium mb-1">Contenido de aprendizaje</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {module.summary.content.substring(0, 120)}...
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Quiz Preview */}
                        {module.quiz && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-sm font-medium mb-1">{module.quiz.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(module.quiz.questions) 
                                  ? `${module.quiz.questions.length} preguntas` 
                                  : 'Quiz disponible'}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            Módulo {index + 1} de {modules.length}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ~20 min
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center pt-6"
          >
            <Button size="lg" onClick={handleStartCourse} className="gap-2">
              <Play className="h-5 w-5" />
              Comenzar el Curso Completo
            </Button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default OnboardingPlan;