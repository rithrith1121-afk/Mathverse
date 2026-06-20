import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, User, ShieldCheck, Flame, Cpu, RotateCcw, 
  Award, LogOut, Check, Edit2, Info, Loader2, Sparkles, Image, CheckSquare, Settings
} from "lucide-react";
import { UserState } from "../types";
import { supabase } from "../lib/supabase";
import { 
  getUserProfile, 
  updateUsername, 
  updateBio, 
  uploadProfileBanner, 
  saveThemePreference, 
  getLearningPreferences, 
  saveLearningMode,
  UserProfile,
  LearningPreference
} from "../services/profileService";

interface ProfileScreenProps {
  userState: UserState;
  onBack: () => void;
  onChangeLevel: () => void;
  onLogOut: () => void;
  onUpdateEmail: (newEmail: string) => void;
  onAvatarChange?: (url: string) => void;
  onLearningModeChange?: (mode: LearningPreference['mode']) => void;
}

export default function ProfileScreen({
  userState,
  onBack,
  onChangeLevel,
  onLogOut,
  onUpdateEmail,
  onAvatarChange,
  onLearningModeChange,
}: ProfileScreenProps) {
  const currentLevel = userState.currentLevel!;
  
  // Profile settings state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learningPreference, setLearningPreference] = useState<LearningPreference | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("neon-dark");
  const [emailInput, setEmailInput] = useState(userState.email || "");

  // Action / status states
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const bannerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        // Fetch Profile
        const userProf = await getUserProfile(user.id);
        setProfile(userProf);
        setUsernameInput(userProf.username || "");
        setBioInput(userProf.bio || "");
        setSelectedTheme(userProf.selected_theme || "neon-dark");

        // Fetch Learning Preferences
        const learningPref = await getLearningPreferences(user.id);
        setLearningPreference(learningPref);
      } catch (err: any) {
        console.error("Error loading profile data:", err);
        setErrorMsg(err.message || "Failed to load identity profile.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Update username if changed
      if (usernameInput !== profile?.username) {
        await updateUsername(userId, usernameInput);
      }

      // 2. Update bio if changed
      if (bioInput !== profile?.bio) {
        await updateBio(userId, bioInput);
      }

      // 3. Update theme if changed
      if (selectedTheme !== profile?.selected_theme) {
        await saveThemePreference(userId, selectedTheme);
      }

      // Refresh cached profile state
      const updatedProf = await getUserProfile(userId);
      setProfile(updatedProf);
      setSuccessMsg("Quantum Identity updated successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLearningModeChange = async (mode: LearningPreference['mode']) => {
    if (!userId) return;
    setSavingPrefs(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await saveLearningMode(userId, mode);
      setLearningPreference({ user_id: userId, mode });
      if (onLearningModeChange) {
        onLearningModeChange(mode);
      }
      setSuccessMsg(`AI Learning style calibrated to '${mode.replace('_', ' ')}' mode.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save AI preference.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid banner type. Select a jpg, jpeg, png, or webp image.');
      return;
    }

    setUploadingBanner(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const publicUrl = await uploadProfileBanner(userId, file);
      setProfile(prev => prev ? { ...prev, banner_url: publicUrl } : null);
      setSuccessMsg("Futuristic profile banner uploaded successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to upload banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return;
    onUpdateEmail(emailInput);
    setEditingEmail(false);
    setSuccessMsg("Core connection email updated.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f131f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Synchronizing Identity space...</p>
      </div>
    );
  }

  const defaultBanner = "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)";

  return (
    <div className="relative min-h-screen pb-16 bg-[#0f131f]">
      <div className="particles-layer"></div>

      {/* Top bar header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Identity Space
        </button>
        <div className="font-sans font-bold text-sm tracking-tight text-slate-400">
          Quantum Customization Deck
        </div>
      </header>

      {/* Profile Banner */}
      <div className="pt-16">
        <div 
          className="h-48 md:h-64 w-full relative flex items-end px-6 md:px-16 pb-6 overflow-hidden border-b border-white/10"
          style={{ 
            background: profile?.banner_url ? `url(${profile.banner_url}) center/cover no-repeat` : defaultBanner 
          }}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f131f] via-[#0f131f]/40 to-transparent"></div>
          
          <button 
            onClick={() => bannerFileRef.current?.click()}
            className="absolute top-4 right-4 bg-slate-950/60 hover:bg-cyan-500/20 text-xs font-mono text-cyan-400 py-2 px-4 rounded-xl border border-cyan-400/30 backdrop-blur-md transition-all flex items-center gap-1.5 z-10 cursor-pointer"
            disabled={uploadingBanner}
          >
            {uploadingBanner ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Image className="w-3.5 h-3.5" />
                <span>Upload Quantum Banner</span>
              </>
            )}
          </button>
          <input 
            type="file" 
            ref={bannerFileRef} 
            accept="image/jpeg,image/jpg,image/png,image/webp" 
            className="hidden" 
            onChange={handleBannerUpload} 
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full">
            <div className="w-24 h-24 rounded-full bg-cyan-950 border-4 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,251,255,0.4)] overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-[#00FBFF]" />
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-wide">
                {profile?.username || userState.email?.split('@')[0] || "Active Calibration Node"}
              </h1>
              <p className="text-xs font-mono text-cyan-400">
                @{profile?.username || "calibrated_node"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <main className="container mx-auto px-6 md:px-16 pt-8 max-w-7xl">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-200 font-mono flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 font-mono flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Identity Stats & Core info Column (Left - 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card Block */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
              
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-900 mb-4">
                Quantum Statistics
              </h3>

              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="text-center p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Score XP</div>
                  <div className="text-lg font-bold text-[#00d2ff]">{userState.score}</div>
                </div>
                <div className="text-center p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Solved</div>
                  <div className="text-lg font-bold text-[#00FBFF]">{userState.solvedProblems}</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950/20 border border-slate-900/60 rounded-xl text-center">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{profile?.bio || "No description set in quantum databases."}"
                </p>
              </div>
            </div>

            {/* AI Learning Mode Display */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-900 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00FBFF]" /> Teaching Preference
              </h3>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-cyan-500/20 text-center space-y-2">
                <p className="text-xs text-slate-400 font-mono">ACTIVE TEACHING MODE</p>
                <div className="text-md font-bold uppercase tracking-wider text-cyan-400">
                  {learningPreference?.mode || "Detailed"}
                </div>
                <p className="text-[10px] text-slate-500">
                  Groq answers will align automatically with this cognitive instruction preference.
                </p>
              </div>
            </div>

            {/* Re-choose Level */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Orbits</h4>
                  <p className="text-sm font-bold text-white mt-1">{currentLevel.name}</p>
                </div>
                <button
                  onClick={onChangeLevel}
                  className="cursor-pointer font-mono text-xs uppercase py-2.5 px-4 rounded-lg border border-slate-800 hover:border-cyan-500 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-Choose Level
                </button>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogOut}
              className="w-full cursor-pointer border border-red-500/30 bg-red-950/10 hover:bg-red-500/10 text-red-400 font-mono text-xs rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 hover:border-red-400/50 transition-all uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Decommission Node Identity</span>
            </button>

          </div>

          {/* Settings Customization Blocks (Right - 8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Learning Mode Selector */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-white">
                  Calibrate AI Teaching Style
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Personalize the way the built-in Groq AI generates solutions and explanations across MathVerse.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <button
                  type="button"
                  onClick={() => handleLearningModeChange("simple")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    learningPreference?.mode === "simple"
                      ? "bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Simple</span>
                    {learningPreference?.mode === "simple" && <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Beginner-friendly explanations with straightforward analogies and simple language.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLearningModeChange("detailed")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    learningPreference?.mode === "detailed"
                      ? "bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Detailed</span>
                    {learningPreference?.mode === "detailed" && <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Deep conceptual explanation, complete theoretical insights, and proofs where useful.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLearningModeChange("visual")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    learningPreference?.mode === "visual"
                      ? "bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Visual</span>
                    {learningPreference?.mode === "visual" && <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Explanations focusing on visual layout, structured diagrams, charts, and spatial concept maps.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleLearningModeChange("exam_focused")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    learningPreference?.mode === "exam_focused"
                      ? "bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
                      : "bg-slate-950/60 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Exam Focused</span>
                    {learningPreference?.mode === "exam_focused" && <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Concise answers highlighting vital mathematical formulas, shortcuts, and exam traps.
                  </p>
                </button>

              </div>
            </div>

            {/* Profile Customization Form */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-white">
                  Quantum Parameter Customization
                </h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 block" htmlFor="username">
                      Unique Username (3-20 characters)
                    </label>
                    <input 
                      id="username"
                      type="text" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none text-[#dfe2f3] focus:border-cyan-500 transition-all font-sans"
                      placeholder="e.g. quantum_coder"
                      required
                    />
                  </div>

                  {/* Selected Theme Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 block" htmlFor="theme">
                      Vibrant Theme Select
                    </label>
                    <select 
                      id="theme"
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none text-[#dfe2f3] focus:border-cyan-500 transition-all font-sans"
                    >
                      <option value="neon-dark">Neon Dark (Glow Cyan)</option>
                      <option value="cyberpunk">Cyberpunk Purple (Neon Purple)</option>
                      <option value="solarized">Quantum Amber (Solarized)</option>
                    </select>
                  </div>
                </div>

                {/* Bio Field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="bio">
                    Bio/About Space (Max 160 characters)
                  </label>
                  <textarea 
                    id="bio"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none text-[#dfe2f3] focus:border-cyan-500 transition-all font-sans resize-none"
                    placeholder="Describe your quantum mathematics journey..."
                    rows={3}
                    maxLength={160}
                  />
                  <div className="text-[10px] text-slate-500 text-right font-mono">
                    {bioInput.length}/160
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full cursor-pointer bg-cyan-400 text-[#0a0e1a] font-mono font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all flex items-center justify-center gap-1.5"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Parameters...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Quantum Customization</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Core Email Connection */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-white">
                  Core Account Parameters
                </h3>
              </div>

              <form onSubmit={handleSaveEmail} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 block" htmlFor="email-edit">
                    Core Connection Email
                  </label>
                  
                  {editingEmail ? (
                    <div className="flex gap-2">
                      <input
                        id="email-edit"
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 w-full text-sm outline-none text-[#dfe2f3] focus:border-cyan-500 transition-all"
                      />
                      <button
                        type="submit"
                        className="cursor-pointer font-mono font-bold text-xs uppercase tracking-wider bg-cyan-400 text-[#0a0e1a] px-5 rounded-xl hover:shadow-[0_0_10px_rgba(3,226,255,0.3)] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 text-sm font-sans text-slate-300 border border-slate-900">
                      <span>{userState.email || "student@mathverse.ai"}</span>
                      <button
                        type="button"
                        onClick={() => setEditingEmail(true)}
                        className="cursor-pointer text-xs font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        Modify Contact
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
