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

export const generateMathSolution = async (question: string, level: string): Promise<string> => {
  if (!question.trim()) {
    throw new Error('Question cannot be empty');
  }
  try {
    const response = await fetch('/api/solver/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem: question, level }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get solution from server');
    }
    const data = await response.json();
    if (!data.result) {
      throw new Error('Empty response from Gemini service');
    }
    return data.result;
  } catch (error: any) {
    console.error('Gemini AI Service Error:', error);
    // Preserve original detailed messages for UI
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
export const solveMathFromImage = async (imageFile: File, level?: string): Promise<string> => {
  const mime = imageFile.type;
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(imageFile);
  });

  try {
    const response = await fetch('/api/solver/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        imageMime: mime,
        level: level ?? ''
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get solution from server');
    }
    const data = await response.json();
    if (!data.result) throw new Error('Empty response from Gemini service');
    return data.result;
  } catch (error: any) {
    console.error('Gemini Image Solver Error:', error);
    throw new Error(error.message || 'Error solving from image');
  }
};

// Alias for text solving (keeps API backwards compatible)
export const solveTextMathProblem = generateMathSolution;


