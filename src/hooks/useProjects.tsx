import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProjectDocumentation } from "@/components/CreateProjectDialog";
import { geminiService } from "@/services/geminiService";
import { courseService } from "@/services/courseService";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
  // Propiedades para proyectos temporales
  isTemporary?: boolean;
  courseModules?: any[];
  documentation?: any;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by: string | null;
  joined_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Scope projects to the authenticated user (member or owner)
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const user = authData?.user;
      if (!user) {
        setProjects([]);
        return;
      }

      // Fetch projects where the user is a member
      const memberPromise = supabase
        .from('project_members')
        .select('projects(*)')
        .eq('user_id', user.id);

      // And projects owned by the user (in case some legacy projects lack membership rows)
      const ownerPromise = supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);

      const [memberRes, ownerRes] = await Promise.all([memberPromise, ownerPromise]);

      if (memberRes.error) throw memberRes.error;
      if (ownerRes.error) throw ownerRes.error;

      const memberProjects = (memberRes.data || [])
        .map((row: any) => (row as any).projects)
        .filter(Boolean);
      const ownedProjects = ownerRes.data || [];

      // Merge unique by id
      const uniqueMap = new Map<string, Project>();
      [...memberProjects, ...ownedProjects].forEach((p: any) => {
        if (p && p.id) uniqueMap.set(p.id, p);
      });

      setProjects(Array.from(uniqueMap.values()));
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description: string, documentation?: ProjectDocumentation) => {
    console.log('🚀 [DEBUG] Iniciando creación de proyecto temporal:', { name, description, documentation });
    
    try {
      // Verificar autenticación
      console.log('🔐 [DEBUG] Verificando autenticación...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ [DEBUG] Error de autenticación:', authError);
        return;
      }
      
      if (!user) {
        console.error('❌ [DEBUG] Usuario no autenticado');
        return;
      }
      
      console.log('✅ [DEBUG] Usuario autenticado:', user.id);

      // Crear proyecto real en Supabase
      console.log('📝 [DEBUG] Creando proyecto en Supabase...');
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          owner_id: user.id,
          settings: {}
        })
        .select()
        .single();

      if (projectError) {
        console.error('❌ [DEBUG] Error creando proyecto:', projectError);
        throw projectError;
      }

      console.log('✅ [DEBUG] Proyecto creado en Supabase:', project);

      // Asegurar membresía del propietario como 'owner'
      try {
        await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            user_id: user.id,
            role: 'owner'
          });
        console.log('✅ [DEBUG] Membresía del propietario creada');
      } catch (memErr) {
        console.warn('⚠️ [DEBUG] No se pudo crear la membresía del propietario:', memErr);
      }

      // Guardar documentación si se proporciona
      if (documentation) {
        console.log('📄 [DEBUG] Guardando documentación del proyecto...');
        const { error: docError } = await supabase
          .from('project_documentation')
          .insert({
            project_id: project.id,
            pr_template: documentation.pr_template || '',
            code_nomenclature: documentation.code_nomenclature || '',
            gitflow_docs: documentation.gitflow_docs || '',
            additional_docs: documentation.additional_docs || '',
            file_attachments: []
          });

        if (docError) {
          console.warn('⚠️ [DEBUG] Error guardando documentación:', docError);
          // No lanzamos error aquí, la documentación es opcional
        } else {
          console.log('✅ [DEBUG] Documentación guardada exitosamente');
        }
      }

      // Generar contenido del curso con IA
      console.log('🤖 [DEBUG] Generando contenido del curso con IA...');
      // Mostrar toast de carga
      toast({
        title: "Generando contenido del curso",
        description: "Estamos creando los módulos de onboarding con IA...",
      });
      
      let courseModules = [];
      try {
        const generatedCourse = await geminiService.generateCourse(
          name,
          description,
          documentation || {
            pr_template: '',
            code_nomenclature: '',
            gitflow_docs: '',
            additional_docs: ''
          }
        );
        
        courseModules = generatedCourse.modules;
        console.log('✅ [DEBUG] Contenido del curso generado:', courseModules);

        // Guardar los módulos del curso en Supabase
        console.log('💾 [DEBUG] Guardando módulos del curso en Supabase...');
        await courseService.createCourseModules(project.id, courseModules);
        console.log('✅ [DEBUG] Módulos del curso guardados en Supabase');
      } catch (aiError) {
        console.error('❌ [DEBUG] Error generando contenido con IA:', aiError);
        // Crear módulos de ejemplo si falla la IA
        courseModules = [
          {
            title: "Introducción al Proyecto",
            summary: "Módulo introductorio sobre los conceptos básicos del proyecto.",
            quiz: {
              title: "Quiz de Introducción",
              questions: [
                {
                  question: "¿Cuál es el objetivo principal del proyecto?",
                  options: ["Objetivo A", "Objetivo B", "Objetivo C"],
                  correct: 0
                }
              ]
            }
          },
          {
            title: "Desarrollo y Implementación",
            summary: "Guía práctica para el desarrollo del proyecto.",
            quiz: {
              title: "Quiz de Desarrollo",
              questions: [
                {
                  question: "¿Cuál es la metodología de desarrollo recomendada?",
                  options: ["Metodología A", "Metodología B", "Metodología C"],
                  correct: 0
                }
              ]
            }
          }
        ];

        try {
          console.log('💾 [DEBUG] Guardando módulos de ejemplo en Supabase...');
          await courseService.createCourseModules(project.id, courseModules);
          console.log('✅ [DEBUG] Módulos de ejemplo guardados en Supabase');
        } catch (fallbackError) {
          console.error('❌ [DEBUG] Error guardando módulos de ejemplo:', fallbackError);
        }
      }

      // Recargar la lista de proyectos para incluir el nuevo proyecto
      console.log('🔄 [DEBUG] Recargando lista de proyectos...');
      await fetchProjects();
      
      toast({
        title: "¡Proyecto creado exitosamente!",
        description: `El proyecto "${name}" ha sido creado con ${courseModules.length} módulos de curso.`,
      });
      
      console.log('🎉 [DEBUG] Proceso de creación completado exitosamente');

      // Generar actividades del proyecto con IA (no bloqueante)
      try {
        console.log('🤖 [DEBUG] Generando actividades del proyecto con IA...');
        const docs = documentation || {
          pr_template: '',
          code_nomenclature: '',
          gitflow_docs: '',
          additional_docs: ''
        };
        const activities = await geminiService.generateActivities(name, description, docs);
        const mergedSettings = {
          ...(typeof project.settings === 'object' && project.settings !== null ? project.settings : {}),
          activities: activities.activities,
          activities_generated_at: new Date().toISOString()
        } as any;
        const upd = await supabase
          .from('projects')
          .update({ settings: mergedSettings, updated_at: new Date().toISOString() })
          .eq('id', project.id);
        if (upd.error) throw upd.error;
        console.log('✅ [DEBUG] Actividades generadas y guardadas');
        // Refrescar proyectos en background
        fetchProjects();
      } catch (actErr) {
        console.warn('⚠️ [DEBUG] No se pudieron generar actividades:', actErr);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Error general en createProject:', error);
      console.error('❌ [DEBUG] Detalles completos del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
    }
  };

  const generateActivities = async (projectId: string) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('No authenticated');

      // Cargar proyecto y documentación
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (projErr || !project) throw projErr || new Error('Proyecto no encontrado');

      const { data: docsRow } = await supabase
        .from('project_documentation')
        .select('*')
        .eq('project_id', projectId)
        .single();

      const docs = {
        pr_template: docsRow?.pr_template || '',
        code_nomenclature: docsRow?.code_nomenclature || '',
        gitflow_docs: docsRow?.gitflow_docs || '',
        additional_docs: docsRow?.additional_docs || ''
      };

      const gen = await geminiService.generateActivities(project.name, project.description || '', docs);
      const mergedSettings = {
        ...(typeof project.settings === 'object' && project.settings !== null ? project.settings : {}),
        activities: gen.activities,
        activities_generated_at: new Date().toISOString()
      } as any;

      const { error: updErr } = await supabase
        .from('projects')
        .update({ settings: mergedSettings, updated_at: new Date().toISOString() })
        .eq('id', projectId);
      if (updErr) throw updErr;

      toast({
        title: 'Actividades generadas',
        description: 'Se creó un backlog inicial con IA'
      });

      await fetchProjects();
      return gen.activities;
    } catch (error) {
      console.error('Error generating activities:', error);
      toast({ title: 'No fue posible generar actividades', description: 'Intenta nuevamente más tarde' });
      return [];
    }
  };

  const updateProject = async (projectId: string, updates: { name?: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Proyecto actualizado",
        description: "Los cambios se han guardado correctamente"
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Verificar si es un proyecto temporal
      const project = projects.find(p => p.id === projectId);
      if (project?.isTemporary) {
        // Eliminar de la lista local
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        toast({
          title: "Proyecto temporal eliminado",
          description: "El proyecto temporal ha sido eliminado de la memoria"
        });
        return;
      }

      // Verificar propietario actual antes de eliminar
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) throw new Error('No authenticated');
        if (project && project.owner_id && project.owner_id !== user.id) {
          throw new Error('Unauthorized: solo el propietario puede eliminar el proyecto');
        }
      } catch (permErr) {
        console.warn('⚠️ Permisos insuficientes para eliminar el proyecto:', permErr);
        throw permErr;
      }

      // Eliminar datos relacionados (orden seguro por claves foráneas)
      // 1) Contenidos del curso (quizzes/summaries -> topics)
      try {
        const { data: topics } = await supabase
          .from('course_topics')
          .select('id')
          .eq('project_id', projectId);
        const topicIds = (topics || []).map((t: any) => t.id);
        if (topicIds.length > 0) {
          const delQuizzes = await supabase
            .from('course_quizzes')
            .delete()
            .in('topic_id', topicIds);
          if (delQuizzes.error) throw delQuizzes.error;

          const delSummaries = await supabase
            .from('course_summaries')
            .delete()
            .in('topic_id', topicIds);
          if (delSummaries.error) throw delSummaries.error;
        }

        const delTopics = await supabase
          .from('course_topics')
          .delete()
          .eq('project_id', projectId);
        if (delTopics.error) throw delTopics.error;
      } catch (contentErr) {
        console.warn('⚠️ Error eliminando contenidos del curso:', contentErr);
      }

      // 2) Documentación del proyecto
      try {
        const delDocs = await supabase
          .from('project_documentation')
          .delete()
          .eq('project_id', projectId);
        if (delDocs.error) throw delDocs.error;
      } catch (docErr) {
        console.warn('⚠️ Error eliminando documentación del proyecto:', docErr);
      }

      // 3) Invitaciones y códigos de invitación
      try {
        const delInvites = await supabase
          .from('project_invitations')
          .delete()
          .eq('project_id', projectId);
        if (delInvites.error) throw delInvites.error;

        const delCodes = await supabase
          .from('project_invite_codes')
          .delete()
          .eq('project_id', projectId);
        if (delCodes.error) throw delCodes.error;
      } catch (invErr) {
        console.warn('⚠️ Error eliminando invitaciones/códigos:', invErr);
      }

      // 4) Membresías
      try {
        const delMembers = await supabase
          .from('project_members')
          .delete()
          .eq('project_id', projectId);
        if (delMembers.error) throw delMembers.error;
      } catch (memErr) {
        console.warn('⚠️ Error eliminando membresías:', memErr);
      }

      // 5) Proyecto
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      if (error) throw error;

      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado permanentemente"
      });

      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const leaveProject = async (projectId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) throw new Error('No authenticated');

      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);
      if (error) throw error;

      // Refrescar lista de proyectos para reflejar salida
      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error leaving project:', error);
      return false;
    }
  };

  const joinProjectByCode = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('project-invite-codes?action=join', {
        body: { code },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to join project');
      }

      toast({
        title: "¡Te has unido al proyecto!",
        description: `Ahora eres miembro de "${data.data.project_name}"`
      });

      fetchProjects();
      return data.data;
    } catch (error: any) {
      console.error('Error joining project:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    generateActivities,
    leaveProject,
    joinProjectByCode,
    refetch: fetchProjects
  };
}

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          project_id,
          user_id,
          role,
          invited_by,
          joined_at,
          profiles(email, full_name, avatar_url)
        `)
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .is('accepted_at', null);

      if (invitationsError) throw invitationsError;

      setMembers((membersData as any) || []);
      setInvitations(invitationsData || []);
      
      // Fetch invite codes
      await fetchInviteCodes();
    } catch (error: any) {
      console.error('Error loading project members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteCodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(`project-invite-codes?project_id=${projectId}`, {
        method: 'GET'
      });

      if (error) {
        console.warn('Could not fetch invite codes:', error);
        return;
      }

      if (data?.success) {
        setInviteCodes(data.data || []);
      }
    } catch (error) {
      console.warn('Could not fetch invite codes:', error);
    }
  };

  const generateInviteCode = async (role: 'admin' | 'member' | 'viewer' = 'member', expiresInDays: number = 30, usesLeft?: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('project-invite-codes?action=generate', {
        body: {
          project_id: projectId,
          role,
          expires_in_days: expiresInDays,
          uses_left: usesLeft
        },
        method: 'POST'
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate invite code');
      }

      toast({
        title: "Código generado",
        description: "Se ha creado un nuevo código de invitación"
      });

      await fetchInviteCodes();
      return data.data;
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      throw error;
    }
  };

  const deleteInviteCode = async (codeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(`project-invite-codes?code_id=${codeId}`, {
        method: 'DELETE'
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete invite code');
      }

      toast({
        title: "Código eliminado", 
        description: "El código de invitación ha sido eliminado"
      });

      await fetchInviteCodes();
    } catch (error: any) {
      console.error('Error deleting invite code:', error);
      throw error;
    }
  };

  const inviteUser = async (email: string, role: 'admin' | 'member' | 'viewer' = 'member') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const { error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          email,
          role,
          invited_by: user.id,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email}`
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error inviting user:', error);
    }
  };

  const changeRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Rol actualizado",
        description: "El rol del miembro se ha actualizado correctamente"
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error changing role:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del proyecto"
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada"
      });

      fetchMembers();
    } catch (error: any) {
      console.error('Error canceling invitation:', error);
    }
  };

  const leaveProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Has salido del proyecto",
        description: "Ya no formas parte de este proyecto"
      });

      return true;
    } catch (error: any) {
      console.error('Error leaving project:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  return {
    members,
    invitations,
    inviteCodes,
    loading,
    inviteUser,
    changeRole,
    removeMember,
    cancelInvitation,
    leaveProject,
    generateInviteCode,
    deleteInviteCode,
    refetch: fetchMembers
  };
}
