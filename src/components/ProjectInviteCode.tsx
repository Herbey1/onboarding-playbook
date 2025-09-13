import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Users, Calendar, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useProjectMembers } from "@/hooks/useProjects";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectInviteCodeProps {
  projectId: string;
  children: React.ReactNode;
}

const ProjectInviteCode = ({ projectId, children }: ProjectInviteCodeProps) => {
  const [open, setOpen] = useState(false);
  const { inviteUser, members, invitations, inviteCodes, generateInviteCode, deleteInviteCode } = useProjectMembers(projectId);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [newCodeRole, setNewCodeRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const { toast } = useToast();

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "¡Código copiado!",
        description: "El código de invitación ha sido copiado al portapapeles",
      });
    } catch (error) {
      console.error('Error copying code to clipboard:', error);
    }
  };

  const handleGenerateNewCode = async () => {
    setGeneratingCode(true);
    try {
      await generateInviteCode(newCodeRole, 30);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await deleteInviteCode(codeId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleInviteByEmail = async (email: string) => {
    try {
      await inviteUser(email, 'member');
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email}`,
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invitar miembros al proyecto
          </DialogTitle>
          <DialogDescription>
            Comparte el código de invitación o envía invitaciones por email
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Generate New Code Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Generar nuevo código</Label>
            <div className="flex items-center gap-2">
              <Select value={newCodeRole} onValueChange={setNewCodeRole as any}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateNewCode}
                disabled={generatingCode}
                className="flex-shrink-0"
              >
                {generatingCode ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {generatingCode ? 'Generando...' : 'Generar código'}
              </Button>
            </div>
          </div>

          {/* Active Invite Codes */}
          {inviteCodes && inviteCodes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Códigos activos ({inviteCodes.length})
              </Label>
              <div className="space-y-2">
                {inviteCodes.map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <Badge variant="secondary" className="text-xs">
                          {code.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expira: {format(new Date(code.expires_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        {code.uses_left && ` • ${code.uses_left} usos restantes`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCode(code.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Members */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Miembros actuales ({members?.length || 0})
            </Label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {member.profiles?.full_name?.charAt(0).toUpperCase() || 
                         member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {member.profiles?.full_name || member.profiles?.email || 'Usuario'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations && invitations.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Invitaciones pendientes ({invitations.length})
              </Label>
              <div className="max-h-24 overflow-y-auto space-y-2">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Enviada {format(new Date(invitation.created_at), "dd/MM/yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      Pendiente
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectInviteCode;