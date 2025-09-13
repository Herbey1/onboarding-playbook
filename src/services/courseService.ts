import { supabase } from '@/integrations/supabase/client';
import type { CourseModule } from './geminiService';

export interface CourseTopic {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseSummary {
  id: string;
  topic_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CourseQuiz {
  id: string;
  topic_id: string;
  title: string;
  questions: any[];
  created_at: string;
  updated_at: string;
}

class CourseService {
  async createCourseModules(projectId: string, modules: CourseModule[]): Promise<void> {
    try {
      // Crear los módulos en orden
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        
        // 1. Crear el topic
        const { data: topic, error: topicError } = await supabase
          .from('course_topics')
          .insert({
            project_id: projectId,
            title: module.title,
            description: `Módulo ${i + 1} del curso de onboarding`,
            order_index: i
          })
          .select()
          .single();

        if (topicError) {
          console.error('Error creating topic:', topicError);
          throw new Error(`Error al crear el módulo "${module.title}": ${topicError.message}`);
        }

        // 2. Crear el summary
        const { error: summaryError } = await supabase
          .from('course_summaries')
          .insert({
            topic_id: topic.id,
            content: module.summary
          });

        if (summaryError) {
          console.error('Error creating summary:', summaryError);
          throw new Error(`Error al crear el resumen para "${module.title}": ${summaryError.message}`);
        }

        // 3. Crear el quiz
        const { error: quizError } = await supabase
          .from('course_quizzes')
          .insert({
            topic_id: topic.id,
            title: module.quiz.title,
            questions: module.quiz.questions
          });

        if (quizError) {
          console.error('Error creating quiz:', quizError);
          throw new Error(`Error al crear el quiz para "${module.title}": ${quizError.message}`);
        }
      }
    } catch (error) {
      console.error('Error creating course modules:', error);
      throw error;
    }
  }

  async getCourseModules(projectId: string): Promise<{
    topics: CourseTopic[];
    summaries: CourseSummary[];
    quizzes: CourseQuiz[];
  }> {
    try {
      // Obtener topics
      const { data: topics, error: topicsError } = await supabase
        .from('course_topics')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (topicsError) {
        throw new Error(`Error al obtener los módulos: ${topicsError.message}`);
      }

      if (!topics || topics.length === 0) {
        return { topics: [], summaries: [], quizzes: [] };
      }

      const topicIds = topics.map(t => t.id);

      // Obtener summaries
      const { data: summaries, error: summariesError } = await supabase
        .from('course_summaries')
        .select('*')
        .in('topic_id', topicIds);

      if (summariesError) {
        throw new Error(`Error al obtener los resúmenes: ${summariesError.message}`);
      }

      // Obtener quizzes
      const { data: quizzes, error: quizzesError } = await supabase
        .from('course_quizzes')
        .select('*')
        .in('topic_id', topicIds);

      if (quizzesError) {
        throw new Error(`Error al obtener los quizzes: ${quizzesError.message}`);
      }

      return {
        topics: topics || [],
        summaries: summaries || [],
        quizzes: quizzes || []
      };
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
  }

  async deleteCourseModules(projectId: string): Promise<void> {
    try {
      // Al eliminar los topics, los summaries y quizzes se eliminan automáticamente por CASCADE
      const { error } = await supabase
        .from('course_topics')
        .delete()
        .eq('project_id', projectId);

      if (error) {
        throw new Error(`Error al eliminar los módulos: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting course modules:', error);
      throw error;
    }
  }

  async updateCourseTopic(topicId: string, updates: { title?: string; description?: string }): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_topics')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId);

      if (error) {
        throw new Error(`Error al actualizar el módulo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating course topic:', error);
      throw error;
    }
  }

  async updateCourseSummary(summaryId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_summaries')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', summaryId);

      if (error) {
        throw new Error(`Error al actualizar el resumen: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating course summary:', error);
      throw error;
    }
  }

  async updateCourseQuiz(quizId: string, updates: { title?: string; questions?: any[] }): Promise<void> {
    try {
      const { error } = await supabase
        .from('course_quizzes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId);

      if (error) {
        throw new Error(`Error al actualizar el quiz: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating course quiz:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService();