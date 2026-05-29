import { supabase } from '../lib/supabase';

/**
 * Friendships
 */
export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

/** Get list of accepted friends for a user */
export async function getFriends(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');
  if (error) throw error;
  return data as Friendship[];
}

/** Get pending incoming friend requests */
export async function getFriendRequests(userId: string): Promise<Friendship[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .eq('friend_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return data as Friendship[];
}

/** Send a friend request */
export async function sendFriendRequest(userId: string, targetUserId: string): Promise<void> {
  const { error } = await supabase.from('friendships').insert({
    user_id: userId,
    friend_id: targetUserId,
    status: 'pending'
  });
  if (error) throw error;
}

/** Respond to a friend request */
export async function respondFriendRequest(requestId: string, accept: boolean): Promise<void> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', requestId);
  if (error) throw error;
}

/**
 * Classrooms
 */
export interface Classroom {
  class_id: string;
  owner_id: string;
  name: string;
  description: string;
  created_at: string;
}

/** Get list of all public classrooms */
export async function getClassrooms(): Promise<Classroom[]> {
  const { data, error } = await supabase.from('classrooms').select('*');
  if (error) throw error;
  return data as Classroom[];
}

/** Create a new classroom */
export async function createClassroom(
  ownerId: string,
  name: string,
  description: string
): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .insert({ owner_id: ownerId, name, description })
    .single();
  if (error) throw error;
  return data as Classroom;
}

/** Join a classroom */
export async function joinClassroom(classId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('classroom_members').insert({
    class_id: classId,
    user_id: userId,
    role: 'member'
  });
  if (error) throw error;
}

/** Get members of a classroom */
export async function getClassroomMembers(classId: string) {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('user_id, role')
    .eq('class_id', classId);
  if (error) throw error;
  return data;
}

/**
 * Shared Solutions
 */
export interface SharedSolution {
  solution_id: string;
  user_id: string;
  question_id: string;
  content: string;
  visibility: 'public' | 'classroom';
  created_at: string;
}

export async function shareSolution(solution: Omit<SharedSolution, 'solution_id' | 'created_at'>): Promise<SharedSolution> {
  const { data, error } = await supabase.from('shared_solutions').insert(solution).single();
  if (error) throw error;
  return data as SharedSolution;
}

/**
 * Reporting
 */
export interface Report {
  report_id: string;
  reporter_id: string;
  content_type: 'user' | 'solution' | 'classroom';
  content_id: string;
  reason: string;
  created_at: string;
}

export async function submitReport(report: Omit<Report, 'report_id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('reports').insert(report);
  if (error) throw error;
}
