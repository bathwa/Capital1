import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Test if local Supabase is available
let useRealSupabase = true;
try {
  if (supabaseUrl.includes('localhost')) {
    // Check if local Supabase is running
    fetch(supabaseUrl + '/rest/v1/')
      .catch(() => {
        console.warn('Local Supabase not available, using mock service for development');
        useRealSupabase = false;
      });
  }
} catch (error) {
  console.warn('Using mock Supabase service for development');
  useRealSupabase = false;
}

const realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export either real Supabase or mock based on availability
export const supabase = useRealSupabase ? realSupabase : mockSupabase as any;