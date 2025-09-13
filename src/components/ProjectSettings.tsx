import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

const ProjectSettings = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, updateProject } = useProjects();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  const { toast } = useToast();
  
  const project = projects?.find(p => p.id === projectId);
  const isOwner = project?.owner_id === user?.id;

  // Initialize form data when project loads
  useEffect(() => {
    if (project) {
      setFormData({
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sin permisos</h2>
          <p className="text-muted-foreground">Solo el propietario del proyecto puede modificar la configuración.</p>
          <Button onClick={() => navigate(`/project/${projectId}`)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al proyecto
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateProject(projectId!, {
        name: formData.name || undefined,
        description: formData.description || undefined
      });
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/project/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-stepable-2xl font-bold">Configuración del Proyecto</h1>
          <p className="text-muted-foreground">Actualiza la información básica del proyecto</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>
            Modifica el nombre y descripción de tu proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proyecto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del proyecto"
                required
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe brevemente tu proyecto..."
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/project/${projectId}`)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saving || !formData.name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSettings;