import dotenv from "dotenv";
dotenv.config();

console.log("=== Testing Online Groq Solver ===");
console.log("API Key loaded:", process.env.VITE_GROQ_API_KEY ? "YES" : "NO");

(async () => {
  try {
    const { generateMathSolution } = await import("./src/services/aiService.ts");
    const question = "Solve for x: 3x^2 - 5x + 2 = 0";
    console.log(`Querying: "${question}"...\n`);
    const answer = await generateMathSolution(question, "Class 10");
    console.log("Groq AI Solver Response:\n");
    console.log(answer);
  } catch (e) {
    console.error("Error running solver test:", e);
  }
})();
