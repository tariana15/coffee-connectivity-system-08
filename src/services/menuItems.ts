
import { supabase, fetchTableData } from './supabaseClient';

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
  
  try {
    // Fetch menu items from Supabase using the helper function
    const { data, error } = await fetchTableData('menu_items');
    
    if (error || !data) {
      console.warn('Error fetching menu items, using fallback data');
      return getFallbackMenuItems();
    }
    
    // Cache the fetched data
    cachedMenuItems = data as MenuItem[];
    return cachedMenuItems;
  } catch (error) {
    console.error('Exception fetching menu items:', error);
    return getFallbackMenuItems();
  }
};

// Function to provide fallback menu items when database connection fails
const getFallbackMenuItems = (): MenuItem[] => {
  return [
    { id: 1, name: "Эспрессо", price: 120, category: "coffee" },
    { id: 2, name: "Американо", price: 150, category: "coffee" },
    { id: 3, name: "Капучино", price: 200, category: "coffee" },
    { id: 4, name: "Латте", price: 250, category: "coffee" },
    { id: 5, name: "Флэт Уайт", price: 240, category: "coffee" },
    { id: 6, name: "Раф", price: 270, category: "coffee" },
    { id: 7, name: "Круассан", price: 180, category: "food" },
    { id: 8, name: "Печенье", price: 100, category: "food" }
  ];
};

// Function to refresh the cache (call this when menu items might have changed)
export const refreshMenuItems = () => {
  cachedMenuItems = [];
};

// Function to add a new menu item
export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([item])
    .select();
  
  if (error) {
    console.error('Error adding menu item:', error);
    return null;
  }
  
  // Refresh cache
  refreshMenuItems();
  return data?.[0] as MenuItem;
};

// Function to update an existing menu item
export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<boolean> => {
  const { error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating menu item:', error);
    return false;
  }
  
  // Refresh cache
  refreshMenuItems();
  return true;
};

// Function to delete a menu item
export const deleteMenuItem = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }
  
  // Refresh cache
  refreshMenuItems();
  return true;
};
