import { createClient } from '@supabase/supabase-js';

// These values are taken from migration/env.md and are safe to expose on the client-side.
const supabaseUrl = 'https://aufuafugpkkafayhtxzf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1ZnVhZnVncGtrYWZheWh0eHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTcxMTEsImV4cCI6MjA3MDY3MzExMX0.8-ohIoZ2MkHjUcI26d3HZcLgdZFEaU9dpazLnj2xU40';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Check services/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
