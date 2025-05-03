
import { supabase } from './supabaseClient';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Cached menu items to prevent repeated fetches
let cachedMenuItems: MenuItem[] = [];

export const getMenuItems = async (): Promise<MenuItem[]> => {
  // Return cached items if available
  if (cachedMenuItems.length > 0) {
    return cachedMenuItems;
  }
  
  // Fetch menu items from Supabase
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching menu items:', error);
    // Return fallback data if fetch fails
    return [
      { id: 1, name: "Эспрессо", price: 120, category: "coffee" },
      { id: 2, name: "Американо", price: 150, category: "coffee" },
      { id: 3, name: "Капучино", price: 200, category: "coffee" },
      { id: 4, name: "Латте", price: 250, category: "coffee" },
      // Reduced fallback for the sake of example
    ];
  }
  
  // Cache the fetched data
  cachedMenuItems = data as MenuItem[];
  return cachedMenuItems;
};

// Function to refresh the cache (call this when menu items might have changed)
export const refreshMenuItems = () => {
  cachedMenuItems = [];
};
