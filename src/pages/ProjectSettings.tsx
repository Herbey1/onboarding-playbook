import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Copy, 
  MoreHorizontal, 
  Users, 
  Key, 
  Globe, 
  Trash2,
  Edit3,
  Calendar,
  Shield,
  Mail,
  UserPlus,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProjectMembers } from "@/hooks/useProjects";

const ProjectSettings = () => {
  const { projectId = "00000000-0000-0000-0000-000000000001" } = useParams();
  const { user } = useAuth();
  const { members, invitations, loading, inviteUser, changeRole, removeMember, cancelInvitation, leaveProject } = useProjectMembers(projectId);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInviteUser = async () => {
    if (!inviteEmail) {
      return;
    }

    try {
      await inviteUser(inviteEmail, inviteRole);
      setInviteEmail("");
      setShowInviteDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      await changeRole(memberId, newRole);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleLeaveProject = async () => {
    const success = await leaveProject();
    if (success) {
      navigate("/");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Propietario";
      case "admin":
        return "Administrador";
      case "member":
        return "Miembro";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  const isOwner = (member: any) => {
    return member.role === 'owner' || member.user_id === user?.id && member.role === 'owner';
  };

  const canManageMember = (member: any) => {
    const currentUserMember = members.find(m => m.user_id === user?.id);
    if (!currentUserMember) return false;
    
    // Owners can manage everyone except other owners
    if (currentUserMember.role === 'owner') {
      return member.role !== 'owner';
    }
    
    // Admins can manage members and viewers
    if (currentUserMember.role === 'admin') {
      return ['member', 'viewer'].includes(member.role);
    }
    
    return false;
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-stepable-3xl font-bold">Ajustes del Proyecto</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona miembros, roles y configuración del proyecto
        </p>
      </motion.div>

      {/* Team Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="stepable-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-stepable-xl flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Miembros del equipo</span>
                </CardTitle>
                <CardDescription>
                  Gestiona los roles y permisos de los miembros ({members.length} miembros)
                </CardDescription>
              </div>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="stepable-button">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invitar miembro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invitar nuevo miembro</DialogTitle>
                    <DialogDescription>
                      Envía una invitación por email para unirse al proyecto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@empresa.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select value={inviteRole} onValueChange={(value: 'admin' | 'member' | 'viewer') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="member">Miembro</SelectItem>
                          <SelectItem value="viewer">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInviteUser}>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar invitación
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Se unió</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {(member.profiles?.full_name || member.profiles?.email || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.profiles?.full_name || member.profiles?.email?.split('@')[0] || 'Usuario'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.profiles?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {canManageMember(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== "admin" && (
                              <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                                <Shield className="mr-2 h-4 w-4" />
                                Hacer Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== "member" && (
                              <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                                <Users className="mr-2 h-4 w-4" />
                                Hacer Miembro
                              </DropdownMenuItem>
                            )}
                            {member.role !== "viewer" && (
                              <DropdownMenuItem onClick={() => handleChangeRole(member.id, "viewer")}>
                                <Users className="mr-2 h-4 w-4" />
                                Hacer Visualizador
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente a este miembro del proyecto. No podrá acceder al contenido ni participar en actividades.
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {member.user_id === user?.id && !isOwner(member) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Salir del proyecto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ya no tendrás acceso al proyecto y deberás ser invitado nuevamente para volver a unirte.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleLeaveProject}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Salir del proyecto
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invitaciones pendientes
                </h3>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-muted-foreground">
                            Invitado como {getRoleLabel(invitation.role)} • Expira {new Date(invitation.expires_at).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelInvitation(invitation.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="stepable-card">
          <CardHeader>
            <CardTitle className="text-stepable-xl flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Información del proyecto</span>
            </CardTitle>
            <CardDescription>
              Configuración general del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del proyecto</Label>
                  <Input value="Sistema de Pagos" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select value="es" disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value="Plataforma de onboarding inteligente" disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                La edición de información del proyecto estará disponible próximamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProjectSettings;