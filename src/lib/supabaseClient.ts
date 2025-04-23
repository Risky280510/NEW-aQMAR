import { createClient } from "@supabase/supabase-js";

// Get from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key not found in environment variables. Make sure your .env file is correctly set up.",
  );
}

console.log("Initializing Supabase client with URL:", supabaseUrl);
// Don't log the full key for security, just check if it exists
console.log("Anon key available:", !!supabaseAnonKey);

// Create and export Supabase client instance with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
});
