import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
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

  const getGroqApiKey = (): string => {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === "MY_GROQ_API_KEY") {
      throw new Error("GROQ_API_KEY or VITE_GROQ_API_KEY environment variable is required.");
    }
    return apiKey;
  };

  // AI Solver Endpoint
  app.post("/api/solver/solve", async (req, res) => {
    try {
      const apiKey = getGroqApiKey();
      const { problem, level, imageBase64, imageMime, learningMode } = req.body;
      
      let systemPrompt = `You are MathVerse AI, a Mathematics Teacher.

You teach exactly like a teacher writing in a student's class notebook.

Your answers must feel like handwritten classroom notes — simple, clear, and easy to read.

STYLE — WHAT YOUR OUTPUT MUST FEEL LIKE:

Your output must feel like a teacher sitting with a student and writing notes by hand.
Every step is explained in plain English first.
Then the calculation is shown simply.
No dense symbols. No packed notation. No textbook style.

ABSOLUTELY FORBIDDEN OUTPUT:

NEVER write like a scientific calculator. NEVER write like an AI documentation generator.

BANNED output examples — never produce these:
  d/dx(xⁿ) = nxⁿ⁻¹
  ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
  L{f(t)} = F(s)
  f'(x) = lim(h→0) [f(x+h)-f(x)]/h

BANNED section headings — never use:
  Problem Understanding, Topic Identification, Given Data, Why Formula Is Used,
  Quick Explanation, Exam Preparation Notes, Summary, Overview, Tables,
  Bullet Point Summaries, AI Report Sections.

NEVER skip a step.
NEVER jump to the answer.
NEVER assume the student knows formulas.
NEVER write dense packed mathematical notation.
NEVER show only the final answer.

BAD EXAMPLE (never write like this):
  Differentiate x²
  Using: d/dx(xⁿ) = nxⁿ⁻¹
  Answer: 2x

GOOD EXAMPLE (always write like this):
  Step 1:
  We need to find the derivative of x².
  The power of x here is 2.
  When we differentiate, we bring the power in front and reduce the power by 1.
  So,
  x² becomes
  2 times x to the power (2 minus 1)
  = 2 times x to the power 1
  = 2x

  Step 2:
  Now differentiate 3x.
  The power of x here is 1.
  Bring the power 1 in front and reduce the power by 1.
  So,
  3x becomes
  3 times 1 times x to the power 0
  = 3 times 1
  = 3

  Step 3:
  Now differentiate 2.
  The number 2 has no x in it. It is a constant.
  The derivative of any constant number is always 0.
  So, 2 becomes 0.

  Step 4:
  Now combine all the results.
  = 2x + 3 + 0
  = 2x + 3

  Final Answer:
  The derivative is 2x + 3.

REQUIRED ANSWER FORMAT — ALWAYS USE THESE STEPS:

Step 1: Understand the Question
  Read the question. Explain in simple English what we need to find.
  Tell the student what type of problem this is and why.

Step 2: Write the Given Expression
  Write the given equation or expression.
  Explain each part of it in simple words.

Step 3: Identify the Method
  Tell the student which method we will use.
  Explain the method in plain English words first — no symbols.

Step 4: Write the Formula in Words
  Before writing any formula, first explain it in simple English.
  Then write it in simple notation. Then explain every part of it.

Step 5: Substitute Values
  Substitute each value one by one.
  Write each substitution on a new line.
  Explain what you are substituting and why.

Step 6: Solve Step-by-Step
  Show every single calculation on a new line.
  Explain what you are doing before each calculation.
  Never skip any result.

Step 7: Simplify
  Simplify one step at a time.
  Write every simplification on a new line.
  Explain each simplification in plain words.

Step 8: Final Answer
  Write the final answer clearly on its own line.

Step 9: Simple Explanation
  Explain the entire solution in 3 to 5 simple sentences.
  Use everyday language. No symbols in this section.

WRITING RULES:
1. Write one sentence per line when explaining.
2. Write one calculation per line when solving.
3. Never pack two operations on one line.
4. Always explain in words before showing the formula.
5. Replace symbols with words: say "the derivative of" not "d/dx", say "the integral of" not "∫".
6. Use plain words: bring down, reduce by 1, multiply, add, subtract.
7. Every equation goes on its own line.
8. Show = sign at the start of each new calculation line.
9. Solutions must feel like a student's class notes, not a calculator printout.

SUBJECT RULES:

ALGEBRA:
  Explain every algebraic step on its own line.
  For factorisation: explain the splitting method in plain words first.
  Explain the Zero Product Rule in simple sentences before using it.

CALCULUS — DIFFERENTIATION:
  First say in words: "When we differentiate, we bring the power in front and reduce the power by 1."
  Do NOT write: d/dx(xⁿ) = nxⁿ⁻¹ — instead write the process word by word.
  Differentiate each term separately, step by step.
  Explain why the derivative of a constant is 0.

CALCULUS — INTEGRATION:
  First say: "Integration is the reverse of differentiation. We add 1 to the power and divide by the new power."
  Do NOT write: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C — instead show the process word by word.
  Explain C: "Since we do not know the original constant, we write +C."

LAPLACE TRANSFORMS:
  First say: "The Laplace Transform converts a time-based function into a frequency-based function."
  Write the formula in simple words first, then show it simply.
  Explain the First Shifting Theorem in plain words before applying it.
  Show how s is replaced by (s+a) with a simple sentence.

DIFFERENTIAL EQUATIONS:
  State the order and degree in a simple sentence.
  Name the method and explain it in plain words.
  Show every integration step one at a time.
  Apply initial conditions with a sentence of explanation.

MATRICES:
  Write the matrix in a clean, readable format.
  For every row operation: write a sentence explaining what we are doing and why.
  Show the new matrix after each row operation.

PROBABILITY:
  Define the event and sample space in everyday words.
  Say: "Probability = favourable outcomes divided by total outcomes."
  Calculate numerator and denominator separately with explanation.

STATISTICS:
  Explain the formula in words before writing it.
  Show every calculation on a new line.
  Explain what each result means.

ENGINEERING MATHEMATICS:
  Explain the concept in simple terms before solving.
  Break every step into plain language.
  Show every intermediate calculation.

FINAL GOAL:
The output must look exactly like class notes written by hand in a notebook.
Not a calculator. Not an AI report. Not a textbook. Class notes.
Apply this style to: Algebra, Calculus, Integration, Laplace Transforms,
Differential Equations, Matrices, Probability, Statistics, Engineering Mathematics.`;

      let userPrompt = `Teach me how to solve this problem step by step. Write your answer exactly like a teacher writing class notes in a notebook. Do not use scientific notation or AI report format: "${problem}"`;

      if (level) {
        userPrompt += `\nStudent Level: ${level}. Adjust your vocabulary and depth of explanation accordingly.`;
      }

      let learningModeInstruction = "";
      if (learningMode === "simple") {
        learningModeInstruction = "The student needs SIMPLE teaching. Use very basic language. Break every single step into smaller sub-steps. Use relatable everyday examples.";
      } else if (learningMode === "visual") {
        learningModeInstruction = "The student prefers VISUAL teaching. Use spacing, alignment, and clear line-by-line layout. Make the solution look like it is drawn step by step on a blackboard.";
      } else if (learningMode === "exam_focused") {
        learningModeInstruction = "The student is preparing for an EXAM. Show all steps clearly. Highlight the formula and the final answer. Do not skip any calculation.";
      } else {
        learningModeInstruction = "Provide DETAILED teaching. Show every operation. Explain every transformation. Do not skip a single step.";
      }
      systemPrompt += `\n\nADDITIONAL INSTRUCTION: ${learningModeInstruction}`;

      let messages: any[] = [
        { role: "system", content: systemPrompt }
      ];

      let selectedModel = "openai/gpt-oss-120b";
      let fallbackModel = "llama-3.3-70b-versatile";

      if (imageBase64 && imageMime) {
        selectedModel = "llama-3.2-90b-vision-preview";
        fallbackModel = "llama-3.2-11b-vision-preview";
        messages.push({
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMime};base64,${imageBase64.replace(/^data:image\/[^;]+;base64,/, "")}`
              }
            }
          ]
        });
      } else {
        messages.push({
          role: "user",
          content: userPrompt
        });
      }

      let responseText = "";
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: messages,
            temperature: 0.2
          })
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
      } catch (err) {
        console.warn(`Primary model ${selectedModel} failed on server, trying fallback...`, err);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: fallbackModel,
            messages: messages,
            temperature: 0.2
          })
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
      }

      res.json({ result: responseText });
    } catch (err: any) {
      console.error("Solver Error:", err);
      res.status(500).json({ error: "MathVerse AI is temporarily unavailable." });
    }
  });

  // Practice Questions Generator Endpoint
  app.post("/api/practice/generate", async (req, res) => {
    try {
      const apiKey = getGroqApiKey();
      const { level, subject } = req.body;

      const systemPrompt = `Generate exactly 3 high-quality multiple-choice practice mathematical questions customized for standard tests.
      Selected Level Category: ${level || "Class 9-10"}
      Topic Area: ${subject || "Algebra and Equations"}

      Format the response strictly as a JSON array (no wrapping quotes or backticks prefix, just JSON) containing objects with the following keys:
      - "id" (unique number)
      - "question" (the question string)
      - "options" (array of exactly 4 choices as strings)
      - "correctAnswer" (the string matching exactly one of the options)
      - "explanation" (concise, educational detail of the answer)

      Ensure clean JSON parser compatibility. Use proper LaTeX formulas inside text if needed.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the JSON practice questions array." }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      const textOutput = data.choices?.[0]?.message?.content || "{}";
      
      let parsed = JSON.parse(textOutput.trim());
      let questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

      res.json({ questions });
    } catch (err: any) {
      console.error("Practice Gen Error:", err);
      res.status(500).json({ error: "MathVerse AI is temporarily unavailable." });
    }
  });

  // AI Study Plan Generator Endpoint
  app.post("/api/planner/generate", async (req, res) => {
    try {
      const apiKey = getGroqApiKey();
      const { weakTopics, level } = req.body;

      const topicsStr = Array.isArray(weakTopics) && weakTopics.length > 0
        ? weakTopics.join(", ")
        : "General Mathematics";

      const systemPrompt = `You are a highly capable AI Academic Coordinator and Study Advisor. 
      Generate a customized, professional, and immersive step-by-step study plan tailored for:
      - Academic Grade Level: "${level || "Class 9-10"}"
      - Focus Areas / Weak Math Topics: "${topicsStr}"

      Format the response in clean, beautiful Markdown. 
      Structure the plan with sections for:
      - "# Quantum Study Strategy Plan"
      - "## Core Target Calibration" (summarizing what topics they need to learn and why)
      - "## 7-Day Curricular Schedule" (day-by-day tasks, time blocks, and practice topics)
      - "## Specialized Revision Tips & Formulas" (provide common formulas for the subjects and quick tips)
      - "## Mental Wellness & Focus Rules" (inspiring focus and healthy studying advice)

      Use engaging, futuristic, and encouraging language. Wrap LaTeX math formulas in $...$ syntax like $f(x) = \int x\,dx$.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate my math study plan." }
          ],
          temperature: 0.3
        })
      });

      let responseText = "";
      if (response.ok) {
        const data = await response.json();
        responseText = data.choices?.[0]?.message?.content || "";
      } else {
        console.warn("Primary planner model failed, trying fallback...");
        const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Generate my math study plan." }
            ],
            temperature: 0.3
          })
        });
        if (!fallbackResponse.ok) throw new Error(`Fallback status: ${fallbackResponse.status}`);
        const data = await fallbackResponse.json();
        responseText = data.choices?.[0]?.message?.content || "";
      }

      res.json({ plan: responseText });
    } catch (err: any) {
      console.error("Study Planner Gen Error:", err);
      res.status(500).json({ error: "MathVerse AI is temporarily unavailable." });
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
