import {
  getGoods,
  addGood,
  getProducts as getProductsSqlite,
  addProduct as addProductSqlite,
  getSales as getSalesSqlite,
  addSale as addSaleSqlite,
  getCurrentShift as getCurrentShiftSqlite,
  openShift as openShiftSqlite,
  updateShiftStats as updateShiftStatsSqlite,
  Good,
  Product,
  Sale,
  Shift
} from './sqliteService';

export type { Product, Sale } from './sqliteService';

// Работа с товарами
export const getProducts = async (): Promise<Good[]> => {
  return getGoods();
};

export const addProduct = async (product: Omit<Good, 'id' | 'created_at'>): Promise<Good> => {
  return addGood(product);
};

// Работа с техкартой
export const getRecipes = async (): Promise<Product[]> => {
  return getProductsSqlite();
};

export const addRecipe = async (recipe: Omit<Product, 'id'>): Promise<Product> => {
  return addProductSqlite(recipe);
};

// Работа с продажами
export const getSales = async (shiftId: number): Promise<Sale[]> => {
  return getSalesSqlite(shiftId);
};

export const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => {
  return addSaleSqlite(sale);
};

// Работа со сменами
export const getCurrentShift = async (): Promise<Shift | null> => {
  return getCurrentShiftSqlite() || null;
};

export const openShift = async (): Promise<Shift> => {
  return openShiftSqlite();
};

export const closeShift = async (shiftId: number, user?: any): Promise<Shift> => {
  // Получаем все продажи по смене
  const sales = getSalesSqlite(shiftId);

  // Считаем итоговые значения
  const total_sales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const transactions = sales.length;
  // Для coffee_count и food_count нужно парсить sale.items (JSON строка)
  let coffee_count = 0;
  let food_count = 0;
  sales.forEach(sale => {
    try {
      const items = JSON.parse(sale.items);
      coffee_count += items.filter((item: any) => item.category === 'coffee').length;
      food_count += items.filter((item: any) => item.category === 'food').length;
    } catch (e) {}
  });

  // Формируем текст отчёта
  const report = `Отчёт по смене\n\nВыручка: ${total_sales} ₽\nТранзакций: ${transactions}\nПродано кофе: ${coffee_count}\nПродано еды: ${food_count}`;

  // Обновляем смену итогами
  const updatedShift = updateShiftStatsSqlite(shiftId, {
    total_sales,
    transactions,
    coffee_count,
    food_count
  });

  // Обнуляем статистику продаж (если используется localStorage)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('salesRecords');
    localStorage.removeItem('shiftStatistics');
  }

  // Отправляем отчёт в чат
  if (user) {
    sendReportToChat(report, user);
  }

  return updatedShift;
};

export const updateShiftStats = async (
  shiftId: number,
  stats: {
    total_sales: number;
    transactions: number;
    coffee_count: number;
    food_count: number;
  }
): Promise<Shift> => {
  return updateShiftStatsSqlite(shiftId, stats);
};

// Импорт для работы с чатом
const sendReportToChat = (report: string, user: any) => {
  const message = {
    id: Date.now().toString(),
    userId: 'system',
    userName: 'Система',
    content: report,
    timestamp: Date.now(),
    coffeeShopName: user?.coffeeShopName || 'default'
  };
  const savedMessages = localStorage.getItem('chatMessages');
  let allMessages = savedMessages ? JSON.parse(savedMessages) : [];
  allMessages = [...allMessages, message];
  localStorage.setItem('chatMessages', JSON.stringify(allMessages));
}; 