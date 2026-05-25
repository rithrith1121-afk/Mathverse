import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
      const { problem, level, imageBase64, imageMime } = req.body;
      
      const contents: any[] = [];
      
      if (imageBase64 && imageMime) {
        contents.push({
          inlineData: {
            mimeType: imageMime,
            data: imageBase64.replace(/^data:image\/[^;]+;base64,/, "")
          }
        });
      }

      if (problem) {
        const levelPrompt = level 
          ? `The target student's category is: "${level}". Tailor the solution depth, pedagogical scaffolding, and vocabulary to match this grade selection perfectly.`
          : "";

        contents.push(`You are MathVerse AI Solver. Your workflow:
        1. Parse the math question.
        2. Solve it carefully step-by-step.
        3. Formulate a crystal-clear, pedagogically elegant explanation.
        ${levelPrompt}

        Question: "${problem}"

        Format your final response in clean, beautiful Markdown. Include headings for "Calibrating...", "Theoretical Insight", "Step-by-Step Sequence", and "Core Concept Takeaways". Wrap formulas in professional notation like $x^2 + y^2 = r^2$. Keep the explanation immersive and deeply supportive.`);
      }

      if (contents.length === 0) {
        return res.status(400).json({ error: "No mathematics problem or image provided." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
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

const startListening = (port) => {
  const server = app.listen(port, "0.0.0.0");
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      const newPort = port + 1;
      console.warn(`Port ${port} in use, trying ${newPort}`);
      startListening(newPort);
    } else {
      console.error('Server error:', err);
    }
  });
  server.on('listening', () => {
    console.log("\n  🚀 \x1b[36m\x1b[1mMathVerse Server is active!\x1b[0m");
    console.log(`  ➜  \x1b[1mLocal:\x1b[0m    \x1b[35mhttp://localhost:${port}/\x1b[0m`);
    console.log(`  ➜  \x1b[1mNetwork:\x1b[0m  \x1b[35mhttp://127.0.0.1:${port}/\x1b[0m`);
    console.log(`  ➜  \x1b[1mAPI Health:\x1b[0m \x1b[32mhttp://localhost:${port}/api/health\x1b[0m\n`);
  });
};
startListening(PORT);
}

startServer().catch(console.error);
