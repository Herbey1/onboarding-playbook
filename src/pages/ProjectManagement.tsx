import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings, 
  Users, 
  Trash2, 
  UserPlus, 
  Crown, 
  Shield, 
  Eye,
  Mail,
  Calendar,
  ExternalLink,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, useProjectMembers } from "@/hooks/useProjects";
import ProjectInviteCode from "@/components/ProjectInviteCode";
import ProjectDocumentationManager from "@/components/ProjectDocumentationManager";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ProjectManagement = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, updateProject, deleteProject } = useProjects();
  const { 
    members, 
    invitations, 
    inviteUser, 
    changeRole, 
    removeMember, 
    cancelInvitation,
    leaveProject 
  } = useProjectMembers(projectId!);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [settingsData, setSettingsData] = useState({
    name: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  
  const project = projects?.find(p => p.id === projectId);
  const isOwner = project?.owner_id === user?.id;
  const userMember = members?.find(m => m.user_id === user?.id);
  const isAdmin = isOwner || userMember?.role === 'admin';

  // Initialize settings data when project loads
  useEffect(() => {
    if (project) {
      setSettingsData({
        name: project.name,
        description: project.description || ""
      });
    }
  }, [project]);

  if (!project) {
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

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await inviteUser(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${inviteEmail}`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      await changeRole(memberId, newRole);
      toast({
        title: "Rol actualizado",
        description: "El rol del miembro ha sido actualizado exitosamente",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del proyecto",
      });
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateProject(projectId!, {
        name: settingsData.name || undefined,
        description: settingsData.description || undefined
      });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId!);
      navigate('/');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleLeaveProject = async () => {
    try {
      const success = await leaveProject();
      if (success) {
        navigate('/');
        toast({
          title: "Proyecto abandonado",
          description: "Has abandonado el proyecto exitosamente",
        });
      }
    } catch (error) {
      console.error('Error leaving project:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-stepable-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Gestionar configuración y miembros del proyecto</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/project/${projectId}`)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver proyecto
        </Button>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="documentation">Documentación</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Configuración</TabsTrigger>}
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Invite Section */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invitar miembros
                </CardTitle>
                <CardDescription>
                  Invita nuevos miembros al proyecto por email o comparte el código de invitación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleInviteUser} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={setInviteRole as any}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Invitar</Button>
                </form>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t" />
                  <span className="text-xs text-muted-foreground px-2">o</span>
                  <div className="flex-1 border-t" />
                </div>
                
                <ProjectInviteCode projectId={projectId!}>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Compartir código de invitación
                  </Button>
                </ProjectInviteCode>
              </CardContent>
            </Card>
          )}

          {/* Current Members */}
          <Card>
            <CardHeader>
              <CardTitle>Miembros del proyecto ({members?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {member.profiles?.full_name?.charAt(0).toUpperCase() || 
                           member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.profiles?.full_name || 'Usuario'}
                          {member.user_id === user?.id && ' (Tú)'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.profiles?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Se unió {format(new Date(member.joined_at), "dd/MM/yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isAdmin && member.user_id !== user?.id && member.user_id !== project.owner_id ? (
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleChangeRole(member.id, newRole as any)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(member.role)}
                                <span className="capitalize">{member.role}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleColor(member.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">
                              {member.user_id === project.owner_id ? 'Owner' : member.role}
                            </span>
                          </div>
                        </Badge>
                      )}
                      
                      {isAdmin && member.user_id !== user?.id && member.user_id !== project.owner_id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará a {member.profiles?.full_name || member.profiles?.email} del proyecto.
                                No podrá acceder hasta que sea invitado nuevamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {invitations && invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invitaciones pendientes ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Rol: {invitation.role} • Enviada {format(new Date(invitation.created_at), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave Project */}
          {!isOwner && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de peligro</CardTitle>
                <CardDescription>
                  Abandonar este proyecto hará que pierdas acceso a todos sus contenidos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Abandonar proyecto
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Abandonar proyecto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Perderás acceso a este proyecto inmediatamente. Un administrador
                        podrá invitarte nuevamente si es necesario.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeaveProject}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Abandonar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <ProjectDocumentationManager 
            projectId={projectId!} 
            canEdit={isAdmin} 
          />
        </TabsContent>

        {/* Settings Tab */}
        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del proyecto</CardTitle>
                <CardDescription>
                  Administra la información básica del proyecto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleUpdateProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nombre del proyecto</Label>
                    <Input
                      id="projectName"
                      value={settingsData.name}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre del proyecto"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Descripción</Label>
                    <Textarea
                      id="projectDescription"
                      value={settingsData.description}
                      onChange={(e) => setSettingsData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe tu proyecto..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {isOwner && (
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-destructive">Zona de peligro</CardTitle>
                  <CardDescription>
                    Las siguientes acciones son irreversibles y eliminarán permanentemente el proyecto.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar proyecto
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente
                          el proyecto "{project.name}" y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProject}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar permanentemente
                      </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProjectManagement;