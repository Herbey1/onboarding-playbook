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
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;
      setProjects(data || []);
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

      // Crear proyecto temporal en memoria (sin guardar en Supabase)
      console.log('📝 [DEBUG] Creando proyecto temporal en memoria...');
      const tempProject = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {}
      };

      console.log('✅ [DEBUG] Proyecto temporal creado:', tempProject);

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
      } catch (aiError) {
         console.error('❌ [DEBUG] Error generando contenido con IA:', aiError);
         // Crear módulos de ejemplo si falla la IA
         courseModules = [
           {
             title: "Introducción al Proyecto",
             description: "Módulo introductorio sobre los conceptos básicos del proyecto.",
             order: 1,
             content: "Contenido introductorio generado localmente."
           },
           {
             title: "Desarrollo y Implementación",
             description: "Guía práctica para el desarrollo del proyecto.",
             order: 2,
             content: "Contenido de desarrollo generado localmente."
           }
         ];
      }

      // Agregar el proyecto temporal a la lista local
      console.log('💾 [DEBUG] Agregando proyecto temporal a la lista local...');
      const projectWithModules = {
        ...tempProject,
        courseModules,
        documentation,
        isTemporary: true // Marcar como temporal
      };
      
      // Actualizar el estado local agregando el proyecto temporal
      setProjects(prevProjects => [projectWithModules, ...prevProjects]);
      
      toast({
        title: "¡Proyecto temporal creado!",
        description: `El proyecto "${name}" ha sido creado en memoria. Los datos se eliminarán al salir de la aplicación.`,
      });
      
      console.log('🎉 [DEBUG] Proceso de creación temporal completado exitosamente');
      
    } catch (error) {
      console.error('❌ [DEBUG] Error general en createProject:', error);
      console.error('❌ [DEBUG] Detalles completos del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
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
    
    // Limpiar proyectos temporales al desmontar el componente
    return () => {
      console.log('🧹 [DEBUG] Limpiando proyectos temporales al salir de la aplicación...');
      setProjects(prevProjects => {
        const permanentProjects = prevProjects.filter(project => !project.isTemporary);
        console.log('✅ [DEBUG] Proyectos temporales eliminados. Proyectos permanentes restantes:', permanentProjects.length);
        return permanentProjects;
      });
    };
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
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