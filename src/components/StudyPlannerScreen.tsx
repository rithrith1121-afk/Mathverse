import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Calendar, CheckSquare, Plus, Trash2, Sparkles, Loader2, 
  CheckCircle2, Clock, BookOpen, AlertCircle, RefreshCw, Star
} from "lucide-react";
import { MathLevel, UserState } from "../types";
import { 
  createDailyGoal, 
  updateGoalStatus, 
  getDailyGoals, 
  createTimetableItem, 
  getTimetableItems, 
  deleteTimetableItem, 
  generateRevisionPlan, 
  getAIStudyPlans,
  DailyGoal, 
  TimetableItem,
  AIStudyPlan 
} from "../services/plannerService";

interface StudyPlannerScreenProps {
  userState: UserState;
  onBack: () => void;
}

export default function StudyPlannerScreen({ userState, onBack }: StudyPlannerScreenProps) {
  const currentLevel: MathLevel = userState.currentLevel!;
  const userId = userState.id || "";

  // Data states
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [aiPlans, setAiPlans] = useState<AIStudyPlan[]>([]);

  // Form input states
  const [newGoal, setNewGoal] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDay, setNewDay] = useState<TimetableItem['day_of_week']>("Monday");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  
  // Topic selection for AI Planner
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  // Status states
  const [loading, setLoading] = useState(true);
  const [addingGoal, setAddingGoal] = useState(false);
  const [addingTime, setAddingTime] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  async function loadPlannerData() {
    if (!userId) return;
    try {
      const [goalsList, timeList, plansList] = await Promise.all([
        getDailyGoals(userId, todayStr),
        getTimetableItems(userId),
        getAIStudyPlans(userId),
      ]);
      setGoals(goalsList);
      setTimetable(timeList);
      setAiPlans(plansList);
      if (plansList.length > 0 && !activePlan) {
        setActivePlan(plansList[0].plan_content);
      }
    } catch (err: any) {
      console.error("Failed to load planner:", err);
      setError("Error loading planner parameters.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlannerData();
  }, [userId]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setAddingGoal(true);
    setError(null);
    try {
      const goalObj = await createDailyGoal(userId, todayStr, newGoal.trim());
      setGoals(prev => [...prev, goalObj]);
      setNewGoal("");
      setSuccess("Goal logged successfully.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create goal.");
    } finally {
      setAddingGoal(false);
    }
  };

  const handleToggleGoal = async (goalId: string, currentCompleted: boolean) => {
    try {
      const targetState = !currentCompleted;
      await updateGoalStatus(goalId, targetState);
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: targetState } : g));
    } catch (err: any) {
      setError("Failed to update status.");
    }
  };

  const handleAddTimetableItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    setAddingTime(true);
    setError(null);
    try {
      const timeItem = await createTimetableItem(userId, newSubject.trim(), newDay, newStart, newEnd);
      setTimetable(prev => [...prev, timeItem].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setNewSubject("");
      setSuccess("Timetable node calibrated.");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to add timetable item.");
    } finally {
      setAddingTime(false);
    }
  };

  const handleDeleteTimeItem = async (itemId: string) => {
    try {
      await deleteTimetableItem(itemId);
      setTimetable(prev => prev.filter(t => t.id !== itemId));
    } catch (err: any) {
      setError("Failed to revoke timetable item.");
    }
  };

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  const handleGenerateAIPlan = async () => {
    setGeneratingPlan(true);
    setError(null);
    try {
      const planContent = await generateRevisionPlan(userId, selectedTopics, currentLevel.name);
      setActivePlan(planContent);
      // Reload plans
      const plansList = await getAIStudyPlans(userId);
      setAiPlans(plansList);
      setSuccess("Quantum AI plan generated!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI study plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const formatMarkdown = (text: string) => {
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="text-xs font-bold text-cyan-300 mt-4 mb-1.5 uppercase font-mono">$1</h4>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold text-[#00FBFF] border-b border-white/5 pb-1 mt-5 mb-2 uppercase font-mono">$1</h3>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h2 class="text-md font-extrabold text-white mt-6 mb-3 uppercase font-mono">$1</h2>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00d2ff] font-semibold">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>');
    formatted = formatted.replace(/\$+(.*?)\$+/g, '<code class="bg-[#0a0e1a] border border-cyan-500/20 font-mono text-[11px] px-1.5 py-0.5 rounded text-cyan-300">$1</code>');

    return formatted
      .split("\n")
      .map(line => {
        if (/^[-*+]\s+(.*)/.test(line)) {
          return line.replace(/^[-*+]\s+(.*)/, '<li class="ml-4 list-disc text-xs text-slate-300 mb-1">$1</li>');
        }
        if (!line.trim()) return '<div class="h-2"></div>';
        if (line.startsWith("<h") || line.startsWith("<li")) return line;
        return `<p class="text-xs text-slate-300 leading-relaxed mb-2">${line}</p>`;
      })
      .join("");
  };

  const completionPercentage = goals.length > 0 
    ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f131f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Loading planner systems...</p>
      </div>
    );
  }

  const days: TimetableItem['day_of_week'][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="relative min-h-screen pb-16 bg-[#0f131f]">
      <div className="particles-layer"></div>

      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="font-sans font-bold text-sm tracking-tight text-slate-400">
          Curricular Planner Command
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 md:px-16 pt-24 max-w-7xl space-y-8">
        
        {/* Banner info */}
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="space-y-2 z-10 relative">
            <h2 className="text-xl font-bold font-sans text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Quantum Schedule & AI Planner
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Establish study slots, formulate daily milestone goals, and deploy advanced Groq AI study coordination programs tailored around your target curriculum.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-200 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Goals & Timetable Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Goals Block (Left - 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Daily Milestones */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-900 flex items-center justify-between">
                <span>Today's Study Goals</span>
                <span className="text-[10px] text-cyan-400">{completionPercentage}% Done</span>
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="bg-cyan-400 h-full shadow-[0_0_8px_rgba(0,251,255,0.4)] transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {/* Add Goal form */}
              <form onSubmit={handleAddGoal} className="flex gap-2">
                <input 
                  type="text" 
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-[#dfe2f3] focus:border-cyan-500 font-sans"
                  placeholder="e.g. Solve 3 Integrals"
                  required
                />
                <button 
                  type="submit"
                  disabled={addingGoal}
                  className="bg-cyan-400 text-slate-950 px-3 rounded-xl hover:shadow-[0_0_10px_rgba(0,251,255,0.3)] transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Goals list */}
              <div className="space-y-2 pt-2">
                {goals.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-4 font-mono">No target parameters registered for today.</p>
                ) : (
                  goals.map(g => (
                    <div 
                      key={g.id}
                      onClick={() => handleToggleGoal(g.id, g.completed)}
                      className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-xl cursor-pointer select-none transition-all"
                    >
                      <input 
                        type="checkbox" 
                        checked={g.completed}
                        onChange={() => {}} // handled by parent div click
                        className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span className={`text-xs ${g.completed ? "line-through text-slate-500 font-mono" : "text-slate-300 font-sans"}`}>
                        {g.goal}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Plan Trigger selector */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> AI Revision Co-pilot
              </h3>
              
              <p className="text-[11px] text-slate-400">
                Choose focus topics from the category level below. Groq will synthesize a customized 7-day revision schedule with formulas.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {currentLevel.topics.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTopicToggle(t)}
                    className={`text-[10px] font-mono py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                      selectedTopics.includes(t)
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerateAIPlan}
                disabled={generatingPlan}
                className="w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-300 font-mono text-xs font-bold uppercase tracking-wider py-3 rounded-xl text-slate-950 hover:shadow-[0_0_15px_rgba(0,251,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Build AI Study Matrix</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Timetable & AI plan content (Right - 7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Timetable blocks */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-900 flex items-center justify-between">
                <span>Timetable Schedule</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </h3>

              {/* Add schedule item */}
              <form onSubmit={handleAddTimetableItem} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input 
                  type="text" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="sm:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-[#dfe2f3] focus:border-cyan-500"
                  placeholder="Subject/Topic"
                  required
                />
                
                <select 
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value as any)}
                  className="sm:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-[#dfe2f3] focus:border-cyan-500"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d.substring(0, 3)}</option>
                  ))}
                </select>

                <input 
                  type="time" 
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-[#dfe2f3]"
                  required
                />
                
                <input 
                  type="time" 
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-[#dfe2f3]"
                  required
                />

                <button 
                  type="submit"
                  disabled={addingTime}
                  className="sm:col-span-1 bg-purple-500 text-white rounded-xl hover:shadow-[0_0_10px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center cursor-pointer min-h-[38px]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Timetable Items Display */}
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                {timetable.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-4 font-mono">No timetable calibration entries.</p>
                ) : (
                  timetable.map(t => (
                    <div 
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 hover:border-slate-850 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/20 text-[10px] font-mono text-purple-300">
                          {t.day_of_week.substring(0, 3)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 font-sans">{t.subject}</h4>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {t.start_time.substring(0, 5)} - {t.end_time.substring(0, 5)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTimeItem(t.id)}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Generated Study Plan Viewer */}
            {activePlan && (
              <div className="glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl relative">
                <div className="bg-slate-950/60 border-b border-slate-900 px-6 py-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#00FBFF]">Active AI Plan Matrix</h4>
                </div>

                <div 
                  className="p-6 max-h-[300px] overflow-y-auto text-slate-300 font-sans"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(activePlan) }}
                />
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
