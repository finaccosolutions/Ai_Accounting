import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variable status for debugging
console.log('Environment variables check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

// Use fallback values to prevent crashing
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Please check your .env file.');
  console.warn('Expected variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test connection only if we have real credentials
if (supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  });
} else {
  console.log('Skipping Supabase connection test due to missing credentials');
}