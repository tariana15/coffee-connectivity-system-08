
import { createClient } from '@supabase/supabase-js';

// Using environment variables or direct URL since this is a public URL
// Update this with your actual Supabase URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Using anon key which is safe for browser usage
// Update this with your actual anon key
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    // Test query to check connection
    const { data, error } = await supabase.from('menu_items').select('count');
    
    if (error) {
      console.error('Database connection error:', error);
      return { connected: false, error };
    }
    
    console.log('Successfully connected to Supabase database');
    return { connected: true, data };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error };
  }
};

// Helper function to get table data with error handling
export const fetchTableData = async (tableName: string, query = {}) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Exception fetching ${tableName}:`, error);
    return { data: null, error };
  }
};
