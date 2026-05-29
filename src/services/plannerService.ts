import { supabase } from '../lib/supabase';

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string;
  goal: string;
  completed: boolean;
  created_at: string;
}

export interface TimetableItem {
  id: string;
  user_id: string;
  subject: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface AIStudyPlan {
  id: string;
  user_id: string;
  title: string;
  plan_content: string;
  created_at: string;
}

/**
 * Create a new daily goal.
 */
export async function createDailyGoal(userId: string, date: string, goal: string): Promise<DailyGoal> {
  const { data, error } = await supabase
    .from('daily_goals')
    .insert({
      user_id: userId,
      date,
      goal,
      completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Toggle a daily goal's completion status.
 */
export async function updateGoalStatus(goalId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('daily_goals')
    .update({ completed })
    .eq('id', goalId);

  if (error) throw error;
}

/**
 * Fetch all daily goals for a given date.
 */
export async function getDailyGoals(userId: string, date: string): Promise<DailyGoal[]> {
  const { data, error } = await supabase
    .from('daily_goals')
    .select()
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new timetable item.
 */
export async function createTimetableItem(
  userId: string,
  subject: string,
  dayOfWeek: TimetableItem['day_of_week'],
  startTime: string,
  endTime: string
): Promise<TimetableItem> {
  const { data, error } = await supabase
    .from('timetable_items')
    .insert({
      user_id: userId,
      subject,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all timetable items.
 */
export async function getTimetableItems(userId: string): Promise<TimetableItem[]> {
  const { data, error } = await supabase
    .from('timetable_items')
    .select()
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Delete a timetable item.
 */
export async function deleteTimetableItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('timetable_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

/**
 * Save an AI generated study plan to history.
 */
export async function saveAIStudyPlan(userId: string, title: string, content: string): Promise<AIStudyPlan> {
  const { data, error } = await supabase
    .from('ai_study_plans')
    .insert({
      user_id: userId,
      title,
      plan_content: content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all AI study plans for a user.
 */
export async function getAIStudyPlans(userId: string): Promise<AIStudyPlan[]> {
  const { data, error } = await supabase
    .from('ai_study_plans')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Generate a revision plan using Gemini AI via the backend server proxy.
 */
export async function generateRevisionPlan(userId: string, weakTopics: string[], level: string): Promise<string> {
  try {
    const response = await fetch('/api/planner/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weakTopics, level }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate study plan from AI server');
    }

    const data = await response.json();
    if (!data.plan) {
      throw new Error('Empty response from AI planner service');
    }

    // Save the plan to history
    await saveAIStudyPlan(userId, `AI Study Plan: ${weakTopics.join(', ') || 'General'}`, data.plan);

    return data.plan;
  } catch (error: any) {
    console.error('AI Study Planner Error:', error);
    throw new Error(error.message || 'Error communicating with study planner generator.');
  }
}

/**
 * Get upcoming study tasks and goals summary (today's goals that are incomplete).
 */
export async function getUpcomingStudyTasks(userId: string): Promise<DailyGoal[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_goals')
    .select()
    .eq('user_id', userId)
    .eq('date', todayStr)
    .eq('completed', false)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
