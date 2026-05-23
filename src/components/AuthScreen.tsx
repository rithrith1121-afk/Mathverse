import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Chrome } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (email: string) => void;
  onBack: () => void;
}

export default function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email identity address.");
      return;
    }
    if (password.length < 5) {
      setError("Quantum Key must be at least 5 indices.");
      return;
    }
    setError("");
    onAuthSuccess(email);
  };

  const handleOAuthSync = () => {
    setEmail("student@mathverse.ai");
    setPassword("quantumPass123");
    onAuthSuccess("student@mathverse.ai");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-12">
      {/* Decorative Blur Background Objects */}
      <div className="ambient-glow glow-1 opacity-20"></div>
      <div className="ambient-glow glow-2 opacity-15"></div>

      {/* Main Container */}
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 lg:gap-24 relative z-10">
        
        {/* Decorative Euler Equation panel (Left - Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative w-full max-w-lg aspect-square">
          <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute inset-8 rounded-full border border-purple-500/10 animate-[spin_40s_linear_infinite_reverse]"></div>
          <div className="absolute inset-16 rounded-full border border-indigo-500/10 border-dashed animate-[spin_50s_linear_infinite]"></div>
          
          <div className="text-6xl xl:text-7xl font-mono text-center text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-purple-300 to-indigo-400 opacity-80 select-none drop-shadow-[0_0_30px_rgba(0,210,255,0.3)]">
            e^{`{iπ}`} + 1 = 0
          </div>
          <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-mono">
            EULER'S IDENTITY CALIBRATION
          </p>
        </div>

        {/* Authentication Card (Right) */}
        <main className="w-full max-w-md relative z-10 flex-none bg-[#0a0e1a]/40 p-1">
          {/* Back button */}
          <button 
            type="button"
            onClick={onBack}
            className="mb-4 text-xs text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest font-mono flex items-center gap-1 cursor-pointer self-start"
          >
            ← Back to Void
          </button>

          {/* Header section */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-cyan-400 to-[#03e2ff] bg-clip-text text-transparent font-sans">
              MathVerse
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
              {isRegister ? "Establish Quantum Identity" : "Initialize Quantum Sequence"}
            </p>
          </div>

          {/* Glassmorphism auth panel */}
          <div className="glass-panel rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-xs text-red-200 font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block" htmlFor="email">
                  Email Identity
                </label>
                <div className="rounded-lg bg-slate-950 border border-slate-800 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center px-4 py-3 transition-all duration-300">
                  <Mail className="text-slate-500 w-4 h-4 mr-3" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="user@mathverse.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-[#dfe2f3] w-full text-sm placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="password">
                    Quantum Key
                  </label>
                  <a href="#" className="text-xs text-cyan-400 hover:text-[#00FBFF] transition-colors font-mono">
                    Forgot key?
                  </a>
                </div>
                <div className="rounded-lg bg-slate-950 border border-slate-800 focus-within:border-cyan-500 focus-within:shadow-[0_0_15px_rgba(0,210,255,0.2)] flex items-center px-4 py-3 transition-all duration-300">
                  <Lock className="text-slate-500 w-4 h-4 mr-3" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-[#dfe2f3] w-full text-sm placeholder-slate-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Sequence Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-300 text-slate-950 font-bold rounded-lg py-3 px-4 text-xs font-mono tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,255,0.5)] active:scale-95 transition-all duration-300 uppercase"
                >
                  <span>{isRegister ? "Construct Account" : "Initialize Sequence"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] font-mono text-slate-500">OR</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              {/* Google Workspace Sync */}
              <div>
                <button
                  type="button"
                  onClick={handleOAuthSync}
                  className="w-full cursor-pointer border border-cyan-500/40 bg-cyan-950/10 hover:bg-cyan-500/5 hover:border-cyan-400 text-cyan-400 font-mono text-xs rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Chrome className="w-4 h-4" />
                  <span>Sync with Google Workspace</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer switches */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-sans">
              {isRegister ? "Already in the database?" : "New to the Universe?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono ml-1 focus:outline-none cursor-pointer"
              >
                {isRegister ? "Initialize Login" : "Create Account"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
