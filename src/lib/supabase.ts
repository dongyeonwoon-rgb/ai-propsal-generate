import { createClient } from '@supabase/supabase-js';

// These should be configured in your .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
// Provide a placeholder to prevent @supabase/supabase-js from throwing an error during the Next.js build
// if the environment variables are not yet configured.
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
