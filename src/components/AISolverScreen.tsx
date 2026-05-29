import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowLeft, Loader2, PlaySquare, AlertCircle, Copy, Check, CheckCircle2, Upload, Camera } from "lucide-react";
import { MathLevel, UserState } from "../types";
import { generateMathSolution, solveMathFromImage } from "../services/aiService";



interface AISolverScreenProps {
  userState: UserState;
  onBack: () => void;
  onIncrementSolved: () => void;
}

export default function AISolverScreen({ userState, onBack, onIncrementSolved }: AISolverScreenProps) {
  const currentLevel: MathLevel = userState.currentLevel!;
  const [problemText, setProblemText] = useState("");
  const [solving, setSolving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [solutionHTML, setSolutionHTML] = useState<string | null>(null);

  // Quick pre-set complex problems so student can try right away on single click
  const presets = [
    {
      title: "Evaluate Integral of Sin(x) Cos(x) dx",
      text: "Evaluate the indefinite integral: ∫ sin(x) * cos(x) dx",
    },
    {
      title: "Solve Quadratic 3x² - 5x + 2 = 0",
      text: "Solve for x: 3x² - 5x + 2 = 0 with full derivation steps.",
    },
    {
      title: "Laplace Transform of e^{-2t} sin(4t)",
      text: "Find the Laplace Transform of f(t) = e^{-2t} * sin(4t).",
    }
  ];

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file upload selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported for AI solving.');
      return;
    }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  // Remove selected file
  const removeFile = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() && !uploadedFile) return;
    setSolving(true);
    setError("");
    setSolutionHTML(null);
    try {
      let result: string;
      if (uploadedFile) {
        result = await solveMathFromImage(uploadedFile, currentLevel.name, userState.learningMode);
      } else {
        result = await generateMathSolution(problemText, currentLevel.name, userState.learningMode);
      }
      setSolutionHTML(result);
      onIncrementSolved();
      if (userState.email) {
        await supabase.from("ai_history").insert({
          user_email: userState.email,
          question: uploadedFile ? '[image]' : problemText,
          answer: result,
          input_type: uploadedFile ? 'upload' : 'text'
        });
      }
    } catch (err: any) {
      console.error('Gemini error caught:', err);
      setError('MathVerse AI temporarily unavailable.');
    } finally {
      setSolving(false);
    }
  };

  const handleCopySolution = () => {
    if (!solutionHTML) return;
    navigator.clipboard.writeText(solutionHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-apply markdown parser elements simple regex
  const formatMarkdownText = (text: string) => {
    // Replace markdown tags with basic HTML
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace headers
    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="text-md font-bold text-cyan-300 mt-4 mb-2">$1</h4>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="text-lg font-bold text-[#00FBFF] border-b border-white/5 pb-2 mt-6 mb-3">$1</h3>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h2 class="text-xl font-extrabold text-white mt-8 mb-4">$1</h2>');

    // Replace bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00d2ff] font-semibold">$1</strong>');
    
    // Replace italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>');

    // Code blocks / formula blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 font-mono text-xs p-4 rounded-xl border border-slate-800 text-teal-300 overflow-x-auto my-4">$1</pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-[#0f131f] border border-slate-800 font-mono text-xs px-2 py-1 rounded text-cyan-300">$1</code>');

    // Math LaTeX blocks $ ... $
    formatted = formatted.replace(/\$+(.*?)\$+/g, '<span class="font-mono text-sm px-2 py-1 mx-1 tracking-wide bg-[#0a0e1a] rounded border border-cyan-500/10 text-cyan-300 select-all">$1</span>');

    // Replace newlines with <br> inside paragraphs and preserve lists
    formatted = formatted
      .split("\n")
      .map((line) => {
        if (/^[-*+]\s+(.*)/.test(line)) {
          return line.replace(/^[-*+]\s+(.*)/, '<li class="ml-4 list-disc text-sm text-slate-300 mb-1">$1</li>');
        }
        if (/^\d+\.\s+(.*)/.test(line)) {
          return line.replace(/^\d+\.\s+(.*)/, '<li class="ml-4 list-decimal text-sm text-slate-300 mb-1">$1</li>');
        }
        if (!line.trim()) return '<div class="h-2"></div>';
        if (line.startsWith("<h") || line.startsWith("<li") || line.startsWith("<pre")) return line;
        return `<p class="text-sm text-slate-300 leading-relaxed mb-3">${line}</p>`;
      })
      .join("");

    return formatted;
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Math Particle */}
      <div className="particles-layer"></div>

      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Solver
        </button>
        <div className="font-sans font-bold text-sm tracking-tight text-slate-400 flex items-center gap-1.5">
          <span className="hidden md:inline">Target Calibration:</span>
          <span className="hidden sm:inline md:hidden">Target:</span>
          <span className="text-cyan-400 font-mono px-2 py-0.5 border border-cyan-500/20 bg-cyan-950/20 rounded-full text-xs max-w-[120px] sm:max-w-none truncate">
            {currentLevel.name}
          </span>
        </div>
      </header>

      {/* Main Solver Grid Container */}
      <main className="container mx-auto px-6 md:px-16 pt-24 pb-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Input Form Column (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Context block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00FBFF]" /> Math Solver Synthesizer
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Provide equations, complex calculus Integrals, linear maps, or discrete math proofs. Gemini translates details into detailed educational steps.
              </p>

              {/* Pre-sets */}
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Try predefined triggers</div>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setProblemText(p.text); removeFile(); }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-cyan-500/40 text-xs text-slate-400 hover:text-[#00FBFF] transition-all cursor-pointer font-sans truncate block"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSolve}>
              <div className="flex gap-4 mb-4">
                

              </div>

              <textarea
                required
                placeholder="e.g. Find the roots of f(x) = x^3 - 3x^2 + x - 3 or formulate a step-by-step limits rule."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm font-sans focus:border-cyan-500 focus:ring-0 text-[#dfe2f3] placeholder-slate-600 outline-none resize-none transition-all"
                rows={6}
              />
              <button
                type="submit"
                disabled={solving || !problemText.trim()}
                className={`w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-300 font-mono text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-slate-950 ${
                  solving || !problemText.trim() ? "opacity-35 cursor-not-allowed" : "hover:shadow-[0_0_20px_rgba(3,226,255,0.4)]"
                }`}
              >
                {solving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Resolving Orbit...</span>
                  </>
                ) : (
                  <>
                    <PlaySquare className="w-4 h-4" />
                    <span>Trigger AI Resolution</span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Solution Viewer Area (Right) */}
          <div className="lg:col-span-7">
            
            {/* If loading */}
            {solving && (
              <div className="glass-card rounded-2xl p-8 border border-cyan-500/10 bg-slate-950/20 flex flex-col items-center justify-center min-h-[400px] text-center gap-6">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <div className="space-y-2">
                  <h4 className="text-[#00FBFF] text-lg font-bold font-sans tracking-tight animate-pulse">Calibrating Vector Steps</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                    MathVerse is parsing structural logic via server-side Gemini generation. Formulating intuitive answers with takeaways.
                  </p>
                </div>
                
                {/* Visual futuristic skeleton lines */}
                <div className="w-full max-w-md space-y-3 mt-4">
                  <div className="h-4 bg-slate-900 rounded-full animate-pulse w-3/4"></div>
                  <div className="h-3.5 bg-slate-900 rounded-full animate-pulse w-11/12"></div>
                  <div className="h-3.5 /bg-slate-900 bg-slate-900/60 rounded-full animate-pulse w-5/6"></div>
                  <div className="h-4 bg-slate-900/40 rounded-full animate-pulse w-2/3"></div>
                </div>
              </div>
            )}

            {/* If error */}
            {error && (
              <div className="glass-card rounded-2xl p-6 border border-red-500/30 bg-red-950/10 flex items-start gap-4 min-h-[150px]">
                <AlertCircle className="text-red-400 w-6 h-6 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-red-200 font-bold text-sm">Resolution Collision Detected</h4>
                  <p className="text-xs text-red-300/80 leading-relaxed max-w-md">
                    {error}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-4">
                    Verify GEMINI_API_KEY inside the workspace settings secrets.
                  </p>
                </div>
              </div>
            )}

            {/* Standard pre-submit layout */}
            {!solving && !error && !solutionHTML && (
              <div className="glass-card rounded-2xl p-8 border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[420px] text-center text-slate-500 gap-4">
                <Sparkles className="w-12 h-12 text-slate-700 animate-pulse" />
                <div>
                  <h4 className="text-white text-md font-bold mb-1 font-sans">AI Solver Console Stationary</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans leading-relaxed">
                    Formulate a mathematics problem or choose a pre-set vector on the left to activate synthesis.
                  </p>
                </div>
              </div>
            )}

            {/* Solved Output content render */}
            {!solving && !error && solutionHTML && (
              <div className="glass-panel rounded-2xl border border-[#00FBFF]/20 overflow-hidden shadow-2xl relative">
                
                {/* Result header bar */}
                <div className="bg-slate-950/60 border-b border-slate-900 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00FBFF] uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Math Resolution Complete
                  </div>
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 py-1.5 px-3 rounded-lg border border-slate-900 hover:border-cyan-500 transition-all cursor-pointer bg-slate-950/20"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Formatted body wrapper */}
                <div 
                  className="p-6 md:p-8 max-h-[600px] overflow-y-auto font-sans text-slate-300"
                  dangerouslySetInnerHTML={{ __html: formatMarkdownText(solutionHTML) }}
                />

                {/* Pedigree stamp */}
                <div className="bg-slate-950/40 border-t border-slate-900 px-6 py-3 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>RESOLVED MATRIX VECTOR VERIFIED</span>
                  <span>CALIBRATION SUITABLE</span>
                </div>

              </div>
            )}
        </div>
</div>


      </main>
    </div>
  );
}
