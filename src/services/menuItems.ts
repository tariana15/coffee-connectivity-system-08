
import { getProductsAsync } from './dbService';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Cached menu items to prevent repeated fetches
let cachedMenuItems: MenuItem[] = [];

export const getMenuItems = async (): Promise<MenuItem[]> => {
  if (cachedMenuItems.length > 0) {
   return cachedMenuItems;
  }
  try {
    const data = await getProductsAsync();
    // Преобразуем Product[] в MenuItem[]
    cachedMenuItems = data.map(product => ({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      category: product.category
    }));
    return cachedMenuItems;
  } catch (error) {
    console.error('Exception fetching menu items:', error);
    return getFallbackMenuItems();
  }
};

const getFallbackMenuItems = (): MenuItem[] => {
  return [];
};

export const refreshMenuItems = () => {
  cachedMenuItems = [];
};
