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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-stepable-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Integraciones
        </h1>
        <p className="text-muted-foreground text-stepable-base">
          Conecta GitHub y otras herramientas para mejorar el onboarding
        </p>
      </div>

      <div className="space-y-8">
        {/* GitHub Integration */}
        <Card className="apple-card border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-medium">
                  <Github className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-stepable-xl">GitHub</CardTitle>
                  <CardDescription className="text-stepable-base">
                    Conecta repositorios para guardrails automáticos
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {integration.github.connected ? (
                  <Badge variant="default" className="flex items-center space-x-2 px-3 py-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Conectado</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Desconectado</span>
                  </Badge>
                )}
                
                <Button 
                  onClick={handleConnectGitHub}
                  variant={integration.github.connected ? "outline" : "blue"}
                  className="shadow-soft hover:shadow-medium transition-all duration-200"
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
          
          <CardContent className="pt-0">
            {!integration.github.connected ? (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                  <Github className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-stepable-2xl font-semibold mb-3">
                  Conecta tu organización de GitHub
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-stepable-base leading-relaxed">
                  La integración con GitHub es opcional pero permite aplicar guardrails 
                  automáticos para guiar a nuevos desarrolladores.
                </p>
                <Button variant="blue" onClick={handleConnectGitHub} className="shadow-medium hover:shadow-strong">
                  <Github className="mr-2 h-5 w-5" />
                  Conectar con GitHub
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Repository Selection */}
                <div className="space-y-4">
                  <h4 className="text-stepable-xl font-semibold">Repositorios seleccionados</h4>
                  <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                    <p className="text-sm text-muted-foreground mb-2">
                      No hay repositorios conectados.
                    </p>
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Seleccionar repositorios
                    </Button>
                  </div>
                </div>

                {/* Guardrails Configuration */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-stepable-xl font-semibold">Guardrails disponibles</h4>
                    <p className="text-muted-foreground text-stepable-base">
                      Selecciona qué validaciones aplicar automáticamente en los PRs
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {guardrailsConfig.map((guardrail) => (
                      <div 
                        key={guardrail.id}
                        className="flex items-start space-x-4 p-4 border border-border rounded-xl hover:bg-muted/30 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <guardrail.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label htmlFor={guardrail.id} className="text-sm font-semibold cursor-pointer">
                              {guardrail.title}
                            </Label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {guardrail.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={guardrail.id}
                          checked={integration.github.guardrails[guardrail.id as keyof typeof integration.github.guardrails]}
                          onCheckedChange={() => handleToggleGuardrail(guardrail.id)}
                          className="mt-1"
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
        <Card className="apple-card border-2 border-dashed border-muted-foreground/20 bg-muted/10">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-stepable-xl flex items-center space-x-3">
                  <span>Más integraciones</span>
                  <Badge variant="outline" className="bg-background">Próximamente</Badge>
                </CardTitle>
                <CardDescription className="text-stepable-base">
                  Jira, Trello, Slack y más herramientas de tu stack
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Jira", color: "bg-blue-600" },
                { name: "Trello", color: "bg-blue-500" },
                { name: "Slack", color: "bg-purple-600" },
                { name: "Linear", color: "bg-gray-800" }
              ].map((tool) => (
                <div key={tool.name} className="text-center p-6 border border-dashed border-border rounded-xl hover:bg-muted/20 transition-colors group">
                  <div className={`w-10 h-10 ${tool.color} rounded-xl mx-auto mb-3 shadow-soft group-hover:shadow-medium transition-shadow`}></div>
                  <div className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{tool.name}</div>
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