import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase URL and anon public key are stored in environment variables.
// Ensure these are defined in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or anon key is missing. Some features may not work.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
