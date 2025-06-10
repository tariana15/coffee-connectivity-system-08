// Сервис для работы с SQLiteStudio (ранее supabaseService)
import {
  getGoods,
  addGood,
  getProducts,
  addProduct,
  getSales,
  addSale,
  getCurrentShift,
  openShift,
  updateShiftStats,
  getCustomerByPhone,
  createOrGetCustomer,
  updateCustomerBonus,
  Good,
  Product,
  Sale,
  Shift,
  Customer
} from './sqliteService';

export type { Product, Sale, Customer, Good } from './sqliteService';

// Работа с товарами
export const getProductsAsync = async (): Promise<Good[]> => getGoods();
export const addProductAsync = async (product: Omit<Good, 'id' | 'created_at'>): Promise<Good> => addGood(product);

// Работа с техкартой
export const getRecipes = async (): Promise<Product[]> => getProducts();
export const addRecipe = async (recipe: Omit<Product, 'id'>): Promise<Product> => addProduct(recipe);

// Работа с продажами
export const getSalesAsync = async (shiftId: number): Promise<Sale[]> => getSales(shiftId);
export const addSaleAsync = async (sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> => addSale(sale);

// Работа со сменами
export const getCurrentShiftAsync = async (): Promise<Shift | null> => getCurrentShift() || null;
export const openShiftAsync = async (): Promise<Shift> => openShift();
export const updateShiftStatsAsync = async (
  shiftId: number,
  stats: {
    total_sales: number;
    transactions: number;
    coffee_count: number;
    food_count: number;
  }
): Promise<Shift> => updateShiftStats(shiftId, stats);

export { getCustomerByPhone, createOrGetCustomer, updateCustomerBonus };

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