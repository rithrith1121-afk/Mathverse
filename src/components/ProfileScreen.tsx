import React, { useState } from "react";
import { ArrowLeft, User, ShieldCheck, Flame, Cpu, RotateCcw, Award, LogOut, Check } from "lucide-react";
import { UserState } from "../types";

interface ProfileScreenProps {
  userState: UserState;
  onBack: () => void;
  onChangeLevel: () => void;
  onLogOut: () => void;
  onUpdateEmail: (newEmail: string) => void;
}

export default function ProfileScreen({
  userState,
  onBack,
  onChangeLevel,
  onLogOut,
  onUpdateEmail,
}: ProfileScreenProps) {
  const [emailInput, setEmailInput] = useState(userState.email || "");
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return;
    onUpdateEmail(emailInput);
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const currentLevel = userState.currentLevel!;

  return (
    <div className="relative min-h-screen">
      <div className="particles-layer"></div>

      {/* Top bar header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Settings
        </button>
        <div className="font-sans font-bold text-sm tracking-tight text-slate-400">
          User Settings Space
        </div>
      </header>

      {/* Main Settings Grid content */}
      <main className="container mx-auto px-6 md:px-16 pt-24 pb-16 max-w-4xl">
        <h2 className="text-2xl font-bold font-sans text-white mb-8">Quantum Identity Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Identity Card Block (Left - 4 columns) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center relative overflow-hidden">
              {/* Background gradient flare */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>

              <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#00FBFF]" />
              </div>

              <h3 className="text-sm font-mono text-slate-300 truncate tracking-wide">
                {userState.email || "Active Node"}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                CALIBRATED NODE ID
              </p>

              <div className="pt-4 border-t border-slate-900 mt-6 grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-slate-950/40 border border-slate-900 rounded-xl font-mono">
                  <div className="text-[9px] text-slate-500 uppercase">Score XP</div>
                  <div className="text-sm font-bold text-[#00d2ff]">{userState.score}</div>
                </div>
                <div className="text-center p-2 bg-slate-950/40 border border-slate-900 rounded-xl font-mono">
                  <div className="text-[9px] text-slate-500 uppercase">Solved</div>
                  <div className="text-sm font-bold text-[#00FBFF]">{userState.solvedProblems}</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogOut}
              className="cursor-pointer border border-red-500/30 bg-red-950/10 hover:bg-red-500/10 text-red-400 font-mono text-xs rounded-xl py-3 px-4 flex items-center justify-center gap-2 hover:border-red-400/50 transition-all uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Decommission Identity</span>
            </button>
          </div>

          {/* Form Settings Configuration Block (Right - 8 columns) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Form details */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-900">
                Core Configurations
              </h3>

              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 font-mono flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Quantum parameters updated successfully.</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="email-edit">
                    Identified Email Domain
                  </label>
                  
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        id="email-edit"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 w-full text-sm outline-none text-[#dfe2f3] focus:border-cyan-500 focus:ring-0"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer font-mono font-bold text-xs uppercase tracking-wider bg-cyan-400 text-[#0a0e1a] px-4 rounded-xl hover:shadow-[0_0_10px_rgba(3,226,255,0.3)] transition-all"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-sm font-sans text-slate-300 border border-slate-900">
                      <span>{userState.email || "student@mathverse.ai"}</span>
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="cursor-pointer text-xs font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        Redecorate
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Orbit change context */}
              <div className="pt-4 border-t border-slate-900 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="text-sm font-bold text-white">Active Orbit Location:</h4>
                    <p className="text-xs text-slate-400 mt-1">{currentLevel.name} Orbits</p>
                  </div>
                  <button
                    onClick={onChangeLevel}
                    className="cursor-pointer font-mono text-xs uppercase py-2.5 px-5 rounded-lg border border-slate-800 hover:border-cyan-500 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-Choose Level
                  </button>
                </div>
              </div>

            </div>

            {/* Achievement Stamps */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-900">
                Calibrated Achievements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center gap-4">
                  <Flame className="w-8 h-8 text-amber-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Orbit Explorer Streak</h5>
                    <p className="text-[10px] text-slate-500">4 Consecutive Days</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center gap-4">
                  <Award className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Gemini Oracle</h5>
                    <p className="text-[10px] text-slate-500">{userState.solvedProblems} math problems solved</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center gap-4">
                  <Cpu className="w-8 h-8 text-[#00FBFF] flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Futuristic Calibrator</h5>
                    <p className="text-[10px] text-slate-500">Node set matching {currentLevel.badge}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-[#00FBFF]/10 flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Identity Secure</h5>
                    <p className="text-[10px] text-slate-500">Valid Node active sequence</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
