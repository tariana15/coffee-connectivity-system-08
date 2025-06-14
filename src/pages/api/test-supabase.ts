
import { getProductsAsync } from '@/services/dbService';

export default async function handler(req, res) {
  try {
    // Пробуем получить продукты из Supabase
    const data = await getProductsAsync();
    res.status(200).json({
      success: true,
      message: 'Подключение к Supabase успешно',
      data
    });
  } catch (error) {
    console.error('Ошибка подключения к Supabase:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка подключения к Supabase',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
}
