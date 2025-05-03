
import { supabase } from './supabaseClient';
import { InventoryItem, Recipe, RecipeIngredient } from "@/types/inventory";

// Cached inventory items
let cachedInventoryItems: InventoryItem[] = [];

// Функция получения всех ингредиентов
export const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
  // Return cached items if available
  if (cachedInventoryItems.length > 0) {
    return cachedInventoryItems;
  }
  
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');
    
  if (error) {
    console.error('Error fetching inventory items:', error);
    // Return fallback data
    return [
      {
        id: 1,
        name: "Кофейные зерна",
        amount: 12,
        unit: "кг",
        status: "normal",
        minThreshold: 5,
        criticalThreshold: 2
      },
      // ... reduced fallback data
    ];
  }
  
  // Update status for all items
  const itemsWithStatus = data.map(item => updateItemStatus(item));
  
  // Cache the results
  cachedInventoryItems = itemsWithStatus;
  return itemsWithStatus;
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

// Функция для обновления количества ингредиента
export const updateInventoryItem = async (
  itemId: number,
  newAmount: number
): Promise<InventoryItem | undefined> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update({ amount: Math.max(0, newAmount) })
    .eq('id', itemId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating inventory item:', error);
    return undefined;
  }
  
  // Update the cached item
  const updatedItem = updateItemStatus(data);
  
  if (cachedInventoryItems.length > 0) {
    cachedInventoryItems = cachedInventoryItems.map(item => 
      item.id === itemId ? updatedItem : item
    );
  }
  
  return updatedItem;
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
