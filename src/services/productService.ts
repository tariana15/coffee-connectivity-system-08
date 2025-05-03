import { ProductCategory } from "@/types/salary";
import recipeData from "../../techcard/texcard.json";
import { importProductsFromSheet, updateCashRegisterProducts, resetSalesStatistics } from "./googleSheetsService";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: { name: string; amount: number; unit: string }[];
}

// Predefined categories
export const productCategories: ProductCategory[] = [
  { id: "coffee", name: "Кофе классический", color: "#9C27B0" },
  { id: "nocoffee", name: "Не кофе", color: "#4CAF50" },
  { id: "author", name: "Авторские напитки", color: "#FF9800" },
  { id: "lemonade", name: "Авторские лимонады", color: "#2196F3" },
  { id: "dessert", name: "Десерты", color: "#E91E63" },
  { id: "drinks", name: "Напитки", color: "#00BCD4" },
  { id: "extra", name: "Доп продукция", color: "#9E9E9E" }
];

// Helper function to create products from recipe data
export const getProductsFromRecipes = (): Product[] => {
  const products: Product[] = [];
  
  // Process recipe data to create products
  recipeData.forEach((recipe: any) => {
    const drinkType = recipe["#Вид напитка"] || "";
    const name = recipe["#Название"] || "";
    const ingredientsText = recipe["#Ингредиенты"] || "";
    
    // Skip if no name
    if (!name) return;
    
    // Determine category - fixed logic to match with RecipeCards
    let category = "extra";
    const drinkTypeLower = drinkType.toLowerCase();
    
    if (drinkTypeLower.includes("кофе") && drinkTypeLower.includes("классический")) {
      category = "coffee";
    } else if (drinkTypeLower.includes("чай")) {
      category = "nocoffee"; // чай goes in nocoffee category
    } else if (drinkTypeLower.includes("не кофе")) {
      category = "nocoffee";
    } else if (drinkTypeLower.includes("авторский")) {
      category = "author";
    } else if (drinkTypeLower.includes("лимонад")) {
      category = "lemonade";
    }
    
    // Parse ingredients 
    const ingredients = ingredientsText
      .split(",")
      .map(item => {
        const parts = item.trim().split(" ");
        let amount = 0;
        let unit = "";
        let name = "";
        
        if (parts.length >= 3) {
          amount = parseFloat(parts[0]) || 0;
          unit = parts[1];
          name = parts.slice(2).join(" ");
        } else if (parts.length === 2) {
          amount = parseFloat(parts[0]) || 1;
          unit = "";
          name = parts[1];
        } else {
          name = parts[0];
        }
        
        return { name, amount, unit };
      });
    
    // Generate random price based on category
    let price = 0;
    switch (category) {
      case "coffee":
        price = Math.round((Math.random() * 100 + 150) / 10) * 10;
        break;
      case "nocoffee":
        price = Math.round((Math.random() * 80 + 120) / 10) * 10;
        break;
      case "author":
        price = Math.round((Math.random() * 150 + 200) / 10) * 10;
        break;
      case "lemonade":
        price = Math.round((Math.random() * 100 + 180) / 10) * 10;
        break;
      default:
        price = Math.round((Math.random() * 100 + 100) / 10) * 10;
    }
    
    products.push({
      id: Math.random().toString(36).substring(2, 11),
      name,
      price,
      category,
      ingredients
    });
  });
  
  // Add predefined products for other categories
  
  // Desserts
  const desserts = [
    { name: "Батончик протеиновый", price: 120 },
    { name: "Мюсли", price: 90 },
    { name: "Протеиновый батончик", price: 150 },
    { name: "Трубочка", price: 80 },
    { name: "Круассан", price: 130 },
    { name: "Панкейк", price: 110 }
  ];
  
  desserts.forEach(item => {
    products.push({
      id: Math.random().toString(36).substring(2, 11),
      name: item.name,
      price: item.price,
      category: "dessert",
      ingredients: []
    });
  });
  
  // Drinks
  const drinks = [
    { name: "Вода негазированная", price: 80 },
    { name: "Сок", price: 100 },
    { name: "Вода газированная", price: 80 }
  ];
  
  drinks.forEach(item => {
    products.push({
      id: Math.random().toString(36).substring(2, 11),
      name: item.name,
      price: item.price,
      category: "drinks",
      ingredients: []
    });
  });
  
  // Extra products
  const extras = [
    { name: "Сироп", price: 30 },
    { name: "Доп молоко 100мл", price: 50 },
    { name: "Стаканчик", price: 20 },
    { name: "Растительное молоко", price: 80 },
    { name: "Добавка к чаю/кофе", price: 40 }
  ];
  
  extras.forEach(item => {
    products.push({
      id: Math.random().toString(36).substring(2, 11),
      name: item.name,
      price: item.price,
      category: "extra",
      ingredients: []
    });
  });
  
  return products;
};

// Function to get all products
export const getAllProducts = (): Product[] => {
  try {
    // First try to get from localStorage
    const storedProducts = localStorage.getItem('coffeeShopProducts');
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }
    
    // If not in localStorage, generate from recipes
    const products = getProductsFromRecipes();
    
    // Save to localStorage for future use
    localStorage.setItem('coffeeShopProducts', JSON.stringify(products));
    
    return products;
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
};

// Function to get products by category
export const getProductsByCategory = (categoryId: string): Product[] => {
  const allProducts = getAllProducts();
  return allProducts.filter(product => product.category === categoryId);
};

// Mock function to get sales data
export const getMockSalesData = () => {
  const categories = productCategories.map(cat => ({
    name: cat.name,
    value: Math.round(Math.random() * 50000) + 10000,
    color: cat.color
  }));
  
  const products = getAllProducts().map(product => ({
    id: product.id,
    name: product.name,
    quantity: Math.round(Math.random() * 50) + 5,
    category: product.category
  }));
  
  return {
    categories,
    products
  };
};

// Функция для обновления товаров из Google Sheets
export const updateProductsFromGoogleSheets = async (sheetId: string, range: string): Promise<void> => {
  try {
    // Импортируем товары из Google Sheets
    const importedProducts = await importProductsFromSheet(sheetId, range);
    
    // Преобразуем импортированные товары в формат Product
    const products: Product[] = importedProducts.map((item: any) => ({
      id: Math.random().toString(36).substring(2, 11),
      name: item.name,
      price: item.price,
      category: item.category,
      ingredients: []
    }));
    
    // Обновляем товары в кассе
    await updateCashRegisterProducts(products);
    
    // Сбрасываем статистику продаж
    resetSalesStatistics();
    
    // Сохраняем товары в localStorage
    localStorage.setItem('coffeeShopProducts', JSON.stringify(products));
  } catch (error) {
    console.error("Ошибка при обновлении товаров из Google Sheets:", error);
    throw error;
  }
};
