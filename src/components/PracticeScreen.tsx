import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Award, ArrowRight, BrainCircuit, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { MathLevel, PracticeQuestion, UserState } from "../types";

interface PracticeScreenProps {
  userState: UserState;
  selectedTopic?: string;
  onBack: () => void;
  onAddScore: (points: number) => void;
}

export default function PracticeScreen({ userState, selectedTopic, onBack, onAddScore }: PracticeScreenProps) {
  const currentLevel: MathLevel = userState.currentLevel!;
  const topicToLoad = selectedTopic || currentLevel.topics[0] || "Algebra and Equations";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Load questions from Gemini API prompt on Mount
  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswersCount(0);

    try {
      const response = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: currentLevel.name,
          subject: topicToLoad,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse questions.");
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        throw new Error("Zero practice questions loaded. Try refreshing.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An issue occurred. Ensure Gemini secrets keys are healthy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicToLoad]);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    if (option === currentQ.correctAnswer) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished all 3 questions! Increment user state score in App.tsx
      const finalScoreEarned = correctAnswersCount * 20;
      onAddScore(finalScoreEarned);
      setCurrentIndex((prev) => prev + 1); // Move to final summary card
    }
  };

  const currentQ = questions[currentIndex];
  const isFinished = currentIndex >= questions.length && questions.length > 0;

  return (
    <div className="relative min-h-screen">
      <div className="particles-layer"></div>

      {/* Header element */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Practice
        </button>
        <div className="font-sans font-bold text-sm text-slate-400 font-mono">
          <span>Topic:</span> <span className="text-[#00FBFF]">{topicToLoad}</span>
        </div>
      </header>

      {/* Main interactive area */}
      <main className="container mx-auto px-6 md:px-16 pt-24 max-w-3xl pb-16">
        
        {/* Loader skeleton */}
        {loading && (
          <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center min-h-[350px] text-center gap-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div>
              <h4 className="text-[#00FBFF] text-md font-bold font-mono">Synthesizing Smart Evaluation Vector</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
                Gemini is composing custom equations according to orbits matching {currentLevel.name}. Just a moment...
              </p>
            </div>
          </div>
        )}

        {/* Error panel */}
        {error && (
          <div className="glass-card rounded-2xl p-8 border border-red-500/30 bg-red-950/10 text-center space-y-4">
            <h4 className="text-red-200 font-bold text-sm tracking-wide font-mono">CALIBRATION COLLISION</h4>
            <p className="text-xs text-red-300 max-w-md mx-auto leading-relaxed">
              {error}
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={fetchQuestions}
                className="cursor-pointer font-mono text-xs uppercase border border-cyan-500 hover:bg-cyan-500/5 text-cyan-400 py-2.5 px-6 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry Connection
              </button>
              <button
                onClick={onBack}
                className="cursor-pointer font-mono text-xs uppercase border border-slate-850 hover:bg-white/5 text-slate-400 py-2.5 px-6 rounded-lg"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Practice wizard card */}
        {!loading && !error && !isFinished && currentQ && (
          <div className="space-y-6">
            
            {/* Progression details card */}
            <div className="flex items-center justify-between font-mono text-xs px-2">
              <span className="text-slate-500">
                Matrix Step: <strong className="text-cyan-400">{currentIndex + 1} / {questions.length}</strong>
              </span>
              <span className="text-slate-500">
                XP Potential: <strong className="text-amber-400">+{questions.length * 20} XP</strong>
              </span>
            </div>

            {/* Core Question Card */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Category Vector Question
              </span>
              <h3 className="text-lg md:text-xl font-sans mt-4 text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options list */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQ.correctAnswer;
                
                let optionStyle = "border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 text-slate-300";
                let iconToRender = null;

                if (isAnswered) {
                  if (isCorrect) {
                     optionStyle = "border-emerald-500 bg-emerald-950/10 text-emerald-200";
                     iconToRender = <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
                  } else if (isSelected) {
                     optionStyle = "border-red-500 bg-red-950/10 text-red-200";
                     iconToRender = <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
                  } else {
                     optionStyle = "border-slate-800/40 opacity-40 text-slate-500";
                  }
                } else if (isSelected) {
                  optionStyle = "border-[#00FBFF] bg-cyan-950/10 text-[#00FBFF]";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left p-4 rounded-xl border cursor-pointer hover:bg-slate-950/80 hover:shadow-[0_0_10px_rgba(0,210,255,0.05)] transition-all flex items-center justify-between text-sm md:text-base font-sans leading-relaxed ${optionStyle}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-500">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </span>
                    {iconToRender}
                  </button>
                );
              })}
            </div>

            {/* Show Explanation and Step progression once Answered */}
            {isAnswered && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Pedagogical Insight</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-900">
                  <button
                    onClick={handleNext}
                    className="cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-300 hover:shadow-[0_0_15px_rgba(0,210,255,0.3)] text-[#0a0e1a] font-bold text-xs font-mono tracking-wider py-2.5 px-6 rounded-lg uppercase flex items-center gap-1.5 transition-all"
                  >
                    <span>{currentIndex < questions.length - 1 ? "Next Vector" : "Finish Series"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Final Completion Summary layout */}
        {!loading && !error && isFinished && (
          <div className="glass-panel rounded-2xl p-8 border border-[#00FBFF]/20 text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Absolute background visual rings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#00FBFF]/5 border-dashed pointer-events-none"></div>

            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold text-white font-sans">Verification Index Complete</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
                You have beautifully negotiated elements inside topic orbit: <strong className="text-cyan-400">{topicToLoad}</strong> at {currentLevel.name} grade.
              </p>
            </div>

            {/* Performance matrix summary */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="text-center font-mono p-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Correct</div>
                <div className="text-xl font-bold text-emerald-400">{correctAnswersCount} / {questions.length}</div>
              </div>
              <div className="text-center font-mono p-2 border-l border-slate-900">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Orbit XP Given</div>
                <div className="text-xl font-bold text-amber-400">+{correctAnswersCount * 20} XP</div>
              </div>
            </div>

            {/* Option CTA redirects */}
            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={fetchQuestions}
                className="cursor-pointer font-mono text-xs uppercase border border-cyan-500/40 hover:bg-cyan-500/5 text-cyan-400 py-3 px-6 rounded-lg flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Recalibrate Orbit
              </button>
              <button
                onClick={onBack}
                className="cursor-pointer font-mono text-xs bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] text-[#0a0e1a] font-bold py-3 px-6 rounded-lg uppercase"
              >
                Navigate Home
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
