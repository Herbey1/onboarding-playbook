import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Github, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  ExternalLink,
  GitBranch,
  FileText,
  MessageSquare,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock integration state
const mockIntegration = {
  github: {
    connected: false,
    repos: [],
    selectedRepos: [],
    guardrails: {
      labels: false,
      prTemplate: false,
      commentGuide: false,
      jiraDetection: false,
      basicChecks: false
    }
  }
};

const Integrations = () => {
  const [integration, setIntegration] = useState(mockIntegration);
  const { toast } = useToast();

  const handleConnectGitHub = () => {
    toast({
      title: "Próximamente",
      description: "La integración con GitHub estará disponible pronto",
    });
  };

  const handleToggleGuardrail = (guardrail: string) => {
    setIntegration(prev => ({
      ...prev,
      github: {
        ...prev.github,
        guardrails: {
          ...prev.github.guardrails,
          [guardrail]: !prev.github.guardrails[guardrail as keyof typeof prev.github.guardrails]
        }
      }
    }));
    
    toast({
      title: "Configuración actualizada",
      description: `Guardrail ${guardrail} ${integration.github.guardrails[guardrail as keyof typeof integration.github.guardrails] ? 'desactivado' : 'activado'}`,
    });
  };

  const guardrailsConfig = [
    {
      id: "labels",
      title: "Etiquetas automáticas",
      description: "Aplicar etiquetas según el tipo de PR",
      icon: Tag
    },
    {
      id: "prTemplate",
      title: "Plantilla de PR",
      description: "Validar que se use la plantilla del proyecto",
      icon: FileText
    },
    {
      id: "commentGuide", 
      title: "Comentario guía",
      description: "Añadir comentario con enlace a las guías",
      icon: MessageSquare
    },
    {
      id: "jiraDetection",
      title: "Detección de tickets",
      description: "Verificar referencia a tickets JIRA-### en el PR",
      icon: GitBranch
    },
    {
      id: "basicChecks",
      title: "Checks básicos",
      description: "Validaciones de linter y CI si existen",
      icon: CheckCircle
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-stepable-3xl font-bold">Integraciones</h1>
        <p className="text-muted-foreground mt-1">
          Conecta GitHub y otras herramientas para mejorar el onboarding
        </p>
      </div>

      <div className="space-y-6">
        {/* GitHub Integration */}
        <Card className="stepable-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-stepable-xl">GitHub</CardTitle>
                  <CardDescription>
                    Conecta repositorios para guardrails automáticos
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {integration.github.connected ? (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Conectado</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Desconectado</span>
                  </Badge>
                )}
                
                <Button 
                  onClick={handleConnectGitHub}
                  variant={integration.github.connected ? "outline" : "default"}
                  className="stepable-button"
                >
                  {integration.github.connected ? (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurar
                    </>
                  ) : (
                    <>
                      <Github className="mr-2 h-4 w-4" />
                      Conectar GitHub
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {!integration.github.connected ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Github className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-stepable-xl font-semibold mb-2">
                  Conecta tu organización de GitHub
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  La integración con GitHub es opcional pero permite aplicar guardrails 
                  automáticos para guiar a nuevos desarrolladores.
                </p>
                <Button onClick={handleConnectGitHub} className="stepable-button">
                  <Github className="mr-2 h-4 w-4" />
                  Conectar con GitHub
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Repository Selection */}
                <div>
                  <h4 className="font-semibold mb-3">Repositorios seleccionados</h4>
                  <div className="text-sm text-muted-foreground">
                    No hay repositorios conectados. 
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Seleccionar repositorios
                    </Button>
                  </div>
                </div>

                {/* Guardrails Configuration */}
                <div>
                  <h4 className="font-semibold mb-3">Guardrails disponibles</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona qué validaciones aplicar automáticamente en los PRs
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guardrailsConfig.map((guardrail) => (
                      <div 
                        key={guardrail.id}
                        className="flex items-start space-x-3 p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <guardrail.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <Label htmlFor={guardrail.id} className="text-sm font-medium">
                              {guardrail.title}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {guardrail.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={guardrail.id}
                          checked={integration.github.guardrails[guardrail.id as keyof typeof integration.github.guardrails]}
                          onCheckedChange={() => handleToggleGuardrail(guardrail.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Integrations */}
        <Card className="stepable-card opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-stepable-xl flex items-center space-x-2">
                  <span>Más integraciones</span>
                  <Badge variant="outline">Próximamente</Badge>
                </CardTitle>
                <CardDescription>
                  Jira, Trello, Slack y más herramientas de tu stack
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Jira", color: "bg-blue-600" },
                { name: "Trello", color: "bg-blue-500" },
                { name: "Slack", color: "bg-purple-600" },
                { name: "Linear", color: "bg-gray-800" }
              ].map((tool) => (
                <div key={tool.name} className="text-center p-4 border border-dashed border-border rounded-lg">
                  <div className={`w-8 h-8 ${tool.color} rounded mx-auto mb-2`}></div>
                  <div className="text-sm font-medium">{tool.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;