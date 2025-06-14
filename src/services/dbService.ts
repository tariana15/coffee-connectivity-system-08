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
  try {
    console.log('Загружаем продукты из базы данных...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Ошибка при загрузке продуктов:', error);
      throw new Error(`Не удалось загрузить продукты: ${error.message}`);
    }
    
    console.log(`Загружено ${data?.length || 0} продуктов`);
    return data || [];
  } catch (error) {
    console.error('Исключение при загрузке продуктов:', error);
    throw error;
  }
};

export const addProductAsync = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  try {
    console.log('Добавляем новый продукт:', product.name);
    
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      console.error('Ошибка при добавлении продукта:', error);
      throw new Error(`Не удалось добавить продукт: ${error.message}`);
    }
    
    console.log('Продукт успешно добавлен:', data.name);
    return data;
  } catch (error) {
    console.error('Исключение при добавлении продукта:', error);
    throw error;
  }
};

// Работа с продажами
export const getSalesAsync = async (shiftId: string): Promise<Sale[]> => {
  try {
    console.log('Загружаем продажи для смены:', shiftId);
    
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка при загрузке продаж:', error);
      throw new Error(`Не удалось загрузить продажи: ${error.message}`);
    }
    
    console.log(`Загружено ${data?.length || 0} продаж для смены`);
    return data || [];
  } catch (error) {
    console.error('Исключение при загрузке продаж:', error);
    throw error;
  }
};

export const addSaleAsync = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => {
  try {
    console.log('Добавляем новую продажу, сумма:', sale.total);
    
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();
    
    if (error) {
      console.error('Ошибка при добавлении продажи:', error);
      throw new Error(`Не удалось сохранить продажу: ${error.message}`);
    }
    
    console.log('Продажа успешно сохранена');
    return data;
  } catch (error) {
    console.error('Исключение при добавлении продажи:', error);
    throw error;
  }
};

// Работа со сменами
export const getCurrentShiftAsync = async (): Promise<Shift | null> => {
  try {
    console.log('Проверяем текущую открытую смену...');
    
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('is_open', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Ошибка при получении текущей смены:', error);
      throw new Error(`Не удалось получить информацию о смене: ${error.message}`);
    }
    
    if (data) {
      console.log('Найдена открытая смена:', data.id);
    } else {
      console.log('Открытых смен не найдено');
    }
    
    return data || null;
  } catch (error) {
    console.error('Исключение при получении текущей смены:', error);
    throw error;
  }
};

export const openShiftAsync = async (): Promise<Shift> => {
  try {
    console.log('Открываем новую смену...');
    
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
    
    if (error) {
      console.error('Ошибка при открытии смены:', error);
      throw new Error(`Не удалось открыть смену: ${error.message}`);
    }
    
    console.log('Смена успешно открыта:', data.id);
    return data;
  } catch (error) {
    console.error('Исключение при открытии смены:', error);
    throw error;
  }
};

export const closeShiftAsync = async (shiftId: string): Promise<Shift> => {
  try {
    console.log('Закрываем смену:', shiftId);
    
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

    if (error) {
      console.error('Ошибка при закрытии смены:', error);
      throw new Error(`Не удалось закрыть смену: ${error.message}`);
    }

    console.log('Смена успешно закрыта');
    return data;
  } catch (error) {
    console.error('Исключение при закрытии смены:', error);
    throw error;
  }
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
  try {
    console.log('Обновляем статистику смены:', shiftId);
    
    const { data, error } = await supabase
      .from('shifts')
      .update(stats)
      .eq('id', shiftId)
      .select()
      .single();
    
    if (error) {
      console.error('Ошибка при обновлении статистики смены:', error);
      throw new Error(`Не удалось обновить статистику смены: ${error.message}`);
    }
    
    console.log('Статистика смены обновлена');
    return data;
  } catch (error) {
    console.error('Исключение при обновлении статистики смены:', error);
    throw error;
  }
};

// Работа с клиентами
export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    console.log('Ищем клиента по номеру телефона:', phone);
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Ошибка при поиске клиента:', error);
      throw new Error(`Не удалось найти клиента: ${error.message}`);
    }
    
    if (data) {
      console.log('Клиент найден, баланс бонусов:', data.bonus_balance);
    } else {
      console.log('Клиент не найден');
    }
    
    return data || null;
  } catch (error) {
    console.error('Исключение при поиске клиента:', error);
    throw error;
  }
};

export const createOrGetCustomer = async (phone: string): Promise<Customer> => {
  try {
    let customer = await getCustomerByPhone(phone);
    
    if (!customer) {
      console.log('Создаем нового клиента:', phone);
      
      const { data, error } = await supabase
        .from('customers')
        .insert([{ phone, bonus_balance: 0 }])
        .select()
        .single();
      
      if (error) {
        console.error('Ошибка при создании клиента:', error);
        throw new Error(`Не удалось создать клиента: ${error.message}`);
      }
      
      customer = data;
      console.log('Новый клиент создан');
    }
    
    return customer;
  } catch (error) {
    console.error('Исключение при создании/получении клиента:', error);
    throw error;
  }
};

export const updateCustomerBonus = async (phone: string, delta: number): Promise<Customer> => {
  try {
    console.log('Обновляем бонусы клиента:', phone, 'на', delta);
    
    // Сначала получаем текущего клиента
    const customer = await getCustomerByPhone(phone);
    if (!customer) throw new Error('Клиент не найден');
    
    // Рассчитываем новый баланс бонусов
    const newBalance = Math.max(0, customer.bonus_balance + delta);
    
    // Обновляем баланс
    const { data, error } = await supabase
      .from('customers')
      .update({ bonus_balance: newBalance })
      .eq('phone', phone)
      .select()
      .single();
    
    if (error) {
      console.error('Ошибка при обновлении бонусов клиента:', error);
      throw new Error(`Не удалось обновить бонусы: ${error.message}`);
    }
    
    console.log('Бонусы клиента обновлены, новый баланс:', newBalance);
    return data;
  } catch (error) {
    console.error('Исключение при обновлении бонусов клиента:', error);
    throw error;
  }
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
