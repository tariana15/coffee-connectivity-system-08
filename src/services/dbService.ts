import { supabase } from './supabaseClient';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  created_at?: string;
}

export interface Sale {
  id: string;
  shift_id: string;
  items: any[];
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  customer_phone?: string;
  bonus_applied?: number;
  bonus_earned?: number;
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

export interface Customer {
  id: string;
  phone: string;
  bonus_balance: number;
  created_at: string;
}

// Работа с товарами
export const getProductsAsync = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const addProductAsync = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа с продажами
export const getSalesAsync = async (shiftId: string): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addSaleAsync = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа со сменами
export const getCurrentShiftAsync = async (): Promise<Shift | null> => {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('is_open', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const openShiftAsync = async (): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .insert([{
      is_open: true,
      opened_at: new Date().toISOString(),
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

export const closeShiftAsync = async (shiftId: string): Promise<Shift> => {
  // Получаем все продажи по смене
  const sales = await getSalesAsync(shiftId);
  
  // Считаем итоговые значения
  const total_sales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const transactions = sales.length;
  
  let coffee_count = 0;
  let food_count = 0;
  sales.forEach(sale => {
    if (Array.isArray(sale.items)) {
      coffee_count += sale.items.filter((item: any) => item.category === 'coffee').length;
      food_count += sale.items.filter((item: any) => item.category === 'food').length;
    }
  });

  // Обновляем смену и закрываем её
  const { data, error } = await supabase
    .from('shifts')
    .update({
      is_open: false,
      closed_at: new Date().toISOString(),
      total_sales,
      transactions,
      coffee_count,
      food_count
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) throw error;

  // Сохраняем отчёт в базу данных
  const report = `Отчёт по смене\n\nВыручка: ${total_sales} ₽\nТранзакций: ${transactions}\nПродано кофе: ${coffee_count}\nПродано еды: ${food_count}`;
  
  await supabase
    .from('shift_reports')
    .insert([{
      shift_id: shiftId,
      report_text: report,
      created_at: new Date().toISOString()
    }]);

  return data;
};

export const updateShiftStatsAsync = async (
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

// Работа с клиентами
export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const createOrGetCustomer = async (phone: string): Promise<Customer> => {
  let customer = await getCustomerByPhone(phone);
  
  if (!customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ phone, bonus_balance: 0 }])
      .select()
      .single();
    
    if (error) throw error;
    customer = data;
  }
  
  return customer;
};

export const updateCustomerBonus = async (phone: string, delta: number): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update({ bonus_balance: supabase.raw(`bonus_balance + ${delta}`) })
    .eq('phone', phone)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Работа с зарплатой сотрудников
export const saveEmployeeSalary = async (employeeData: {
  employee_name: string;
  work_date: string;
  revenue: number;
  hours_worked: number;
  shift_type: 'full' | 'half';
  calculated_salary: number;
}) => {
  const { data, error } = await supabase
    .from('employee_salaries')
    .upsert([employeeData], { 
      onConflict: 'employee_name,work_date' 
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getEmployeeSalaries = async (month?: string, year?: string) => {
  let query = supabase
    .from('employee_salaries')
    .select('*')
    .order('work_date', { ascending: false });
  
  if (month && year) {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    query = query.gte('work_date', startDate).lte('work_date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
