import { supabase } from '../lib/supabase';

export async function upsertUserProfile(userId: string, email: string | null): Promise<void> {
  try {
    await supabase.from('profiles').upsert({ id: userId, email }).single();
  } catch (e) {
    console.error('Failed to upsert profile:', e);
    throw e;
  }
}

export interface UserProfile {
  id: string;
  email: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  username: string | null;
  bio: string | null;
  selected_theme: string;
}

export interface LearningPreference {
  user_id: string;
  mode: 'simple' | 'detailed' | 'visual' | 'exam_focused';
}

/**
 * Get user profile details from Supabase 'profiles' table.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, avatar_url, banner_url, username, bio, selected_theme')
    .eq('id', userId)
    .single();

  if (error) {
    // If user profile does not exist yet (e.g. legacy user or first login trigger missed), create one
    if (error.code === 'PGRST116' || error.code === 'PGRST404') {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const defaultUsername = user.email ? user.email.split('@')[0] : `user_${userId.substring(0, 5)}`;
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.email,
            username: defaultUsername,
            selected_theme: 'neon-dark',
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newProfile;
      }
    }
    throw error;
  }

  return data;
}

/**
 * Check if a username is unique in the profiles table.
 */
export async function checkUsernameUnique(username: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.trim())
    .not('id', 'eq', userId);

  if (error) throw error;
  return data.length === 0;
}

/**
 * Update the user's username with uniqueness and length checks.
 */
export async function updateUsername(userId: string, username: string): Promise<void> {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    throw new Error('Username must be between 3 and 20 characters.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new Error('Username can only contain alphanumeric characters, underscores, and hyphens.');
  }

  // Basic check for offensive terms (can be extended)
  const forbidden = ['admin', 'root', 'moderator', 'mathverse', 'null', 'undefined', 'shit', 'fuck', 'bitch', 'asshole'];
  if (forbidden.some(word => trimmed.toLowerCase().includes(word))) {
    throw new Error('This username is not allowed.');
  }

  const isUnique = await checkUsernameUnique(trimmed, userId);
  if (!isUnique) {
    throw new Error('Username is already taken.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: trimmed })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Update the user's bio.
 */
export async function updateBio(userId: string, bio: string): Promise<void> {
  if (bio.length > 160) {
    throw new Error('Bio must be less than 160 characters.');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ bio })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Save theme preference.
 */
export async function saveThemePreference(userId: string, theme: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ selected_theme: theme })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Upload Avatar to 'avatars' storage bucket.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop();
  const filePath = `${userId}/profile.${extension}`;

  const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (updateErr) throw updateErr;

  return publicUrl;
}

/**
 * Upload Profile Banner to 'banners' storage bucket.
 */
export async function uploadProfileBanner(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop();
  const filePath = `${userId}/banner.${extension}`;

  const { error: uploadErr } = await supabase.storage.from('banners').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from('banners').getPublicUrl(filePath);
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ banner_url: publicUrl })
    .eq('id', userId);

  if (updateErr) throw updateErr;

  return publicUrl;
}

/**
 * Get AI learning preferences for user.
 */
export async function getLearningPreferences(userId: string): Promise<LearningPreference> {
  const { data, error } = await supabase
    .from('learning_preferences')
    .select('user_id, mode')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.code === 'PGRST404') {
      const { data: newPref, error: insertError } = await supabase
        .from('learning_preferences')
        .insert({ user_id: userId, mode: 'detailed' })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newPref;
    }
    throw error;
  }

  return data;
}

/**
 * Save AI learning mode preference.
 */
export async function saveLearningMode(userId: string, mode: LearningPreference['mode']): Promise<void> {
  const { error } = await supabase
    .from('learning_preferences')
    .upsert({ user_id: userId, mode })
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Apply selected learning mode instructions to Gemini prompt instructions.
 */
export function applyLearningModeToGeminiPrompt(prompt: string, mode: LearningPreference['mode']): string {
  let instruction = '';
  switch (mode) {
    case 'simple':
      instruction = `Provide a simple, beginner-friendly explanation. Avoid overly complex jargon and use analogies where possible.`;
      break;
    case 'visual':
      instruction = `Structure your explanation to highlight visual intuition. Provide ASCII art diagrams, structured conceptual maps, or step-by-step layout flowcharts.`;
      break;
    case 'exam_focused':
      instruction = `Provide a concise answer matching standard exam style. Emphasize important formulas, shortcuts, and common traps to avoid.`;
      break;
    case 'detailed':
    default:
      instruction = `Provide a deep conceptual explanation, starting from the theoretical insight, proving formulas where necessary, and highlighting step-by-step resolution steps.`;
      break;
  }

  return `${instruction}\n\n${prompt}`;
}
