
import { checkDatabaseConnection } from './supabaseClient';
import { getProductsAsync, getCurrentShiftAsync } from './dbService';

export const initializeApp = async () => {
  console.log('Инициализация приложения...');
  
  try {
    // Проверяем подключение к базе данных
    const connectionResult = await checkDatabaseConnection();
    
    if (!connectionResult.connected) {
      throw new Error('Не удалось подключиться к базе данных');
    }
    
    console.log('Подключение к базе данных установлено');
    
    // Проверяем доступность основных данных
    try {
      await getProductsAsync();
      console.log('Продукты загружены');
    } catch (error) {
      console.warn('Не удалось загрузить продукты при инициализации:', error);
    }
    
    try {
      await getCurrentShiftAsync();
      console.log('Информация о смене получена');
    } catch (error) {
      console.warn('Не удалось получить информацию о смене при инициализации:', error);
    }
    
    console.log('Приложение успешно инициализировано');
    return { success: true };
    
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
    };
  }
};
