
import { getProductsAsync } from './dbService';
import { InventoryItem, Recipe, RecipeIngredient } from "@/types/inventory";

// Cached inventory items
let cachedInventoryItems: InventoryItem[] = [];

// Функция получения всех ингредиентов из Supabase
export const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
  if (cachedInventoryItems.length > 0) {
    return cachedInventoryItems;
  }
  try {
    const data = await getProductsAsync();
    // Преобразуем Product[] в InventoryItem[]
    cachedInventoryItems = data.map(product => ({
      id: parseInt(product.id),
      name: product.name,
      amount: 100, // Значение по умолчанию
      unit: 'шт',
      status: 'normal' as const,
      minThreshold: 10,
      criticalThreshold: 5
    }));
    return cachedInventoryItems;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
};

// Функция обновления статуса ингредиента на основе его количества
export const updateItemStatus = (item: InventoryItem): InventoryItem => {
  if (item.criticalThreshold && item.amount <= item.criticalThreshold) {
    return { ...item, status: "critical" };
  } else if (item.minThreshold && item.amount <= item.minThreshold) {
    return { ...item, status: "low" };
  } else {
    return { ...item, status: "normal" };
  }
};

// Функция для обновления количества ингредиента (заглушка для Supabase)
export const updateInventoryItem = async (
  itemId: number,
  newAmount: number
): Promise<InventoryItem | undefined> => {
  try {
    // TODO: Реализовать обновление в Supabase когда будет таблица inventory
    console.log(`Updating inventory item ${itemId} to amount ${newAmount}`);
    
    if (cachedInventoryItems.length > 0) {
      const itemIndex = cachedInventoryItems.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        cachedInventoryItems[itemIndex] = {
          ...cachedInventoryItems[itemIndex],
          amount: Math.max(0, newAmount)
        };
        return updateItemStatus(cachedInventoryItems[itemIndex]);
      }
    }
    return undefined;
  } catch (error) {
    console.error('Ошибка обновления ингредиента:', error);
    return undefined;
  }
};

// Функция для вычитания ингредиентов из запаса при продаже
export const deductIngredientsForSale = async (
  recipes: Recipe[],
  quantities: number[],
  addNotification: (notification: any) => void
): Promise<{ success: boolean; updatedItems: InventoryItem[]; messages: string[] }> => {
  const updated: InventoryItem[] = [];
  const messages: string[] = [];
  
  // Get the latest inventory data
  const inventoryItems = await getAllInventoryItems();
  
  // Проходим по всем рецептам
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const quantity = quantities[i] || 0;
    
    if (!quantity) continue;
    
    for (const ingredient of recipe.ingredients) {
      const inventoryItem = inventoryItems.find(item => item.id === ingredient.inventoryItemId);
      
      if (!inventoryItem) {
        messages.push(`Ингредиент для ${recipe.name} не найден в базе`);
        continue;
      }
      
      // Рассчитываем необходимое количество ингредиента
      const requiredAmount = ingredient.amount * quantity;
      
      // Вычитаем из запаса
      const newAmount = inventoryItem.amount - requiredAmount;
      const updatedItem = await updateInventoryItem(inventoryItem.id, newAmount);
      
      if (updatedItem) {
        updated.push(updatedItem);
        
        // Проверяем необходимость уведомлений
        if (updatedItem.status === "critical") {
          addNotification({
            title: "Критический запас ингредиента",
            message: `${updatedItem.name}: осталось ${updatedItem.amount} ${updatedItem.unit}`,
            type: "error"
          });
          messages.push(`Критически низкий запас: ${updatedItem.name}`);
        } else if (updatedItem.status === "low") {
          addNotification({
            title: "Низкий запас ингредиента",
            message: `${updatedItem.name}: осталось ${updatedItem.amount} ${updatedItem.unit}`,
            type: "warning"
          });
          messages.push(`Низкий запас: ${updatedItem.name}`);
        }
      }
    }
  }
  
  return { success: true, updatedItems: updated, messages };
};
