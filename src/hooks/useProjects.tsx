import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
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
        .select(`
          *,
          project_members!inner(
            role,
            profiles(email, full_name)
          )
        `);

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          owner_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as owner member
      await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      toast({
        title: "Proyecto creado",
        description: `El proyecto "${name}" se ha creado correctamente`
      });

      fetchProjects();
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto",
        variant: "destructive"
      });
      throw error;
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
      toast({
        title: "Error",
        description: "No se pudo actualizar el proyecto",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: error.message || "Código de invitación inválido o expirado", 
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros del proyecto",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el código de invitación",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el código",
        variant: "destructive"
      });
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
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Este usuario ya tiene una invitación pendiente",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la invitación",
          variant: "destructive"
        });
      }
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
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "No se pudo eliminar al miembro",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "No se pudo cancelar la invitación",
        variant: "destructive"
      });
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
      toast({
        title: "Error",
        description: "No se pudo salir del proyecto",
        variant: "destructive"
      });
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