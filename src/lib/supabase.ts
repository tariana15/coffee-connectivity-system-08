import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для таблиц
export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  created_at: string;
}

export interface Recipe {
  id: string;
  drink_type: string;
  drink_name: string;
  ingredients: string;
  preparation: string;
  price: number;
}

export interface Sale {
  id: string;
  shift_id: string;
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  payment_method: string;
  status: string;
  bonus_applied?: number;
  customer_phone?: string;
  bonus_earned?: number;
  created_at: string;
}

export interface Shift {
  id: string;
  is_open: boolean;
  opened_at: string;
  closed_at?: string;
  total_sales: number;
  transactions: number;
  coffee_count: number;
  food_count: number;
  created_at: string;
}