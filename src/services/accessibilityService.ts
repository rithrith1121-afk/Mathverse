import { supabase } from '../lib/supabase';

/**
 * Types for accessibility preferences
 */
export interface AccessibilityPrefs {
  fontScale: number; // default 1
  highContrast: boolean;
  reducedMotion: boolean;
  selectedTheme?: string;
}

/**
 * Fetch accessibility preferences for a user.
 * Tries Supabase table `user_preferences`; falls back to localStorage.
 */
export async function getAccessibilityPrefs(userId: string | null): Promise<AccessibilityPrefs> {
  // Try Supabase if we have a userId
  if (userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('font_scale, high_contrast, reduced_motion, selected_theme')
      .eq('user_id', userId)
      .single();
    if (!error && data) {
      return {
        fontScale: data.font_scale ?? 1,
        highContrast: data.high_contrast ?? false,
        reducedMotion: data.reduced_motion ?? false,
        selectedTheme: data.selected_theme,
      };
    }
    // If table missing or error, fall through to localStorage
    console.warn('Failed to load preferences from Supabase, using localStorage', error);
  }

  // LocalStorage fallback
  const stored = localStorage.getItem('mathverse_accessibility');
  if (stored) {
    try {
      return JSON.parse(stored) as AccessibilityPrefs;
    } catch (_) {
      // ignore malformed JSON
    }
  }
  // defaults
  return {
    fontScale: 1,
    highContrast: false,
    reducedMotion: false,
  };
}

/**
 * Save accessibility preferences for a user.
 * Persists both to Supabase (if logged in) and localStorage.
 */
export async function saveAccessibilityPrefs(userId: string | null, prefs: AccessibilityPrefs): Promise<void> {
  // Save to Supabase if we have a user ID
  if (userId) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        font_scale: prefs.fontScale,
        high_contrast: prefs.highContrast,
        reduced_motion: prefs.reducedMotion,
        selected_theme: prefs.selectedTheme,
      });
    if (error) {
      console.error('Failed to upsert accessibility prefs:', error);
    }
  }
  // Always store locally for immediate UI response
  localStorage.setItem('mathverse_accessibility', JSON.stringify(prefs));
}

/**
 * Apply the given preferences to the document.
 * Sets CSS variables, adds/removes classes for high‑contrast and reduced‑motion.
 */
export function applyAccessibilityPrefs(prefs: AccessibilityPrefs): void {
  const root = document.documentElement;

  // Font scaling via CSS variable
  root.style.setProperty('--font-scale', prefs.fontScale.toString());

  // High contrast – toggle class on body
  if (prefs.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }

  // Reduced motion – toggle class on html
  if (prefs.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }
}
