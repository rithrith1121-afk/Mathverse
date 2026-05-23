import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Lazy initialize GoogleGenAI with warning on missing key
  const getAIClient = (): GoogleGenAI => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is required and has not been configured in your secrets.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // AI Solver Endpoint
  app.post("/api/solver/solve", async (req, res) => {
    try {
      const ai = getAIClient();
      const { problem, level } = req.body;
      if (!problem) {
        return res.status(400).json({ error: "No mathematics problem provided." });
      }

      const levelPrompt = level 
        ? `The target student's category is: "${level}". Tailor the solution depth, pedagogical scaffolding, and vocabulary to match this grade selection perfectly.`
        : "";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are MathVerse AI Solver. Your workflow:
        1. Parse the math question.
        2. Solve it carefully step-by-step.
        3. Formulate a crystal-clear, pedagogically elegant explanation.
        ${levelPrompt}

        Question: "${problem}"

        Format your final response in clean, beautiful Markdown. Include headings for "Calibrating...", "Theoretical Insight", "Step-by-Step Sequence", and "Core Concept Takeaways". Wrap formulas in professional notation like $x^2 + y^2 = r^2$. Keep the explanation immersive and deeply supportive.`,
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error("Solver Error:", err);
      res.status(500).json({ error: err?.message || "An error occurred with Gemini." });
    }
  });

  // Practice Questions Generator Endpoint
  app.post("/api/practice/generate", async (req, res) => {
    try {
      const ai = getAIClient();
      const { level, subject } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly 3 high-quality multiple-choice practice mathematical questions customized for standard tests.
        Selected Level Category: ${level || "Class 9-10"}
        Topic Area: ${subject || "Algebra and Equations"}

        Format the response strictly as a JSON array (no wrapping quotes or backticks prefix, just JSON) containing objects with the following keys:
        - "id" (unique number)
        - "question" (the question string)
        - "options" (array of exactly 4 choices as strings)
        - "correctAnswer" (the string matching exactly one of the options)
        - "explanation" (concise, educational detail of the answer)

        Ensure clean JSON parser compatibility. Use proper LaTeX formulas inside text if needed.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const textOutput = response.text || "[]";
      res.json({ questions: JSON.parse(textOutput.trim()) });
    } catch (err: any) {
      console.error("Practice Gen Error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate questions. Try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MathVerse Server] Live on HTTP and routed on port ${PORT}`);
  });
}

startServer().catch(console.error);
