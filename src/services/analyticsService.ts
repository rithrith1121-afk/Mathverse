import { supabase } from '../lib/supabase';

export interface SolvedQuestionInput {
  topic: string;
  difficulty: 'basic' | 'intermediate' | 'advanced' | 'expert' | 'applied' | 'quantum';
  isCorrect: boolean;
  timeSpentMs: number;
  sessionId?: string;
}

export interface WeeklyProgressPoint {
  day: string;
  solved: number;
  correct: number;
}

export interface TopicMastery {
  topic: string;
  solved: number;
  accuracy: number;
}

export interface HeatmapPoint {
  date: string;
  count: number;
}

export interface AIUsageStats {
  asked: number;
  solved: number;
  accuracy: number;
  streak: number;
  totalTimeSeconds: number;
}

/**
 * Start a learning session.
 */
export async function startLearningSession(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: userId,
      start_time: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * End an ongoing learning session.
 */
export async function endLearningSession(sessionId: string): Promise<void> {
  const endTime = new Date().toISOString();
  
  // Fetch session to compute duration
  const { data: session, error: fetchError } = await supabase
    .from('learning_sessions')
    .select('start_time')
    .eq('id', sessionId)
    .single();

  if (fetchError) throw fetchError;

  const durationSeconds = Math.round(
    (new Date(endTime).getTime() - new Date(session.start_time).getTime()) / 1000
  );

  const { error: updateError } = await supabase
    .from('learning_sessions')
    .update({
      end_time: endTime,
      duration_seconds: durationSeconds,
    })
    .eq('id', sessionId);

  if (updateError) throw updateError;
}

/**
 * Track a solved practice/practice question.
 */
export async function trackSolvedQuestion(
  userId: string,
  input: SolvedQuestionInput
): Promise<void> {
  const { error } = await supabase
    .from('solved_questions')
    .insert({
      user_id: userId,
      session_id: input.sessionId || null,
      topic: input.topic,
      difficulty: input.difficulty,
      is_correct: input.isCorrect,
      time_spent_ms: input.timeSpentMs,
    });

  if (error) throw error;

  // After tracking a question, update stats aggregate
  await updateAccuracyAndCount(userId);
}

/**
 * Update aggregate stats (accuracy, totals) inside user_statistics.
 */
export async function updateAccuracyAndCount(userId: string): Promise<void> {
  // Fetch count of questions
  const { data: questions, error } = await supabase
    .from('solved_questions')
    .select('is_correct')
    .eq('user_id', userId);

  if (error) throw error;

  const total = questions.length;
  const correct = questions.filter(q => q.is_correct).length;
  const accuracy = total > 0 ? Number(((correct / total) * 100).toFixed(2)) : 0;

  // Upsert statistics
  const { error: statsError } = await supabase
    .from('user_statistics')
    .upsert({
      user_id: userId,
      questions_solved: total,
      accuracy_percentage: accuracy,
      last_active: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (statsError) throw statsError;
}

/**
 * Get solved questions statistics by day for the past 7 days (Weekly Progress).
 */
export async function getWeeklyProgress(userId: string): Promise<WeeklyProgressPoint[]> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('solved_questions')
    .select('is_correct, created_at')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgo.toISOString());

  if (error) throw error;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const progressMap = new Map<string, { solved: number; correct: number }>();

  // Initialize past 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = days[d.getDay()];
    progressMap.set(dayLabel, { solved: 0, correct: 0 });
  }

  data.forEach((q) => {
    const dayLabel = days[new Date(q.created_at).getDay()];
    if (progressMap.has(dayLabel)) {
      const current = progressMap.get(dayLabel)!;
      current.solved += 1;
      if (q.is_correct) current.correct += 1;
      progressMap.set(dayLabel, current);
    }
  });

  return Array.from(progressMap.entries()).map(([day, stats]) => ({
    day,
    solved: stats.solved,
    correct: stats.correct,
  }));
}

/**
 * Get topics mastered and their individual accuracy.
 */
export async function getTopicsMastered(userId: string): Promise<TopicMastery[]> {
  const { data, error } = await supabase
    .from('solved_questions')
    .select('topic, is_correct')
    .eq('user_id', userId);

  if (error) throw error;

  const topicMap = new Map<string, { solved: number; correct: number }>();

  data.forEach((q) => {
    const topic = q.topic;
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { solved: 0, correct: 0 });
    }
    const stats = topicMap.get(topic)!;
    stats.solved += 1;
    if (q.is_correct) stats.correct += 1;
    topicMap.set(topic, stats);
  });

  return Array.from(topicMap.entries()).map(([topic, stats]) => ({
    topic,
    solved: stats.solved,
    accuracy: Math.round((stats.correct / stats.solved) * 100),
  }));
}

/**
 * Get daily study heatmap for activity grid tracking.
 */
export async function getDailyStudyHeatmap(userId: string): Promise<HeatmapPoint[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('solved_questions')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;

  const heatmapMap = new Map<string, number>();

  // Pre-populate past 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    heatmapMap.set(dateStr, 0);
  }

  data.forEach((q) => {
    const dateStr = new Date(q.created_at).toISOString().split('T')[0];
    if (heatmapMap.has(dateStr)) {
      heatmapMap.set(dateStr, heatmapMap.get(dateStr)! + 1);
    }
  });

  return Array.from(heatmapMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

/**
 * Retrieve current user statistics and AI solver usage records.
 */
export async function getAIUsageStats(userId: string): Promise<AIUsageStats> {
  const { data: stats, error } = await supabase
    .from('user_statistics')
    .select('streak_days, total_study_time_seconds, accuracy_percentage, questions_solved, ai_questions_asked')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        asked: 0,
        solved: 0,
        accuracy: 0,
        streak: 0,
        totalTimeSeconds: 0,
      };
    }
    throw error;
  }

  // Count AI history logs
  const { count: aiCount, error: aiError } = await supabase
    .from('ai_history')
    .select('*', { count: 'exact', head: true });

  const aiAsked = aiError ? stats.ai_questions_asked : (aiCount || 0);

  return {
    asked: aiAsked,
    solved: stats.questions_solved,
    accuracy: Number(stats.accuracy_percentage),
    streak: stats.streak_days,
    totalTimeSeconds: stats.total_study_time_seconds,
  };
}

/**
 * Increment the AI questions asked counter.
 */
export async function incrementAIQuestionsAsked(userId: string): Promise<void> {
  const { data: current, error: getErr } = await supabase
    .from('user_statistics')
    .select('ai_questions_asked')
    .eq('user_id', userId)
    .single();

  const currentCount = getErr ? 0 : (current?.ai_questions_asked || 0);

  const { error } = await supabase
    .from('user_statistics')
    .upsert({
      user_id: userId,
      ai_questions_asked: currentCount + 1,
      last_active: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) throw error;
}
