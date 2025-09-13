import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Save,
  Plus,
  Eye,
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectDocumentation {
  id?: string;
  project_id: string;
  pr_template: string;
  code_nomenclature: string;
  gitflow_docs: string;
  additional_docs: string;
  file_attachments?: any;
  created_at?: string;
  updated_at?: string;
}

interface ProjectDocumentationManagerProps {
  projectId: string;
  canEdit: boolean;
}

const ProjectDocumentationManager = ({ projectId, canEdit }: ProjectDocumentationManagerProps) => {
  const [documentation, setDocumentation] = useState<ProjectDocumentation>({
    project_id: projectId,
    pr_template: '',
    code_nomenclature: '',
    gitflow_docs: '',
    additional_docs: '',
    file_attachments: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocumentation();
  }, [projectId]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_documentation')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDocumentation(data);
      }
    } catch (error: any) {
      console.error('Error fetching documentation:', error);
      toast({
        title: "Error al cargar documentación",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDocumentation = async () => {
    try {
      setSaving(true);
      const docData = {
        project_id: projectId,
        pr_template: documentation.pr_template,
        code_nomenclature: documentation.code_nomenclature,
        gitflow_docs: documentation.gitflow_docs,
        additional_docs: documentation.additional_docs,
        file_attachments: documentation.file_attachments || []
      };

      let result;
      if (documentation.id) {
        result = await supabase
          .from('project_documentation')
          .update(docData)
          .eq('id', documentation.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('project_documentation')
          .insert(docData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setDocumentation(result.data);
      setEditing(false);
      toast({
        title: "Documentación guardada",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error: any) {
      console.error('Error saving documentation:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProjectDocumentation, value: string) => {
    setDocumentation(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentación del Proyecto
          </CardTitle>
          <CardDescription>Cargando documentación...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContent = documentation.pr_template || 
                   documentation.code_nomenclature || 
                   documentation.gitflow_docs || 
                   documentation.additional_docs;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentación del Proyecto
            </CardTitle>
            <CardDescription>
              Documentación técnica y guías para el desarrollo del proyecto
            </CardDescription>
          </div>
          {canEdit && hasContent && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveDocumentation} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasContent && !editing ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin documentación</h3>
            <p className="text-muted-foreground mb-4">
              Este proyecto aún no tiene documentación técnica configurada.
            </p>
            {canEdit && (
              <Button onClick={() => setEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar documentación
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* PR Template */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="pr_template">Plantilla de Pull Requests</Label>
                {!editing && documentation.pr_template && (
                  <Badge variant="secondary">Configurado</Badge>
                )}
              </div>
              {editing ? (
                <Textarea
                  id="pr_template"
                  value={documentation.pr_template}
                  onChange={(e) => handleInputChange('pr_template', e.target.value)}
                  placeholder="Plantilla para Pull Requests..."
                  rows={4}
                />
              ) : (
                <div className="bg-muted/50 p-3 rounded-lg">
                  {documentation.pr_template ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {documentation.pr_template}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No configurado</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Code Nomenclature */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="code_nomenclature">Nomenclatura del Código</Label>
                {!editing && documentation.code_nomenclature && (
                  <Badge variant="secondary">Configurado</Badge>
                )}
              </div>
              {editing ? (
                <Textarea
                  id="code_nomenclature"
                  value={documentation.code_nomenclature}
                  onChange={(e) => handleInputChange('code_nomenclature', e.target.value)}
                  placeholder="Guías de nomenclatura y estilo de código..."
                  rows={4}
                />
              ) : (
                <div className="bg-muted/50 p-3 rounded-lg">
                  {documentation.code_nomenclature ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {documentation.code_nomenclature}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No configurado</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Gitflow Documentation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="gitflow_docs">Documentación de Gitflow</Label>
                {!editing && documentation.gitflow_docs && (
                  <Badge variant="secondary">Configurado</Badge>
                )}
              </div>
              {editing ? (
                <Textarea
                  id="gitflow_docs"
                  value={documentation.gitflow_docs}
                  onChange={(e) => handleInputChange('gitflow_docs', e.target.value)}
                  placeholder="Documentación del flujo de Git..."
                  rows={4}
                />
              ) : (
                <div className="bg-muted/50 p-3 rounded-lg">
                  {documentation.gitflow_docs ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {documentation.gitflow_docs}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No configurado</p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Documentation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="additional_docs">Documentación Adicional</Label>
                {!editing && documentation.additional_docs && (
                  <Badge variant="secondary">Configurado</Badge>
                )}
              </div>
              {editing ? (
                <Textarea
                  id="additional_docs"
                  value={documentation.additional_docs}
                  onChange={(e) => handleInputChange('additional_docs', e.target.value)}
                  placeholder="Documentación adicional relevante..."
                  rows={6}
                />
              ) : (
                <div className="bg-muted/50 p-3 rounded-lg">
                  {documentation.additional_docs ? (
                    <pre className="text-sm whitespace-pre-wrap">
                      {documentation.additional_docs}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-sm">No configurado</p>
                  )}
                </div>
              )}
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveDocumentation} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentationManager;