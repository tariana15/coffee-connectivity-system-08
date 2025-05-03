import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import recipeData from "../../techcard/texcard.json";
import { ProductIngredient } from "@/types/salary";
import { useIsMobile } from "@/hooks/use-mobile";

interface Recipe {
  "#Вид напитка": string;
  "#Название": string;
  "#Ингредиенты": string;
  "#Приготовление": string;
  ingredients?: ProductIngredient[];
  category?: string;
}

const RecipeCards = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        
        const processedRecipes = recipeData.map((recipe: Recipe) => {
          const ingredientsText = recipe["#Ингредиенты"];
          const ingredientsList: ProductIngredient[] = ingredientsText
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
                name = parts[1];
              } else {
                name = parts[0];
              }
              
              return { name, amount, unit };
            });
          
          const drinkType = recipe["#Вид напитка"].toLowerCase();
          let category = "other";
          
          if (drinkType.includes("кофе") && drinkType.includes("классический")) {
            category = "coffee";
          } else if (drinkType.includes("чай")) {
            category = "tea";
          } else if (drinkType.includes("авторский напиток") || drinkType.includes("авторские напитки")) {
            category = "author";
          } else if (drinkType.includes("лимонад") || drinkType.includes("авторский лимонад")) {
            category = "lemonade";
          } else if (drinkType.includes("не кофе")) {
            category = "nocoffee";
          }
          
          return {
            ...recipe,
            ingredients: ingredientsList,
            category
          };
        });
        
        const drinkRecipes = processedRecipes.filter(recipe => 
          !recipe["#Вид напитка"].toLowerCase().includes("десерт") && 
          !recipe["#Вид напитка"].toLowerCase().includes("выпечка")
        );
        
        setRecipes(drinkRecipes);
      } catch (err) {
        setError("Ошибка при загрузке техкарты");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </MainLayout>
    );
  }

  const categories = ["all", "coffee", "tea", "nocoffee", "lemonade", "author"];
  const categoryNames = {
    all: "Все",
    coffee: "Кофе классический",
    tea: "Чай", 
    nocoffee: "Не кофе",
    lemonade: "Лимонады",
    author: "Авторские напитки"
  };

  const filteredRecipes = activeCategory === "all" 
    ? recipes 
    : recipes.filter(recipe => recipe.category === activeCategory);

  return (
    <MainLayout>
      <div className="container mx-auto py-2">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-4`}>Техкарта напитков</h1>
        
        <div className="w-full max-w-xs mb-4">
          <Select 
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryNames[category as keyof typeof categoryNames]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRecipes.map((recipe, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className={isMobile ? 'p-3' : 'p-4'}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>{recipe["#Название"]}</CardTitle>
                    <CardDescription className="text-xs">{recipe["#Вид напитка"]}</CardDescription>
                  </div>
                  <Badge 
                    className={`
                      ${recipe.category === 'coffee' ? 'bg-green-100 text-green-800' : ''}
                      ${recipe.category === 'tea' ? 'bg-blue-100 text-blue-800' : ''}
                      ${recipe.category === 'nocoffee' ? 'bg-orange-100 text-orange-800' : ''}
                      ${recipe.category === 'lemonade' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${recipe.category === 'author' ? 'bg-purple-100 text-purple-800' : ''}
                      ${recipe.category === 'other' ? 'bg-gray-100 text-gray-800' : ''}
                      ${isMobile ? 'text-xs px-1 py-0' : ''}
                    `}
                  >
                    {categoryNames[recipe.category as keyof typeof categoryNames] || recipe["#Вид напитка"]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className={isMobile ? 'p-3 pt-0' : 'p-4'}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Ингредиенты:</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{recipe["#Ингредиенты"]}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Приготовление:</h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} whitespace-pre-line`}>{recipe["#Приготовление"]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default RecipeCards;
