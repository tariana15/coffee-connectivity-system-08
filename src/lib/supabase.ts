import { createClient } from '@supabase/supabase-js';

const supabaseUrl ='https://zqqmgaxtzlzmejwffsap.supabase.co';
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcW1nYXh0emx6bWVqd2Zmc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDM2MjQsImV4cCI6MjA2MDMxOTYyNH0.9bNBof6JVyR9z94e8zzaA4KdfggdyXZny9SfJ8LiNsI';

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