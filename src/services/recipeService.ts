
import { getProductsAsync } from './dbService';
import { Recipe } from "@/types/inventory";

// Cached recipes
let cachedRecipes: Recipe[] = [];

// Возвращает рецепт по ID продукта
export const getRecipeByProductId = async (productId: number): Promise<Recipe | undefined> => {
  const recipes = await getAllRecipes();
  return recipes.find(recipe => recipe.id === productId);
};

// Возвращает рецепт по названию продукта
export const getRecipeByProductName = async (productName: string): Promise<Recipe | undefined> => {
  const recipes = await getAllRecipes();
  return recipes.find(recipe => recipe.name === productName);
};

// Возвращает список всех рецептов
export const getAllRecipes = async (): Promise<Recipe[]> => {
  if (cachedRecipes.length > 0) {
    return cachedRecipes;
  }
  try {
    const data = await getProductsAsync();
    // Преобразуем Product[] в Recipe[]
    cachedRecipes = data.map(product => ({
      id: parseInt(product.id),
      name: product.name,
      category: product.category,
      ingredients: [] // Пустой массив ингредиентов, нужно будет настроить отдельно
    }));
    return cachedRecipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
};

// Function to refresh cache when needed
export const refreshRecipes = () => {
  cachedRecipes = [];
};
