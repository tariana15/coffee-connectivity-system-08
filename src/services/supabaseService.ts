
// This file is now deprecated since we're using direct Supabase integration
// All functionality has been moved to dbService.ts

export type { Product, Sale } from './dbService';

// Re-export all functions from dbService for backward compatibility
export {
  getProductsAsync as getProducts,
  addProductAsync as addProduct,
  getSalesAsync as getSales,
  addSaleAsync as addSale,
  getCurrentShiftAsync as getCurrentShift,
  openShiftAsync as openShift,
  closeShiftAsync as closeShift,
  updateShiftStatsAsync as updateShiftStats
} from './dbService';
