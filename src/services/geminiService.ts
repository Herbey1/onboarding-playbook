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
}

export const geminiService = new GeminiService();