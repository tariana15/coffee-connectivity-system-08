
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const RecipeCards = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        // Using the Google Sheets API to fetch the data
        // The spreadsheet ID from the URL
        const spreadsheetId = "1nWyXFaS1G5LZ--C0nHxSy5lzU-9wa06DWoE7ucHRlj8";
        // Using the sheets API to get the data in CSV format
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data from Google Sheets');
        }
        
        const csvData = await response.text();
        const formattedData = parseCSV(csvData);
        setRecipes(formattedData);
      } catch (err) {
        console.error("Error fetching recipe data:", err);
        setError("Ошибка при загрузке данных. Пожалуйста, попробуйте позже.");
        // Fallback to demo data if there's an error
        setRecipes([
          {
            id: 1,
            name: "Капучино",
            ingredients: "Эспрессо (30 мл), Молоко (150 мл)",
            preparation: "1. Приготовить эспрессо. 2. Взбить молоко до пены. 3. Соединить."
          },
          {
            id: 2,
            name: "Латте",
            ingredients: "Эспрессо (30 мл), Молоко (200 мл)",
            preparation: "1. Приготовить эспрессо. 2. Взбить молоко. 3. Влить молоко в эспрессо."
          },
          {
            id: 3,
            name: "Американо",
            ingredients: "Эспрессо (30 мл), Вода (120 мл)",
            preparation: "1. Приготовить эспрессо. 2. Добавить горячую воду."
          },
          {
            id: 4,
            name: "Флэт Уайт",
            ingredients: "Эспрессо (60 мл), Молоко (120 мл)",
            preparation: "1. Приготовить двойной эспрессо. 2. Взбить молоко. 3. Соединить."
          },
          {
            id: 5,
            name: "Мокка",
            ingredients: "Эспрессо (30 мл), Молоко (150 мл), Шоколадный сироп (20 мл)",
            preparation: "1. Приготовить эспрессо. 2. Добавить шоколадный сироп. 3. Взбить молоко. 4. Соединить."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, []);

  // Function to parse CSV data
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const result = [];
    
    // Skip empty lines and header row
    for (let i = 1; i < lines.length; i++) {
      // Skip empty lines
      if (!lines[i].trim()) continue;
      
      // Handle quoted values and commas within quotes
      const row: string[] = [];
      let insideQuote = false;
      let currentValue = '';
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(currentValue.trim().replace(/^"|"$/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      if (currentValue.trim()) {
        row.push(currentValue.trim().replace(/^"|"$/g, ''));
      }
      
      // Create an object with the row data - match columns with expected data
      if (row.length >= 3) {
        result.push({
          id: i,
          category: row[0] || "", // #Вид напитка
          name: row[1] || "",     // #Название
          ingredients: row[2] || "", // #Ингредиенты
          preparation: row[3] || ""  // #Приготовление
        });
      }
    }
    
    return result;
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Техкарта</h1>
        <Card>
          <CardHeader>
            <CardTitle>Рецепты напитков</CardTitle>
            <CardDescription>
              Техкарта приготовления напитков для бариста
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка данных...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Категория</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Ингредиенты</TableHead>
                    <TableHead>Способ приготовления</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>{recipe.category}</TableCell>
                      <TableCell className="font-medium">{recipe.name}</TableCell>
                      <TableCell>{recipe.ingredients}</TableCell>
                      <TableCell>{recipe.preparation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecipeCards;
