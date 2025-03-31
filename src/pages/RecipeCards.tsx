
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RecipeCards = () => {
  // Demo data
  const recipes = [
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
  ];

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Ингредиенты</TableHead>
                  <TableHead>Способ приготовления</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.name}</TableCell>
                    <TableCell>{recipe.ingredients}</TableCell>
                    <TableCell>{recipe.preparation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecipeCards;
