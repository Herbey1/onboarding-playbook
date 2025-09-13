import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinProjectDialogProps {
  onJoinProject: (inviteCode: string) => Promise<void>;
  loading?: boolean;
}

const JoinProjectDialog = ({ onJoinProject, loading }: JoinProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      return;
    }

    try {
      await onJoinProject(inviteCode.trim());
      setOpen(false);
      setInviteCode("");
      // Evitamos duplicar el toast; el hook ya notifica el éxito
    } catch (error) {
      console.error('Error joining project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover-glow">
          <Code className="mr-2 h-4 w-4" />
          Unirse por código
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Unirse a un proyecto</DialogTitle>
            <DialogDescription>
              Ingresa el código de invitación que te proporcionó el administrador del proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inviteCode">Código de invitación</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123DEF456"
                required
                className="uppercase tracking-wider"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                El código debe ser proporcionado por un administrador del proyecto
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !inviteCode.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Uniéndose...
                </>
              ) : (
                "Unirse al proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinProjectDialog;
