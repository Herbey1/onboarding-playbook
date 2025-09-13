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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ProjectDocumentation {
  pr_template: string;
  code_nomenclature: string;
  gitflow_docs: string;
  additional_docs: string;
}

interface CreateProjectDialogProps {
  onCreateProject: (name: string, description: string, documentation: ProjectDocumentation) => Promise<void>;
  loading?: boolean;
}

const CreateProjectDialog = ({ onCreateProject, loading }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [documentation, setDocumentation] = useState<ProjectDocumentation>({
    pr_template: "",
    code_nomenclature: "",
    gitflow_docs: "",
    additional_docs: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      return;
    }

    try {
      await onCreateProject(name.trim(), description.trim(), documentation);
      setOpen(false);
      setName("");
      setDescription("");
      setDocumentation({
        pr_template: "",
        code_nomenclature: "",
        gitflow_docs: "",
        additional_docs: ""
      });
      toast({
        title: "¡Proyecto creado!",
        description: "Tu nuevo proyecto ha sido creado exitosamente",
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const updateDocumentation = (field: keyof ProjectDocumentation, value: string) => {
    setDocumentation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-glow animate-glow-pulse">
          <Plus className="mr-2 h-4 w-4" />
          Crear proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear nuevo proyecto</DialogTitle>
            <DialogDescription>
              Crea un nuevo proyecto de onboarding para tu equipo. Incluye la documentación necesaria para generar el curso.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] py-4">
            <div className="grid gap-6 px-1">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del proyecto *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Sistema de Pagos"
                  required
                  maxLength={100}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción del proyecto *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe detalladamente tu proyecto y su propósito..."
                  maxLength={1000}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Documentación del proyecto *</Label>
                
                <div className="grid gap-2">
                  <Label htmlFor="pr_template">Plantilla de Pull Requests</Label>
                  <Textarea
                    id="pr_template"
                    value={documentation.pr_template}
                    onChange={(e) => updateDocumentation('pr_template', e.target.value)}
                    placeholder="Describe la estructura y formato que deben seguir los Pull Requests..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="code_nomenclature">Nomenclatura del código</Label>
                  <Textarea
                    id="code_nomenclature"
                    value={documentation.code_nomenclature}
                    onChange={(e) => updateDocumentation('code_nomenclature', e.target.value)}
                    placeholder="Especifica las convenciones de nombres para variables, funciones, clases, etc..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gitflow_docs">Documentación de Gitflow</Label>
                  <Textarea
                    id="gitflow_docs"
                    value={documentation.gitflow_docs}
                    onChange={(e) => updateDocumentation('gitflow_docs', e.target.value)}
                    placeholder="Describe el flujo de trabajo con Git: ramas, merges, releases..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="additional_docs">Documentación adicional</Label>
                  <Textarea
                    id="additional_docs"
                    value={documentation.additional_docs}
                    onChange={(e) => updateDocumentation('additional_docs', e.target.value)}
                    placeholder="Cualquier otra documentación relevante del proyecto..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !description.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;