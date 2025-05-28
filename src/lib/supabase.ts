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