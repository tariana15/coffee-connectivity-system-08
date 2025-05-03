
import { createClient } from '@supabase/supabase-js';

// Using environment variables or direct URL since this is a public URL
const supabaseUrl = 'https://zqqmgaxtzlzmejwffsap.supabase.co';
// The anon key is safe to use in browser code (it's a public key)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcW1nYXh0emx6bWVqd2Zmc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1MzQzMTEsImV4cCI6MjAzMzExMDMxMX0.Nk3ryUBo5FD1Ygmsq8hZy5CYozL2QOBJ7i-cYD6BIWU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
