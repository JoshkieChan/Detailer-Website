import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('ACTION REQUIRED: VITE_SUPABASE_URL is missing. If you are in production, set this in your Vercel Project Settings.');
}
if (!supabaseAnonKey) {
  console.warn('ACTION REQUIRED: VITE_SUPABASE_ANON_KEY is missing. If you are in production, set this in your Vercel Project Settings.');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase client: One or more environment variables are missing. Direct Supabase calls will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
