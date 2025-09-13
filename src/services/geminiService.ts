interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export interface CourseModule {
  title: string;
  summary: string;
  quiz: {
    title: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }[];
  };
}

export interface GeneratedCourse {
  modules: CourseModule[];
}

export interface ActivityItem {
  title: string;
  description: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours?: number;
  dependencies?: string[];
  acceptance_criteria?: string[];
}

export interface GeneratedActivities {
  activities: ActivityItem[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY no está configurada en las variables de entorno');
    }
  }

  private createPrompt(projectTitle: string, projectDescription: string, documentation: {
    pr_template: string;
    code_nomenclature: string;
    gitflow_docs: string;
    additional_docs: string;
  }): string {
    return `Eres un experto en crear cursos de onboarding para equipos de desarrollo de software. 

Basándote en la siguiente información del proyecto, genera un curso de onboarding completo con módulos estructurados:

**INFORMACIÓN DEL PROYECTO:**
- Título: ${projectTitle}
- Descripción: ${projectDescription}

**DOCUMENTACIÓN TÉCNICA:**
${documentation.pr_template ? `- Plantilla de Pull Requests:\n${documentation.pr_template}\n` : ''}
${documentation.code_nomenclature ? `- Nomenclatura del código:\n${documentation.code_nomenclature}\n` : ''}
${documentation.gitflow_docs ? `- Documentación de Gitflow:\n${documentation.gitflow_docs}\n` : ''}
${documentation.additional_docs ? `- Documentación adicional:\n${documentation.additional_docs}\n` : ''}

**INSTRUCCIONES:**
Genera un curso de onboarding con 4-6 módulos. Cada módulo debe incluir:
1. Un título descriptivo
2. Un resumen/contenido educativo detallado (mínimo 300 palabras)
3. Un quiz de 3-5 preguntas de opción múltiple para evaluar la comprensión

**FORMATO DE RESPUESTA (JSON estricto):**
\`\`\`json
{
  "modules": [
    {
      "title": "Título del módulo",
      "summary": "Contenido educativo detallado del módulo con explicaciones, ejemplos y mejores prácticas. Debe ser comprensivo y educativo.",
      "quiz": {
        "title": "Evaluación: [Título del módulo]",
        "questions": [
          {
            "question": "Pregunta sobre el contenido del módulo",
            "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "correctAnswer": 0,
            "explanation": "Explicación de por qué esta es la respuesta correcta"
          }
        ]
      }
    }
  ]
}
\`\`\`

**IMPORTANTE:** 
- Responde ÚNICAMENTE con el JSON válido, sin texto adicional
- Asegúrate de que el contenido sea relevante al proyecto y documentación proporcionada
- Los módulos deben seguir una progresión lógica de aprendizaje
- Incluye ejemplos prácticos cuando sea posible`;
  }

  private createActivitiesPrompt(projectTitle: string, projectDescription: string, documentation: {
    pr_template: string;
    code_nomenclature: string;
    gitflow_docs: string;
    additional_docs: string;
  }): string {
    return `Eres un gestor de proyectos técnico experto. Genera un backlog inicial de actividades accionables para un proyecto de software.

Proyecto: ${projectTitle}
Descripción: ${projectDescription}

Documentación relevante:
${documentation.pr_template ? `PR template:\n${documentation.pr_template}\n` : ''}
${documentation.code_nomenclature ? `Nomenclatura:\n${documentation.code_nomenclature}\n` : ''}
${documentation.gitflow_docs ? `Gitflow:\n${documentation.gitflow_docs}\n` : ''}
${documentation.additional_docs ? `Adicional:\n${documentation.additional_docs}\n` : ''}

Instrucciones:
- Genera de 8 a 15 actividades atómicas, claras y accionables.
- Incluye distintas categorías (Planificación, Arquitectura, Desarrollo, QA, DevOps, Documentación).
- Establece prioridad (low/medium/high/critical) y, si aplica, dependencias por título.
- Incluye criterios de aceptación concretos.

Formato de respuesta (JSON estricto):
\`\`\`json
{
  "activities": [
    {
      "title": "Definir alcance y objetivos",
      "description": "Redactar un documento de alcance con objetivos SMART...",
      "category": "Planificación",
      "priority": "high",
      "estimated_hours": 6,
      "dependencies": [],
      "acceptance_criteria": [
        "Documento revisado y aprobado por stakeholders",
        "Objetivos medibles definidos"
      ]
    }
  ]
}
\`\`\`

IMPORTANTE: Responde SOLO con JSON válido.`;
  }

  async generateCourse(
    projectTitle: string,
    projectDescription: string,
    documentation: {
      pr_template: string;
      code_nomenclature: string;
      gitflow_docs: string;
      additional_docs: string;
    }
  ): Promise<GeneratedCourse> {
    if (!this.apiKey) {
      throw new Error('API key de Gemini no configurada');
    }

    const prompt = this.createPrompt(projectTitle, projectDescription, documentation);

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de API de Gemini: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No se recibió respuesta válida de Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extraer JSON del texto de respuesta
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonContent = jsonMatch ? jsonMatch[1] : generatedText;
      
      // Limpiar el contenido JSON
      jsonContent = jsonContent.trim();
      
      try {
        const parsedCourse: GeneratedCourse = JSON.parse(jsonContent);
        
        // Validar la estructura
        if (!parsedCourse.modules || !Array.isArray(parsedCourse.modules)) {
          throw new Error('Estructura de curso inválida');
        }
        
        // Validar cada módulo
        for (const module of parsedCourse.modules) {
          if (!module.title || !module.summary || !module.quiz) {
            throw new Error('Estructura de módulo inválida');
          }
          
          if (!module.quiz.questions || !Array.isArray(module.quiz.questions)) {
            throw new Error('Estructura de quiz inválida');
          }
        }
        
        return parsedCourse;
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini:', parseError);
        console.error('Raw response:', generatedText);
        throw new Error('Error al procesar la respuesta de Gemini: formato JSON inválido');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async generateActivities(
    projectTitle: string,
    projectDescription: string,
    documentation: {
      pr_template: string;
      code_nomenclature: string;
      gitflow_docs: string;
      additional_docs: string;
    }
  ): Promise<GeneratedActivities> {
    if (!this.apiKey) {
      throw new Error('API key de Gemini no configurada');
    }

    const prompt = this.createActivitiesPrompt(projectTitle, projectDescription, documentation);
    const requestBody: GeminiRequest = {
      contents: [
        { parts: [{ text: prompt }] }
      ]
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de API de Gemini: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No se recibió respuesta válida de Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonContent = jsonMatch ? jsonMatch[1] : generatedText;
    jsonContent = jsonContent.trim();

    try {
      const parsed: GeneratedActivities = JSON.parse(jsonContent);
      if (!parsed.activities || !Array.isArray(parsed.activities)) {
        throw new Error('Estructura de actividades inválida');
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing JSON from Gemini (activities):', e);
      console.error('Raw response:', generatedText);
      throw new Error('Error al procesar actividades de Gemini: formato JSON inválido');
    }
  }
}

export const geminiService = new GeminiService();
