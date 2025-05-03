
import { createClient } from '@supabase/supabase-js';

// Using environment variables or direct URL since this is a public URL
const supabaseUrl = 'https://zqqmgaxtzlzmejwffsap.supabase.co';
// Using the correct anon key, which is safe for browser usage
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcW1nYXh0emx6bWVqd2Zmc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1MzQzMTEsImV4cCI6MjAzMzExMDMxMX0.Nk3ryUBo5FD1Ygmsq8hZy5CYozL2QOBJ7i-cYD6BIWU';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    // Test query to check connection
    const { data, error } = await supabase.from('menu_items').select('count');
    if (error) throw error;
    return { connected: true };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error };
  }
};
