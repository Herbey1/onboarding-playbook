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
import { Copy, RefreshCw, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjectMembers } from "@/hooks/useProjects";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProjectInviteCodeProps {
  projectId: string;
  children: React.ReactNode;
}

const ProjectInviteCode = ({ projectId, children }: ProjectInviteCodeProps) => {
  const [open, setOpen] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const { inviteUser, members, invitations } = useProjectMembers(projectId);
  const { toast } = useToast();

  // Generate a mock invite code (in real app this would come from backend)
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [inviteCode] = useState(generateInviteCode());

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      toast({
        title: "¡Código copiado!",
        description: "El código de invitación ha sido copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código al portapapeles",
        variant: "destructive",
      });
    }
  };

  const handleGenerateNewCode = async () => {
    setGeneratingCode(true);
    // TODO: Implement generate new code in backend
    setTimeout(() => {
      setGeneratingCode(false);
      toast({
        title: "Nuevo código generado",
        description: "Se ha generado un nuevo código de invitación",
      });
    }, 1000);
  };

  const handleInviteByEmail = async (email: string) => {
    try {
      await inviteUser(email, 'member');
      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la invitación",
        variant: "destructive",
      });
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
          {/* Invite Code Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Código de invitación</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={inviteCode} 
                readOnly 
                className="font-mono text-center tracking-widest text-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNewCode}
                disabled={generatingCode}
                className="flex-shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${generatingCode ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Los miembros pueden usar este código para unirse al proyecto
            </p>
          </div>

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