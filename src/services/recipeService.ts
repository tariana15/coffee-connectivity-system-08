
import { Recipe } from "@/types/inventory";

// Обновленные рецепты для товаров меню на основе техкарты
const RECIPES: Recipe[] = [
  {
    id: 1,
    name: "Эспрессо",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.008 }, // 8 г кофейных зерен
      { inventoryItemId: 5, amount: 1 } // 1 стакан 250мл
    ]
  },
  {
    id: 2,
    name: "Американо",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 5, amount: 1 } // 1 стакан 250мл
    ]
  },
  {
    id: 3,
    name: "Капучино",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.008 }, // 8 г кофейных зерен
      { inventoryItemId: 2, amount: 0.18 }, // 180 мл молока
      { inventoryItemId: 5, amount: 1 } // 1 стакан 250мл
    ]
  },
  {
    id: 4,
    name: "Латте",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 2, amount: 0.25 }, // 250 мл молока
      { inventoryItemId: 6, amount: 1 } // 1 стакан 350мл
    ]
  },
  {
    id: 5,
    name: "Раф",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 7, amount: 0.2 }, // 200 мл сливок
      { inventoryItemId: 8, amount: 0.01 }, // 10 г ванильного сахара
      { inventoryItemId: 6, amount: 1 } // 1 стакан 350мл
    ]
  },
  {
    id: 6,
    name: "Флэт Уайт",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 2, amount: 0.12 }, // 120 мл молока
      { inventoryItemId: 5, amount: 1 } // 1 стакан 250мл
    ]
  },
  {
    id: 7,
    name: "Мокко",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 2, amount: 0.2 }, // 200 мл молока
      { inventoryItemId: 3, amount: 0.02 }, // 20 мл шоколадного сиропа
      { inventoryItemId: 6, amount: 1 } // 1 стакан 350мл
    ]
  },
  {
    id: 8,
    name: "Карамель Макиато",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 2, amount: 0.2 }, // 200 мл молока
      { inventoryItemId: 4, amount: 0.02 }, // 20 мл карамельного сиропа
      { inventoryItemId: 6, amount: 1 } // 1 стакан 350мл
    ]
  },
  {
    id: 9,
    name: "Круассан",
    category: "food",
    ingredients: [] // Для простоты не детализируем ингредиенты еды
  },
  {
    id: 10,
    name: "Сэндвич",
    category: "food",
    ingredients: []
  },
  {
    id: 11,
    name: "Маффин",
    category: "food",
    ingredients: []
  },
  {
    id: 12,
    name: "Чизкейк",
    category: "food",
    ingredients: []
  },
  {
    id: 13,
    name: "Печенье",
    category: "food",
    ingredients: []
  },
  {
    id: 14,
    name: "Донат",
    category: "food",
    ingredients: []
  }
];

// Возвращает рецепт по ID продукта
export const getRecipeByProductId = (productId: number): Recipe | undefined => {
  return RECIPES.find(recipe => recipe.id === productId);
};

// Возвращает рецепт по названию продукта
export const getRecipeByProductName = (productName: string): Recipe | undefined => {
  return RECIPES.find(recipe => recipe.name === productName);
};

// Возвращает список всех рецептов
export const getAllRecipes = (): Recipe[] => {
  return RECIPES;
};
