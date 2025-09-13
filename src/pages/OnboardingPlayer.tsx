import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Code, 
  HelpCircle,
  CheckCircle,
  Play,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

// Mock lesson data
const mockLesson = {
  id: "2-2",
  title: "Práctica: Crear un PR",
  type: "practice",
  moduleTitle: "Flujo de Desarrollo",
  progress: 33,
  duration: "30 min",
  status: "in_progress",
  content: {
    reading: `# Crear un Pull Request Efectivo

Un Pull Request (PR) es la forma en que proponemos cambios al código base. En nuestro equipo, seguimos estas convenciones:

## Estructura del PR

Todo PR debe incluir:

1. **Título descriptivo**: Usa el formato \`[TIPO] Descripción breve\`
2. **Descripción detallada**: Explica qué cambios se hicieron y por qué
3. **Referencias**: Vincula tickets relacionados (ej: \`Closes #123\`)
4. **Screenshots**: Si hay cambios visuales, incluye capturas

## Ejemplo de buen título:
- \`[FEAT] Añadir validación de email en formulario de registro\`
- \`[FIX] Corregir error de timeout en API de pagos\`
- \`[REFACTOR] Optimizar consultas de la base de datos\`

## Checklist antes de crear el PR:
- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] Se siguieron las convenciones de naming
- [ ] Se añadieron tests para funcionalidad nueva`,
    practice: {
      type: "pr_simulator",
      template: `## Descripción
Describe brevemente los cambios realizados

## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactoring
- [ ] Actualización de documentación

## ¿Cómo se ha probado?
Describe las pruebas que has realizado

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He añadido tests que prueban mi funcionalidad
- [ ] Los tests nuevos y existentes pasan localmente`,
      criteria: [
        {
          id: "title",
          label: "Título descriptivo con formato correcto",
          description: "Debe seguir el formato [TIPO] Descripción"
        },
        {
          id: "description",
          label: "Descripción clara y detallada", 
          description: "Explica qué se cambió y por qué"
        },
        {
          id: "reference",
          label: "Referencia a ticket (si aplica)",
          description: "Incluye 'Closes #XXX' o similar"
        },
        {
          id: "checklist",
          label: "Checklist completado",
          description: "Todos los elementos marcados"
        }
      ]
    },
    quiz: [
      {
        id: "q1",
        question: "¿Cuál es el formato correcto para el título de un PR?",
        type: "multiple_choice",
        options: [
          "Descripción breve del cambio",
          "[TIPO] Descripción breve del cambio", 
          "TIPO: Descripción breve del cambio",
          "Cambio realizado en el sistema"
        ],
        correct: 1,
        explanation: "El formato correcto es [TIPO] seguido de una descripción breve y clara."
      },
      {
        id: "q2",
        question: "¿Es obligatorio incluir referencias a tickets en todos los PRs?", 
        type: "true_false",
        correct: false,
        explanation: "Solo es obligatorio cuando el PR está relacionado con un ticket específico."
      }
    ]
  }
};

const OnboardingPlayer = () => {
  const [lesson] = useState(mockLesson);
  const [activeTab, setActiveTab] = useState("reading");
  const [prContent, setPrContent] = useState("");
  const [completedCriteria, setCompletedCriteria] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const lessonId = searchParams.get("lesson");
    // In a real app, fetch lesson data based on lessonId
  }, [searchParams]);

  const handlePrevious = () => {
    toast({
      title: "Navegación",
      description: "Ir a la lección anterior",
    });
  };

  const handleNext = () => {
    toast({
      title: "Navegación", 
      description: "Ir a la siguiente lección",
    });
  };

  const handleCompleteLesson = () => {
    toast({
      title: "¡Lección completada!",
      description: "Has completado esta lección correctamente",
    });
  };

  const validatePR = () => {
    const criteria = lesson.content.practice?.criteria || [];
    const newCompleted: string[] = [];

    // Simple validation logic
    if (prContent.includes("[") && prContent.includes("]")) {
      newCompleted.push("title");
    }
    if (prContent.length > 100) {
      newCompleted.push("description");
    }
    if (prContent.toLowerCase().includes("closes") || prContent.toLowerCase().includes("#")) {
      newCompleted.push("reference");
    }
    if (prContent.includes("- [x]") || prContent.includes("✓")) {
      newCompleted.push("checklist");
    }

    setCompletedCriteria(newCompleted);
    
    const score = Math.round((newCompleted.length / criteria.length) * 100);
    toast({
      title: "PR Validado",
      description: `Puntuación: ${score}% (${newCompleted.length}/${criteria.length} criterios)`,
    });
  };

  const submitQuiz = () => {
    setShowResults(true);
    const correctAnswers = lesson.content.quiz.filter(q => {
      const userAnswer = quizAnswers[q.id];
      return userAnswer === q.correct;
    }).length;
    
    const score = Math.round((correctAnswers / lesson.content.quiz.length) * 100);
    toast({
      title: "Quiz completado",
      description: `Puntuación: ${score}% (${correctAnswers}/${lesson.content.quiz.length} correctas)`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completa";
      case "in_progress":
        return "En curso";
      default:
        return "No iniciada";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al plan
            </Button>
            <div>
              <h1 className="text-stepable-2xl font-bold">{lesson.title}</h1>
              <p className="text-muted-foreground text-sm">
                {lesson.moduleTitle} • {lesson.duration}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(lesson.status)}>
              {getStatusLabel(lesson.status)}
            </Badge>
            <div className="text-right">
              <div className="text-sm font-medium">{lesson.progress}%</div>
              <Progress value={lesson.progress} className="w-20 h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reading" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Lectura</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Práctica</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Quiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reading" className="space-y-6">
              <Card className="stepable-card">
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: lesson.content.reading
                        .replace(/\n## /g, '\n<h2>')
                        .replace(/\n# /g, '\n<h1>')
                        .replace(/\n- /g, '\n<li>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PR Editor */}
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Editor de PR</CardTitle>
                    <CardDescription>
                      Redacta tu Pull Request siguiendo la plantilla
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={lesson.content.practice?.template}
                      value={prContent}
                      onChange={(e) => setPrContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <Button onClick={validatePR} className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Validar PR
                    </Button>
                  </CardContent>
                </Card>

                {/* Validation */}
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Criterios de validación</CardTitle>
                    <CardDescription>
                      Asegúrate de cumplir todos los criterios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {lesson.content.practice?.criteria.map((criterion) => (
                        <div key={criterion.id} className="flex items-start space-x-3">
                          <div className={`mt-0.5 ${
                            completedCriteria.includes(criterion.id) 
                              ? "text-green-600" 
                              : "text-gray-400"
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{criterion.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {criterion.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {completedCriteria.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {completedCriteria.length} de {lesson.content.practice?.criteria.length} criterios completados
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              {lesson.content.quiz.map((question, index) => (
                <Card key={question.id} className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">
                      Pregunta {index + 1}
                    </CardTitle>
                    <CardDescription>{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {question.type === "multiple_choice" ? (
                      <RadioGroup
                        value={quizAnswers[question.id]?.toString()}
                        onValueChange={(value) => 
                          setQuizAnswers({...quizAnswers, [question.id]: parseInt(value)})
                        }
                      >
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                            <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <RadioGroup
                        value={quizAnswers[question.id]?.toString()}
                        onValueChange={(value) => 
                          setQuizAnswers({...quizAnswers, [question.id]: value === "true"})
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id={`${question.id}-true`} />
                          <Label htmlFor={`${question.id}-true`}>Verdadero</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id={`${question.id}-false`} />
                          <Label htmlFor={`${question.id}-false`}>Falso</Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {showResults && (
                      <div className="mt-4 p-3 rounded-lg border">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {quizAnswers[question.id] === question.correct ? "✓ Correcto" : "✗ Incorrecto"}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {question.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {!showResults && (
                <Button onClick={submitQuiz} className="w-full stepable-button">
                  Enviar respuestas
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border bg-card p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="outline" onClick={handlePrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex space-x-3">
            {lesson.status === "in_progress" && (
              <Button variant="outline" onClick={handleCompleteLesson}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como completa
              </Button>
            )}
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPlayer;