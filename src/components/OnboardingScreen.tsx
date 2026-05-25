import { Sparkles, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

interface OnboardingScreenProps {
  onStart: () => void;
  onAlreadyHaveAccount: () => void;
}

export default function OnboardingScreen({ onStart, onAlreadyHaveAccount }: OnboardingScreenProps) {
  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 md:px-16 py-4 sm:py-12 overflow-hidden bg-[#0a0e1a]/80">
      {/* Floating Math Symbols Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="relative w-full max-w-7xl h-full opacity-30">
          <span className="absolute top-[20%] left-[15%] text-7xl font-mono text-[#00FBFF] math-symbol-float">∫</span>
          <span className="absolute top-[30%] right-[15%] text-8xl font-mono text-purple-400 math-symbol-float-delay-1">Σ</span>
          <span className="absolute bottom-[25%] left-[25%] text-9xl font-mono text-[rgb(0,220,224)] math-symbol-float-delay-2">π</span>
          <span className="absolute top-[50%] right-[25%] text-6xl font-mono text-cyan-400 math-symbol-float-delay-3">√</span>
          <span className="absolute bottom-[30%] right-[10%] text-5xl font-mono text-[#dfe2f3] math-symbol-float">∞</span>
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 sm:gap-12 lg:gap-24 justify-center">
        
        {/* Left Column: Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 lg:gap-8 flex-1 order-2 lg:order-1">
          {/* Logo / Brand Identifier */}
          <div className="flex items-center gap-2 glass-panel px-4 py-1.5 lg:px-6 lg:py-2 rounded-full self-center lg:self-start">
            <Sparkles className="text-[#00d2ff] w-4 h-4 lg:w-5 lg:h-5 animate-pulse" />
            <span className="font-sans text-lg lg:text-xl font-bold tracking-tighter bg-gradient-to-r from-cyan-400 via-primary to-purple-400 bg-clip-text text-transparent">
              MathVerse
            </span>
          </div>

          {/* Headlines */}
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-sans text-[#dfe2f3] leading-tight">
              Master Mathematics<br className="hidden lg:block"/>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00FBFF] shadow-cyan-500/50">
                with AI
              </span>
            </h1>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-1 lg:mt-4 w-full sm:w-auto">
            <button
              onClick={onStart}
              className="w-full sm:w-auto cursor-pointer rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-[1.03] flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-cyan-500 to-cyan-300 text-slate-900 font-bold shadow-[0px_0px_20px_rgba(0,210,255,0.4)]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onAlreadyHaveAccount}
              className="w-full sm:w-auto cursor-pointer bg-transparent border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 text-slate-300 px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-medium text-sm"
            >
              Already have an account
            </button>
          </div>

          {/* Trust / Micro-copy */}
          <div className="mt-2 lg:mt-6 flex items-center gap-4 text-slate-500 text-xs uppercase tracking-widest font-mono self-center lg:self-start">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Secure
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-4 h-4 text-purple-400" /> AI-Powered
            </span>
          </div>
        </div>

        {/* Right Column: Premium Illustration Area */}
        <div className="w-[180px] sm:w-[260px] md:w-[350px] lg:w-1/2 aspect-square lg:aspect-[4/3] relative rounded-3xl overflow-hidden glass-panel flex items-center justify-center order-1 lg:order-2 shadow-[0_0_50px_rgba(0,210,255,0.15)] flex-shrink-0">
          {/* Fallback gradient if image doesn't load immediately */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#0a0e1a] z-0"></div>
          <img
            alt="Abstract 3D geometric shapes including spheres and pyramids floating in a deep navy and neon blue cosmic space. The lighting is soft and ethereal, reflecting a high-tech, futuristic mathematical AI aesthetic."
            className="w-full h-full object-cover mix-blend-screen opacity-90 z-10"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPk8NpurW8UFBpoA-kqigU3NipwJkOM9Vw0IOnMdTrttbdaW2_MH9YtEm039LiVI3KmYDQho6zci5UU9Nwi-0zXMijveHeBqwlAGXJye7GNjohZFxoMQqF5a9Vfx4PrO9Wbt0a4IBM7Hq5YZoXDi45qZsTeyIHkk8ybxaFB4Iy6xWXoscBcuw8Ai5QYnWtRu9d_T0gqmU3KMlESbHOAFfVoTCihP0YbFMH6HyqRC-x83Y_k1MmaT43qQibh4Zg8eWCkhYBzNM0caq8"
          />
          {/* Inner glow overlay */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(10,14,26,0.95)] z-20 pointer-events-none"></div>
        </div>

      </div>
    </main>
  );
}
