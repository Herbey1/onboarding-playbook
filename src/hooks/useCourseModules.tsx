import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { courseService, type CourseTopic, type CourseSummary, type CourseQuiz } from '@/services/courseService';

export interface CourseModuleData {
  topic: CourseTopic;
  summary: CourseSummary | null;
  quiz: CourseQuiz | null;
}

export function useCourseModules(projectId: string) {
  const [modules, setModules] = useState<CourseModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchModules = async () => {
    if (!projectId) {
      setModules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { topics, summaries, quizzes } = await courseService.getCourseModules(projectId);
      
      // Combinar los datos en una estructura más fácil de usar
      const moduleData: CourseModuleData[] = topics.map(topic => {
        const summary = summaries.find(s => s.topic_id === topic.id) || null;
        const quiz = quizzes.find(q => q.topic_id === topic.id) || null;
        
        return {
          topic,
          summary,
          quiz
        };
      });
      
      setModules(moduleData);
    } catch (error: any) {
      console.error('Error fetching course modules:', error);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (topicId: string, updates: { title?: string; description?: string }) => {
    try {
      await courseService.updateCourseTopic(topicId, updates);
      toast({
        title: 'Módulo actualizado',
        description: 'Los cambios se han guardado correctamente'
      });
      await fetchModules();
    } catch (error: any) {
      console.error('Error updating topic:', error);
    }
  };

  const updateSummary = async (summaryId: string, content: string) => {
    try {
      await courseService.updateCourseSummary(summaryId, content);
      toast({
        title: 'Contenido actualizado',
        description: 'El resumen se ha guardado correctamente'
      });
      await fetchModules();
    } catch (error: any) {
      console.error('Error updating summary:', error);
    }
  };

  const updateQuiz = async (quizId: string, updates: { title?: string; questions?: any[] }) => {
    try {
      await courseService.updateCourseQuiz(quizId, updates);
      toast({
        title: 'Quiz actualizado',
        description: 'Las preguntas se han guardado correctamente'
      });
      await fetchModules();
    } catch (error: any) {
      console.error('Error updating quiz:', error);
    }
  };

  const deleteAllModules = async () => {
    try {
      await courseService.deleteCourseModules(projectId);
      toast({
        title: 'Módulos eliminados',
        description: 'Todos los módulos del curso han sido eliminados'
      });
      setModules([]);
    } catch (error: any) {
      console.error('Error deleting modules:', error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [projectId]);

  return {
    modules,
    loading,
    fetchModules,
    updateTopic,
    updateSummary,
    updateQuiz,
    deleteAllModules
  };
}