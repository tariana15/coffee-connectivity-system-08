import { getGoods } from './sqliteService';
import { InventoryItem, Recipe, RecipeIngredient } from "@/types/inventory";
import Database from 'better-sqlite3';
import { DB_PATH } from './dbPath';
const db = new Database(DB_PATH);

// Cached inventory items
let cachedInventoryItems: InventoryItem[] = [];

// Функция получения всех ингредиентов
export const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
  if (cachedInventoryItems.length > 0) {
    return cachedInventoryItems;
  }
  const data = getGoods();
  // Преобразуем Good[] в InventoryItem[]
  cachedInventoryItems = data.map(good => ({
    ...good,
    amount: good.quantity, // предполагаем, что quantity = amount
    status: 'normal', // по умолчанию
    minThreshold: 0, // если нужно, задайте реальные значения
    criticalThreshold: 0 // если нужно, задайте реальные значения
  }));
  return cachedInventoryItems;
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

// Функция для обновления количества ингредиента (SQLite)
export const updateInventoryItem = async (
  itemId: number,
  newAmount: number
): Promise<InventoryItem | undefined> => {
  try {
    db.prepare('UPDATE goods SET quantity = ? WHERE id = ?').run(Math.max(0, newAmount), itemId);
    const updated = db.prepare('SELECT * FROM goods WHERE id = ?').get(itemId);
    const updatedItem = updateItemStatus(updated as InventoryItem);
    if (cachedInventoryItems.length > 0) {
      cachedInventoryItems = cachedInventoryItems.map(item =>
        item.id === itemId ? updatedItem : item
      );
    }
    return updatedItem;
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
