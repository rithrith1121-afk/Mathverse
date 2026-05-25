/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Supabase URL missing. Check your .env configuration.');
}
if (!supabaseAnonKey) {
  console.error('Supabase ANON key missing. Check your .env configuration.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
