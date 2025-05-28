import { getProducts } from '@/services/sqliteService';

export default async function handler(req, res) {
  try {
    // Пробуем получить продукты из SQLite
    const data = getProducts();
    res.status(200).json({
      success: true,
      message: 'Подключение к SQLite успешно',
      data
    });
  } catch (error) {
    console.error('Ошибка подключения к SQLite:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка подключения к SQLite',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
} 