import { supabase, Product, Recipe, Sale, Shift } from "@/lib/supabase";

// Работа с товарами
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('goods')
    .select('id, name, category, quantity, unit, price, created_at')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('goods')
    .insert([product])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа с техкартой
export const getRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('id, drink_type, drink_name, ingredients, preparation, price')
    .order('id', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addRecipe = async (recipe: Omit<Recipe, 'id'>): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('products')
    .insert([recipe])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа с продажами
export const getSales = async (shiftId: string): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа со сменами
export const getCurrentShift = async (): Promise<Shift | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('is_open', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 - no rows returned
  return data;
};

export const openShift = async (): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .insert([{
      is_open: true,
      opened_at: new Date().toISOString(),
      shift_date:new Date().toISOString(),
      total_sales: 0,
      transactions: 0,
      coffee_count: 0,
      food_count: 0
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const closeShift = async (shiftId: string): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      is_open: false,
      closed_at: new Date().toISOString()
    })
    .eq('id', shiftId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateShiftStats = async (
  shiftId: string,
  stats: {
    total_sales: number;
    transactions: number;
    coffee_count: number;
    food_count: number;
  }
): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .update(stats)
    .eq('id', shiftId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 