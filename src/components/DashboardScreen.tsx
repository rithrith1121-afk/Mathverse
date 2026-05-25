import { Sparkles, BrainCircuit, Play, Award, RotateCcw, Flame, ArrowRight, Compass, ShieldAlert } from "lucide-react";
import { MathLevel, UserState } from "../types";

interface DashboardScreenProps {
  userState: UserState;
  onSolveRedirect: () => void;
  onPracticeRedirect: (selectedTopic?: string) => void;
  onProfileRedirect: () => void;
  onChangeLevelRedirect: () => void;
}

export default function DashboardScreen({
  userState,
  onSolveRedirect,
  onPracticeRedirect,
  onProfileRedirect,
  onChangeLevelRedirect,
}: DashboardScreenProps) {
  const currentLevel: MathLevel = userState.currentLevel!;

  return (
    <div className="relative min-h-screen">
      <div className="ambient-glow glow-1 opacity-10"></div>
      <div className="ambient-glow glow-2 opacity-10"></div>

      {/* Main Header bar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-cyan-400 w-5 h-5" />
          <span className="font-sans font-bold text-lg bg-gradient-to-r from-cyan-400 to-[#00FBFF] bg-clip-text text-transparent">
            MathVerse
          </span>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onProfileRedirect}
            className="text-xs transition-colors py-1.5 px-3 rounded-lg border border-slate-800 hover:border-cyan-500 bg-[#0a0e1a]/40 font-mono text-slate-300 hover:text-cyan-400 cursor-pointer flex items-center gap-2 focus:outline-none max-w-[150px] sm:max-w-none"
          >
            <span className="truncate max-w-[100px] sm:max-w-[200px] md:max-w-none inline-block align-bottom">{userState.email || "Guest Node"}</span>
          </button>
        </div>
      </header>

      {/* Main dashboard grid layout */}
      <main className="container mx-auto px-6 md:px-16 pt-24 max-w-7xl pb-16">
        
        {/* Futuristic Grid Hero Widget */}
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-[#00FBFF]/20 overflow-hidden mb-8 shadow-[0_0_30px_rgba(0,210,255,0.1)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-4 h-4 animate-spin-slow" /> Core Educational Orbit
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-sans text-white mb-2">
                Category: {currentLevel.name}
              </h2>
              <p className="text-slate-400 font-sans text-sm max-w-xl">
                Currently calibrated in <span className="text-cyan-300 font-semibold">{currentLevel.badge}</span> level. {currentLevel.description}. Reach absolute master calibration index.
              </p>
            </div>

            <button
              onClick={onChangeLevelRedirect}
              className="flex items-center gap-1.5 text-xs font-mono py-2 px-4 rounded-xl cursor-pointer border border-slate-800 hover:border-cyan-500 hover:bg-cyan-500/5 transition-all text-slate-400 hover:text-cyan-400"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Shift Orbit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 border-t border-slate-800/60 pt-6">
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex items-center gap-4">
              <Award className="text-[#00FBFF] w-8 h-8" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Learning Score</div>
                <div className="text-lg font-bold text-white">{userState.score} XP</div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex items-center gap-4">
              <BrainCircuit className="text-purple-400 w-8 h-8" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Solved via AI</div>
                <div className="text-lg font-bold text-white">{userState.solvedProblems} Solutions</div>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-[#00FBFF]/10 rounded-xl p-4 flex items-center gap-4">
              <Flame className="text-amber-500 w-8 h-8 animate-pulse" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Quantum Streak</div>
                <div className="text-lg font-bold text-white">4 Calibration Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Topic Checklist Area */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" /> Recommended Topic Curriculum
            </h3>
            
            <div className="space-y-3">
              {currentLevel.topics.map((topic, idx) => (
                <div
                  key={idx}
                  onClick={() => onPracticeRedirect(topic)}
                  className="group flex items-center justify-between p-4 bg-slate-950/60 hover:bg-[#00d2ff]/5 border border-slate-900 hover:border-[#00d2ff]/35 rounded-xl cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-600 group-hover:text-[#00d2ff] transition-colors">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[#dfe2f3] group-hover:text-white transition-colors">
                      {topic}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] font-mono text-slate-500 group-hover:text-[#00d2ff] group-hover:translate-x-1 transition-all">
                    <span>Practice Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Interactive Cards */}
          <div className="flex flex-col gap-6">
            
            {/* AI Solver Pathway */}
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/20 bg-slate-950/10 flex-1 hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/25 text-cyan-400 text-[10px] font-mono tracking-wider uppercase mb-4">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Active AI Solver Tool
                </div>
                <h4 className="text-lg font-bold text-white font-sans mb-2">
                  MathVerse AI Search Solver
                </h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Type or paste any complex formula, calculus equation, geometry proof, or algebra riddle. Gemini will generate a pedagogical, customized step-by-step resolution orbit.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={onSolveRedirect}
                  className="cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-300 hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] text-[#0a0e1a] font-bold text-xs font-mono tracking-wider py-2.5 px-6 rounded-lg uppercase flex items-center gap-1.5 group transition-all"
                >
                  <span>Solve Math Engine</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Practice Pathway */}
            <div className="glass-card rounded-2xl p-6 border border-purple-500/20 bg-slate-950/10 flex-1 hover:border-purple-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/25 text-purple-400 text-[10px] font-mono tracking-wider uppercase mb-4">
                  <Play className="w-3.5 h-3.5" /> High-Performance Test Grid
                </div>
                <h4 className="text-lg font-bold text-white font-sans mb-2">
                  Interactive Evaluation Hub
                </h4>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Calibrate your analytical metrics! Try randomized interactive practice problems corresponding to your curriculum to score higher XP and expand your mathematical footprint.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => onPracticeRedirect()}
                  className="cursor-pointer border border-purple-400 bg-purple-950/15 hover:bg-purple-950/30 font-bold text-xs font-mono text-purple-300 hover:text-purple-200 tracking-wider py-2.5 px-6 rounded-lg uppercase flex items-center gap-1.5 group transition-all"
                >
                  <span>Launch Evolution Practice</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Security / Connection Footer details */}
        <div className="mt-8 p-4 rounded-xl border border-slate-900 bg-slate-950/20 text-slate-500 flex items-center gap-2 text-xs font-mono justify-center">
          <ShieldAlert className="w-4 h-4 text-cyan-500" />
          <span>Active local database sandbox. Future sync modules are live.</span>
        </div>

      </main>
    </div>
  );
}
