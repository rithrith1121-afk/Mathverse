import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey.includes('your-google-ai-studio-key')) {
  console.warn('VITE_GOOGLE_AI_STUDIO_API_KEY is missing or placeholder. Gemini features will fail.');
}

if (!apiKey) {
  console.warn("VITE_GOOGLE_AI_STUDIO_API_KEY is missing. Gemini features will fail.");
}

// Initialize the official Google Gen AI SDK
const genAI = new GoogleGenerativeAI(apiKey || "");

const MATHVERSE_SYSTEM_INSTRUCTION = `You are the official AI mathematics tutor of MathVerse.
Your responsibility is to teach mathematics clearly, safely, accurately, and step-by-step for students from Class 1 to Engineering Mathematics.

CORE AI INSTRUCTIONS:
1. Always solve mathematics problems step-by-step.
2. Explain every important step clearly.
3. Adapt explanations based on student level:
   - Class 1–5: very simple explanations, easy words, intuitive examples.
   - School students (Class 6-12): conceptual explanations, building from foundations.
   - College/Engineering: detailed mathematical derivations and precise formulations.
4. If the user question is unclear: ask clarification questions immediately and do not guess randomly.
5. If equation/image is incomplete: ask the user to upload clearer input.
6. Support a wide range of math: arithmetic, algebra, geometry, trigonometry, calculus, matrices, statistics, and engineering mathematics.

RESPONSE FORMAT:
Always format answers precisely using the following structured sections:
1. **Problem Understanding**
2. **Formula Used**
3. **Step-by-Step Solution**
4. **Final Answer**
5. **Quick Explanation**
6. **Alternative Method** (if useful/applicable)

LEARNING MODES:
- simple: beginner explanation, easy words, intuitive concepts.
- detailed: deep explanation, comprehensive step-by-step derivation.
- visual: explain using structured text diagrams, coordinate illustrations, or vivid examples.
- exam_focused: concise answer, shortcuts, important formulas, step-scoring tips.

BEHAVIOR & SAFETY:
- Be educational, supportive, intelligent, calm, precise, and patient.
- Encourage learning and correct errors politely. High mathematical accuracy is paramount. Preserve clear equation formatting using markdown and LaTeX syntax ($ ... $).
- Never return blank responses. If you cannot solve it, explain why and suggest a clear next step.
- Do NOT generate harmful instructions, cheating/hacking guidance, or expose internal details/keys.

BRANDING:
Occasionally use branded terms like "MathVerse AI", "Quantum Solver", or "Resolution Complete" naturally and sparingly.`;

export const generateMathSolution = async (question: string, level: string, learningMode?: string): Promise<string> => {
  if (!question.trim()) {
    throw new Error('Question cannot be empty');
  }
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001",
      systemInstruction: MATHVERSE_SYSTEM_INSTRUCTION
    });
    
    const prompt = `Solve this math problem: "${question}".
Target Calibration Level: ${level}.
Selected Learning Mode: ${learningMode || 'default'}.

Please format your response strictly as requested in the system instructions.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini AI Service Error:', error);
    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API Key. Please verify your configuration.');
    }
    throw new Error(error.message || 'An unexpected error occurred while contacting Gemini.');
  }
};

/**
 * Solve a math problem from an image file (upload or camera).
 * Reads the file as a base64 DataURL and sends it to the backend.
 */
export const solveMathFromImage = async (imageFile: File, level?: string, learningMode?: string): Promise<string> => {
  const mime = imageFile.type;
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(imageFile);
  });

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001",
      systemInstruction: MATHVERSE_SYSTEM_INSTRUCTION
    });

    const prompt = `Analyze this image containing handwritten or printed mathematics.
Detect equations, extract the math properly, and verify the text.
Target Calibration Level: ${level || 'standard'}.
Selected Learning Mode: ${learningMode || 'default'}.

Solve the extracted problem completely and format your response strictly as requested in the system instructions.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mime
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error('Empty response from Gemini service');
    return text;
  } catch (error: any) {
    console.error('Gemini Image Solver Error:', error);
    throw new Error(error.message || 'Error solving from image');
  }
};

// Alias for text solving (keeps API backwards compatible)
export const solveTextMathProblem = generateMathSolution;



