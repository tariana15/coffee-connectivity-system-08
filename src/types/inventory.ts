
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
