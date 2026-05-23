import { useState } from "react";
import { Calculator, Compass, Binary, TrendingUp, GraduationCap, Cpu, ArrowRight, ArrowLeft } from "lucide-react";
import { MathLevel, mathLevels } from "../types";

interface LevelSelectionScreenProps {
  onLevelSelect: (level: MathLevel) => void;
  onBack: () => void;
}

export default function LevelSelectionScreen({ onLevelSelect, onBack }: LevelSelectionScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "calculate":
        return <Calculator className="w-6 h-6 text-cyan-400" />;
      case "architecture":
        return <Compass className="w-6 h-6 text-purple-400" />;
      case "functions":
        return <Binary className="w-6 h-6 text-pink-400" />;
      case "timeline":
        return <TrendingUp className="w-6 h-6 text-amber-500" />;
      case "school":
        return <GraduationCap className="w-6 h-6 text-teal-400" />;
      case "memory":
        return <Cpu className="w-6 h-6 text-[#00FBFF]" />;
      default:
        return <Calculator className="w-6 h-6 text-cyan-400" />;
    }
  };

  const handleCardClick = (id: string) => {
    setSelectedId(id);
  };

  const handleContinue = () => {
    if (!selectedId) return;
    const levelObj = mathLevels.find((l) => l.id === selectedId);
    if (levelObj) {
      onLevelSelect(levelObj);
    }
  };

  return (
    <div className="relative min-h-screen pb-32">
      {/* Ambient background particles layer */}
      <div className="particles-layer"></div>

      {/* Header bar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-sans font-bold text-lg tracking-tighter bg-gradient-to-r from-cyan-400 to-[#00FBFF] bg-clip-text text-transparent">
          MathVerse
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 md:px-16 pt-28 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold text-[#dfe2f3] mb-2 leading-tight">
            Choose Your Current Level
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-sans font-light">
            Calibrating your mathematical journey. Select an orbit.
          </p>
        </div>

        {/* Bento Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathLevels.map((level) => {
            const isSelected = selectedId === level.id;
            return (
              <div
                key={level.id}
                onClick={() => handleCardClick(level.id)}
                className={`glass-card rounded-2xl p-6 cursor-pointer glow-hover transition-all duration-500 group relative border ${
                  isSelected
                    ? "border-[#00FBFF] shadow-[0px_0px_30px_rgba(0,251,255,0.30)] bg-slate-900/40"
                    : "border-white/10 hover:border-cyan-500/50"
                }`}
              >
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isSelected
                        ? "bg-[#00FBFF]/10 border-[#00FBFF]"
                        : "bg-slate-950/40 border-slate-800 group-hover:border-cyan-500/40"
                    }`}
                  >
                    {getIconComponent(level.icon)}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium px-3 py-1 rounded-full border transition-all ${
                      isSelected
                        ? "bg-[#00FBFF]/10 border-[#00FBFF]/40 text-[#00FBFF]"
                        : "bg-slate-950/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    {level.badge}
                  </span>
                </div>

                <h3 className="text-lg font-sans font-bold text-[#dfe2f3] mb-1 group-hover:text-cyan-400 transition-colors">
                  {level.name}
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-sans">
                  {level.description}
                </p>

                {/* Simulated Progress bar */}
                <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-cyan-400 to-[#00FBFF] transition-all duration-700 ${
                      isSelected ? "w-2/3" : (level.id === "class-1-5" ? "w-1/4" : "w-0 group-hover:w-1/12")
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Continue / Initiate Orbit Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 md:p-8 flex justify-center z-40 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/95 to-transparent pb-8">
        <button
          disabled={!selectedId}
          onClick={handleContinue}
          className={`glass-card px-12 py-4 rounded-xl flex items-center gap-2 transition-all duration-500 font-mono text-xs uppercase tracking-wider border font-bold ${
            selectedId
              ? "glow-active border-transparent text-slate-950 cursor-pointer transform hover:scale-105"
              : "opacity-40 cursor-not-allowed text-slate-400 border-white/10"
          }`}
          style={{
            background: selectedId
              ? "linear-gradient(90deg, #00d2ff 0%, #00f5f9 100%)"
              : "rgba(255, 255, 255, 0.03)",
            color: selectedId ? "#0a0e1a" : "#94a3b8"
          }}
        >
          <span>Continue Calibration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
