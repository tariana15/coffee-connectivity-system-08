
import { supabase } from './supabaseClient';
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
  // Return cached recipes if available
  if (cachedRecipes.length > 0) {
    return cachedRecipes;
  }
  
  // Fetch recipes with their ingredients using relationships
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      name,
      category,
      recipe_ingredients (
        inventoryItemId: inventory_item_id,
        amount
      )
    `);
  
  if (error) {
    console.error('Error fetching recipes:', error);
    // Return fallback data
    return [
      {
        id: 1,
        name: "Эспрессо",
        category: "coffee",
        ingredients: [
          { inventoryItemId: 1, amount: 0.008 },
          { inventoryItemId: 5, amount: 1 }
        ]
      },
      // ... reduced fallback data for simplicity
    ];
  }
  
  // Transform the data to match our Recipe type
  const recipes: Recipe[] = data.map((item: any) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    ingredients: item.recipe_ingredients || []
  }));
  
  // Cache the recipes
  cachedRecipes = recipes;
  return recipes;
};

// Function to refresh cache when needed
export const refreshRecipes = () => {
  cachedRecipes = [];
};
