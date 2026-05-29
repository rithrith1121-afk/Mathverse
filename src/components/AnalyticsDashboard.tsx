import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, Award, Flame, BrainCircuit, Loader2, ArrowLeft, Calendar, 
  Target, GraduationCap, Clock, RefreshCw, BarChart2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { 
  getWeeklyProgress, 
  getTopicsMastered, 
  getDailyStudyHeatmap, 
  getAIUsageStats, 
  WeeklyProgressPoint, 
  TopicMastery, 
  HeatmapPoint, 
  AIUsageStats 
} from "../services/analyticsService";

interface AnalyticsDashboardProps {
  userId: string;
  onBack: () => void;
}

export default function AnalyticsDashboard({ userId, onBack }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"weekly" | "monthly">("weekly");
  const [error, setError] = useState<string | null>(null);

  // States for analytics metrics
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressPoint[]>([]);
  const [topicsMastered, setTopicsMastered] = useState<TopicMastery[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [stats, setStats] = useState<AIUsageStats | null>(null);

  async function loadAnalyticsData() {
    setError(null);
    try {
      const [weekly, topics, mapPoint, usage] = await Promise.all([
        getWeeklyProgress(userId),
        getTopicsMastered(userId),
        getDailyStudyHeatmap(userId),
        getAIUsageStats(userId),
      ]);

      setWeeklyProgress(weekly);
      setTopicsMastered(topics);
      setHeatmap(mapPoint);
      setStats(usage);
    } catch (err: any) {
      console.error("Failed to load analytics records:", err);
      setError(err.message || "An unexpected error occurred while loading analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAnalyticsData();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f131f] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-wider text-slate-400">Loading vector matrices...</p>
      </div>
    );
  }

  // Fallback mocks if database has no entries
  const hasNoData = !stats || stats.solved === 0;

  const mockWeeklyProgress: WeeklyProgressPoint[] = [
    { day: "Sun", solved: 4, correct: 3 },
    { day: "Mon", solved: 6, correct: 5 },
    { day: "Tue", solved: 3, correct: 2 },
    { day: "Wed", solved: 8, correct: 7 },
    { day: "Thu", solved: 5, correct: 4 },
    { day: "Fri", solved: 7, correct: 6 },
    { day: "Sat", solved: 9, correct: 8 },
  ];

  const mockTopicsMastered: TopicMastery[] = [
    { topic: "Algebra", solved: 15, accuracy: 85 },
    { topic: "Calculus", solved: 12, accuracy: 75 },
    { topic: "Geometry", solved: 8, accuracy: 90 },
    { topic: "Probability", solved: 10, accuracy: 70 },
  ];

  const displayWeekly = hasNoData ? mockWeeklyProgress : weeklyProgress;
  const displayTopics = hasNoData ? mockTopicsMastered : topicsMastered;

  const formatStreakText = (days: number) => {
    return `${days} Day${days !== 1 ? "s" : ""}`;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-slate-900 border-slate-950";
    if (count < 3) return "bg-cyan-950 border-cyan-900 text-cyan-300";
    if (count < 6) return "bg-cyan-800 border-cyan-700 text-cyan-200";
    return "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(0,251,255,0.4)]";
  };

  return (
    <div className="relative min-h-screen pb-16 bg-[#0f131f]">
      <div className="particles-layer"></div>

      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-16 h-16 bg-[#0f131f]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,210,255,0.05)]">
        <button
          onClick={onBack}
          className="text-cyan-400 hover:scale-95 transition-transform p-2 rounded-full hover:bg-white/5 cursor-pointer flex items-center gap-1 text-sm uppercase tracking-wider font-mono focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Space
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-400 hover:text-cyan-400 p-2 rounded-full cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <span className="font-sans font-bold text-sm tracking-tight text-slate-400">
            Cognitive Diagnostics Suite
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 md:px-16 pt-24 max-w-7xl space-y-8">
        
        {/* Banner Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 border border-cyan-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl"></div>
          
          <div className="space-y-2 z-10">
            <h2 className="text-xl md:text-2xl font-bold font-sans text-white tracking-wide flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-[#00FBFF]" /> Diagnostics telemetry
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Track your solved equations, conceptual accuracy margins, active learning session diagnostics, and Supabase cloud sync status.
            </p>
          </div>

          <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-900 z-10 font-mono text-[10px] uppercase">
            <button
              onClick={() => setFilter("weekly")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filter === "weekly" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setFilter("monthly")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filter === "monthly" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {hasNoData && (
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>No data tracked yet. Displaying standard vector telemetry presets for demonstration.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300 font-mono">
            Error loading diagnostic telemetry: {error}
          </div>
        )}

        {/* 4 Summary Stats Block */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-4 relative overflow-hidden">
            <Flame className="w-8 h-8 text-amber-500 animate-pulse flex-shrink-0" />
            <div>
              <h4 className="text-[10px] font-mono text-slate-500 uppercase">Active Streak</h4>
              <div className="text-lg font-bold text-white mt-0.5">
                {formatStreakText(stats?.streak || 0)}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
            <Target className="w-8 h-8 text-[#00FBFF] flex-shrink-0" />
            <div>
              <h4 className="text-[10px] font-mono text-slate-500 uppercase">Cognitive Accuracy</h4>
              <div className="text-lg font-bold text-[#00FBFF] mt-0.5">
                {stats?.accuracy || 0}%
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
            <GraduationCap className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div>
              <h4 className="text-[10px] font-mono text-slate-500 uppercase">Equations Resolved</h4>
              <div className="text-lg font-bold text-white mt-0.5">
                {stats?.solved || 0} Solved
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
            <BrainCircuit className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <h4 className="text-[10px] font-mono text-slate-500 uppercase">AI Queries Logged</h4>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {stats?.asked || 0} Queries
              </div>
            </div>
          </div>

        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Daily Progress Chart (Left - 8 columns) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col min-h-[380px]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Solved Questions Index
            </h3>

            <div className="flex-1 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayWeekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FBFF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00FBFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontStyle="mono" tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} fontStyle="mono" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0a0e1a", borderColor: "rgba(0,251,255,0.2)", borderRadius: "12px" }}
                    labelStyle={{ color: "#fff", fontFamily: "monospace", fontSize: "10px" }}
                  />
                  <Area type="monotone" dataKey="solved" stroke="#00FBFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSolved)" name="Total Solved" />
                  <Area type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={1.5} fillOpacity={0} name="Correct Answers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Mastery Distribution (Right - 4 columns) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col min-h-[380px]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" /> Concept mastery margins
            </h3>

            <div className="flex-1 w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayTopics} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} fontStyle="mono" tickLine={false} domain={[0, 100]} />
                  <YAxis dataKey="topic" type="category" stroke="#64748b" fontSize={11} fontStyle="sans" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0e1a", borderColor: "rgba(168,85,247,0.2)", borderRadius: "12px" }}
                  />
                  <Bar dataKey="accuracy" fill="#9333ea" radius={[0, 6, 6, 0]} name="Accuracy %">
                    {displayTopics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#9333ea" : "#00FBFF"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Heatmap Grid Calendar */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" /> Daily study heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Telemetry grid showing consecutive daily activities logged in the past 30 days. Intensity correlates to solved equations.
          </p>

          <div className="flex flex-wrap gap-2 pt-4 justify-start">
            {heatmap.map((pt, idx) => (
              <div 
                key={idx}
                className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono select-none cursor-help transition-all ${getHeatmapColor(pt.count)}`}
                title={`${pt.date}: ${pt.count} activity cycles`}
              >
                <span className="text-[10px] font-bold">{new Date(pt.date).getDate()}</span>
                <span className="text-[7px] opacity-60 font-sans">{pt.count > 0 ? `x${pt.count}` : ""}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-950"></div>
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-cyan-950 border border-cyan-900"></div>
              <span>Calibration (&lt;3 solved)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-cyan-800 border border-cyan-700"></div>
              <span>Stable (&lt;6 solved)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-cyan-500 border border-cyan-400"></div>
              <span>Quantum Surge (6+ solved)</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
