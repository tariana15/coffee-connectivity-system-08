import { getProducts } from './sqliteService';

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
    const data = getProducts();
    cachedMenuItems = data as MenuItem[];
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
