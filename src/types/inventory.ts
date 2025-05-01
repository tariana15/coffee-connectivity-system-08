
export interface InventoryItem {
  id: number;
  name: string;
  amount: number;
  unit: string;
  status: "normal" | "low" | "critical";
  minThreshold?: number; // Минимальный порог для предупреждения
  criticalThreshold?: number; // Критический порог для уведомления
}

export interface RecipeIngredient {
  inventoryItemId: number;
  amount: number; // Количество ингредиента в рецепте
}

export interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface SaleRecord {
  id: string;
  items: OrderItem[];
  total: number;
  timestamp: Date;
  bonusApplied?: number;
  customerPhone?: string;
  bonusEarned?: number;
  inventoryUpdated?: boolean;
  fiscalData?: {
    fiscalSign: string;
    fiscalDocumentNumber: string;
    fiscalDriveNumber: string;
  };
}

export interface ShiftStats {
  coffeeCount: number;
  foodCount: number;
  totalSales: number;
  transactions: number;
}
