import { getProducts } from './sqliteService';
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
  const data = getProducts();
  cachedRecipes = data as Recipe[];
  return cachedRecipes;
};

// Function to refresh cache when needed
export const refreshRecipes = () => {
  cachedRecipes = [];
};
