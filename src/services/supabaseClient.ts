
import { createClient } from '@supabase/supabase-js';

// Используем переменные окружения из .env файла
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zqqmgaxtzlzmejwffsap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcW1nYXh0emx6bWVqd2Zmc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDM2MjQsImV4cCI6MjA2MDMxOTYyNH0.9bNBof6JVyR9z94e8zzaA4KdfggdyXZny9SfJ8LiNsI';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'coffee-app-auth',
    storage: window.localStorage,
  },
  realtime: {
    timeout: 30000,
  },
  global: {
    headers: {
      'X-Client-Info': 'coffee-app-mobile',
    },
  },
});

// Функция для проверки подключения к базе данных
export const checkDatabaseConnection = async () => {
  try {
    console.log('Проверяем подключение к Supabase...');
    
    // Тестовый запрос к базе данных
    const { data, error } = await supabase
      .from('products')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Ошибка подключения к базе данных:', error);
      return { connected: false, error };
    }
    
    console.log('Подключение к Supabase успешно установлено');
    return { connected: true, data };
  } catch (error) {
    console.error('Исключение при подключении к базе данных:', error);
    return { connected: false, error };
  }
};

// Функция для получения данных таблицы с обработкой ошибок
export const fetchTableData = async (tableName: string) => {
  try {
    console.log(`Загружаем данные из таблицы: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Ошибка загрузки ${tableName}:`, error);
      return { data: null, error };
    }
    
    console.log(`Успешно загружено ${data?.length || 0} записей из ${tableName}`);
    return { data, error: null };
  } catch (error) {
    console.error(`Исключение при загрузке ${tableName}:`, error);
    return { data: null, error };
  }
};
