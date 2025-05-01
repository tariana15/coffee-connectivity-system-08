
import { useNotifications } from "@/contexts/NotificationContext";
import { InventoryItem, Recipe, RecipeIngredient } from "@/types/inventory";

// Demo inventory data - в реальном приложении будет загружаться из базы данных
let inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Кофейные зерна",
    amount: 12,
    unit: "кг",
    status: "normal",
    minThreshold: 5,
    criticalThreshold: 2
  },
  {
    id: 2,
    name: "Молоко",
    amount: 5,
    unit: "л",
    status: "low",
    minThreshold: 7,
    criticalThreshold: 3
  },
  {
    id: 3,
    name: "Шоколадный сироп",
    amount: 0.5,
    unit: "л",
    status: "critical",
    minThreshold: 1,
    criticalThreshold: 0.3
  },
  {
    id: 4,
    name: "Карамельный сироп",
    amount: 2,
    unit: "л",
    status: "normal",
    minThreshold: 1,
    criticalThreshold: 0.5
  },
  {
    id: 5,
    name: "Стаканы 250мл",
    amount: 350,
    unit: "шт",
    status: "normal",
    minThreshold: 200,
    criticalThreshold: 100
  },
  {
    id: 6,
    name: "Стаканы 350мл",
    amount: 150,
    unit: "шт",
    status: "low",
    minThreshold: 200,
    criticalThreshold: 100
  },
  {
    id: 7,
    name: "Сливки",
    amount: 3,
    unit: "л",
    status: "normal",
    minThreshold: 1.5,
    criticalThreshold: 0.5
  },
  {
    id: 8,
    name: "Ванильный сахар",
    amount: 0.8,
    unit: "кг",
    status: "normal",
    minThreshold: 0.5,
    criticalThreshold: 0.2
  }
];

// Функция получения всех ингредиентов
export const getAllInventoryItems = (): InventoryItem[] => {
  return inventoryItems;
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
export const updateInventoryItem = (
  itemId: number,
  newAmount: number
): InventoryItem | undefined => {
  const index = inventoryItems.findIndex((item) => item.id === itemId);
  
  if (index === -1) return undefined;
  
  // Обновляем количество и пересчитываем статус
  const updatedItem = updateItemStatus({
    ...inventoryItems[index],
    amount: Math.max(0, newAmount) // Не допускаем отрицательных значений
  });
  
  inventoryItems[index] = updatedItem;
  return updatedItem;
};

// Функция для вычитания ингредиентов из запаса при продаже
export const deductIngredientsForSale = (
  recipes: Recipe[],
  quantities: number[],
  addNotification: (notification: any) => void
): { success: boolean; updatedItems: InventoryItem[]; messages: string[] } => {
  const updated: InventoryItem[] = [];
  const messages: string[] = [];
  
  // Проходим по всем рецептам
  recipes.forEach((recipe, index) => {
    const quantity = quantities[index];
    if (!quantity) return;
    
    recipe.ingredients.forEach(ingredient => {
      const inventoryItem = inventoryItems.find(item => item.id === ingredient.inventoryItemId);
      if (!inventoryItem) {
        messages.push(`Ингредиент для ${recipe.name} не найден в базе`);
        return;
      }
      
      // Рассчитываем необходимое количество ингредиента
      const requiredAmount = ingredient.amount * quantity;
      
      // Вычитаем из запаса
      const newAmount = inventoryItem.amount - requiredAmount;
      const updatedItem = updateInventoryItem(inventoryItem.id, newAmount);
      
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
    });
  });
  
  return { success: true, updatedItems: updated, messages };
};
