
import { Recipe } from "@/types/inventory";

// Здесь будут храниться рецепты для каждого товара меню
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
    name: "Моккачино",
    category: "coffee",
    ingredients: [
      { inventoryItemId: 1, amount: 0.016 }, // 16 г кофейных зерен
      { inventoryItemId: 2, amount: 0.2 }, // 200 мл молока
      { inventoryItemId: 3, amount: 0.02 }, // 20 мл шоколадного сиропа
      { inventoryItemId: 6, amount: 1 } // 1 стакан 350мл
    ]
  },
  {
    id: 6,
    name: "Круассан",
    category: "food",
    ingredients: [] // Для простоты не детализируем ингредиенты еды
  },
  {
    id: 7,
    name: "Сэндвич",
    category: "food",
    ingredients: []
  },
  {
    id: 8,
    name: "Маффин",
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
